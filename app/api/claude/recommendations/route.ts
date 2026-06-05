import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const { items, budget_max } = await request.json()
  if (!items?.length) return NextResponse.json({ error: 'No items' }, { status: 400 })

  const profile = items
    .map((i: { name: string; store: string; price: number; is_sale: boolean; sale_price: number; category: string }) =>
      `${i.name} from ${i.store} ($${i.is_sale ? i.sale_price : i.price}, ${i.category})`)
    .join('; ')

  const budgetLine = budget_max > 0 ? `Budget strictly under $${budget_max} per item.` : 'No budget limit.'

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `Personal shopping assistant for WANT*, a fashion wishlist app. ${budgetLine}
Return ONLY valid JSON:
{"taste_summary":"one sentence","sections":[{"label":"section title","items":[{"name":"","store":"","price":0,"category":"Fashion|Home|Beauty|Tech|Other","why":"one sentence"}]}]}
2 sections, 3 items each. Real stores, specific products.`,
    messages: [{ role: 'user', content: `My saves: ${profile}. Give personalised picks.` }],
  })

  const text = message.content.find((b) => b.type === 'text')
  if (!text || text.type !== 'text') return NextResponse.json({ error: 'No response' }, { status: 500 })
  const parsed = JSON.parse(text.text.replace(/```json|```/g, '').trim())
  return NextResponse.json(parsed)
}
