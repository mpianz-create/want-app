import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const { aesthetics, budget_max } = await request.json()
  const budgetLine = budget_max > 0 ? `Budget strictly under $${budget_max} per item.` : 'No budget limit.'

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `Shopping stylist. ${budgetLine}
Return ONLY valid JSON:
{"sections":[{"label":"section title","items":[{"name":"","store":"","price":0,"category":"Fashion|Home|Beauty|Tech|Other","why":"one sentence"}]}]}
2 sections, 3 items each.`,
    messages: [{ role: 'user', content: `My vibes: ${aesthetics}. Find pieces that match.` }],
  })

  const text = message.content.find((b) => b.type === 'text')
  if (!text || text.type !== 'text') return NextResponse.json({ error: 'No response' }, { status: 500 })
  const parsed = JSON.parse(text.text.replace(/```json|```/g, '').trim())
  return NextResponse.json(parsed)
}
