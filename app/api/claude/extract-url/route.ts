import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const { url } = await request.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    system: 'Extract product details from a URL. Return ONLY valid JSON: {"name":"","store":"","price":0,"category":"Fashion|Home|Beauty|Tech|Other"}.',
    messages: [{ role: 'user', content: `Extract from: ${url}` }],
  })

  const text = message.content.find((b) => b.type === 'text')
  if (!text || text.type !== 'text') return NextResponse.json({ error: 'No response' }, { status: 500 })
  const parsed = JSON.parse(text.text.replace(/```json|```/g, '').trim())
  return NextResponse.json(parsed)
}
