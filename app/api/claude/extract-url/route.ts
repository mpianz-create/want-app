import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export const maxDuration = 60 // scraping + extraction can exceed Vercel's 10s default

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Fetch page HTML via ScraperAPI (handles bot-blocking), direct fetch as fallback ──
async function scraperFetch(url: string, render: boolean): Promise<string | null> {
  const key = process.env.SCRAPER_API_KEY
  if (!key) return null
  try {
    const res = await fetch(
      `https://api.scraperapi.com/?api_key=${key}&url=${encodeURIComponent(url)}${render ? '&render=true' : ''}`,
      { signal: AbortSignal.timeout(render ? 45_000 : 20_000) }
    )
    if (res.ok) return await res.text()
  } catch { /* fall through */ }
  return null
}

async function directFetch(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(8_000),
    })
    if (res.ok) return await res.text()
  } catch { /* fall through */ }
  return null
}

// Does this HTML actually contain product metadata, or just an empty app shell?
function hasProductSignals(html: string): boolean {
  return /og:image|application\/ld\+json|product:price/i.test(html)
}

async function fetchPageHtml(url: string): Promise<string | null> {
  // Pass 1: fast scrape without JS rendering (1 credit)
  let html = await scraperFetch(url, false)
  if (html && hasProductSignals(html)) return html

  // Pass 2: JS-rendered scrape for SPA storefronts (10 credits, slower)
  const rendered = await scraperFetch(url, true)
  if (rendered && hasProductSignals(rendered)) return rendered

  // Pass 3: direct fetch for unblocked stores / missing API key
  const direct = await directFetch(url)
  if (direct && hasProductSignals(direct)) return direct

  // Return whatever we got, even if thin — Claude can still try
  return rendered || html || direct
}

// ── Pull the product metadata stores embed for Google/Pinterest ──
// JSON-LD Product blocks and OpenGraph tags contain the real name/price/image.
function extractMetadata(html: string) {
  const meta: Record<string, string> = {}

  // OpenGraph + product meta tags
  const metaRe = /<meta[^>]+(?:property|name)=["']([^"']+)["'][^>]+content=["']([^"']*)["']/gi
  const metaRe2 = /<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']([^"']+)["']/gi
  let m: RegExpExecArray | null
  while ((m = metaRe.exec(html))) { if (!meta[m[1]]) meta[m[1]] = m[2] }
  while ((m = metaRe2.exec(html))) { if (!meta[m[2]]) meta[m[2]] = m[1] }

  // <title>
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  if (titleMatch) meta['page:title'] = titleMatch[1].trim()

  // JSON-LD blocks (keep ones mentioning Product/offers, cap size)
  const jsonLd: string[] = []
  const ldRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  while ((m = ldRe.exec(html)) && jsonLd.length < 3) {
    const block = m[1].trim()
    if (/"@type"\s*:\s*"?(Product|Offer)/i.test(block)) jsonLd.push(block.slice(0, 4000))
  }

  const interesting = [
    'og:title','og:description','og:image','og:site_name','og:url','og:type',
    'product:price:amount','product:price:currency','og:price:amount',
    'twitter:title','twitter:image','twitter:data1','twitter:label1',
    'description','page:title',
  ]
  const compact: Record<string, string> = {}
  for (const k of interesting) if (meta[k]) compact[k] = meta[k].slice(0, 400)

  return { meta: compact, jsonLd }
}

export async function POST(request: Request) {
  // Auth required — scraping costs money, don't let anonymous traffic burn it
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await request.json()
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: 'Valid URL required' }, { status: 400 })
  }

  const html = await fetchPageHtml(url)
  let context: string
  let hasRealData = false

  if (html) {
    const { meta, jsonLd } = extractMetadata(html)
    hasRealData = Object.keys(meta).length > 0 || jsonLd.length > 0
    context = hasRealData
      ? `URL: ${url}\n\nPage metadata:\n${JSON.stringify(meta, null, 2)}\n\nStructured data (JSON-LD):\n${jsonLd.join('\n---\n') || 'none'}`
      : `URL: ${url}\n\n(The page returned no useful metadata — infer what you can from the URL itself.)`
  } else {
    context = `URL: ${url}\n\n(The page could not be fetched — infer what you can from the URL itself.)`
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    system: `You extract product details from e-commerce page metadata. Return ONLY valid JSON, no markdown fences:
{"name":"product name, cleaned (no store name, no SEO junk like '| Free Shipping')","store":"store/brand name","price":0,"category":"Fashion|Home|Beauty|Tech|Other","imageUrl":"absolute URL of the main product image from og:image or JSON-LD, or null","confident":true}
Rules:
- price: a number only, no currency symbols. Prefer JSON-LD offers price, then product:price:amount. If a price range, use the lower. If unknown, 0.
- imageUrl: must be an absolute http(s) URL. null if none found.
- confident: false if you are guessing from the URL alone rather than real metadata.`,
    messages: [{ role: 'user', content: context }],
  })

  const text = message.content.find((b) => b.type === 'text')
  if (!text || text.type !== 'text') return NextResponse.json({ error: 'No response' }, { status: 500 })

  try {
    const parsed = JSON.parse(text.text.replace(/```json|```/g, '').trim())
    return NextResponse.json({
      name: String(parsed.name || ''),
      store: String(parsed.store || ''),
      price: Number(parsed.price) || 0,
      category: ['Fashion','Home','Beauty','Tech','Other'].includes(parsed.category) ? parsed.category : 'Other',
      imageUrl: typeof parsed.imageUrl === 'string' && /^https?:\/\//.test(parsed.imageUrl) ? parsed.imageUrl : null,
      productUrl: url,
      confident: Boolean(parsed.confident) && hasRealData,
    })
  } catch {
    return NextResponse.json({ error: 'Could not parse product details' }, { status: 500 })
  }
}
