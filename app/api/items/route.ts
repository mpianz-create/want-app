import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq, desc } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { auth } from '@/lib/auth'

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.select().from(schema.items)
    .where(eq(schema.items.userId, user.id))
    .orderBy(desc(schema.items.isPinned), schema.items.position, desc(schema.items.createdAt))

  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (!body.name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const item = {
    id: crypto.randomUUID(),
    userId: user.id,
    name: String(body.name).slice(0, 200),
    store: String(body.store ?? '').slice(0, 100),
    price: Number(body.price) || 0,
    salePrice: body.salePrice != null ? Number(body.salePrice) : null,
    isSale: Boolean(body.isSale),
    isNew: true,
    isPinned: false,
    isSaved: false,
    category: ['Fashion','Home','Beauty','Tech','Other'].includes(body.category) ? body.category : 'Other',
    note: String(body.note ?? '').slice(0, 500),
    imageUrl: body.imageUrl ? String(body.imageUrl).slice(0, 1000) : null,
    productUrl: body.productUrl ? String(body.productUrl).slice(0, 1000) : null,
    position: 0,
    createdAt: new Date(),
  }
  await db.insert(schema.items).values(item)
  return NextResponse.json(item, { status: 201 })
}
