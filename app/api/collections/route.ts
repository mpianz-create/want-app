import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { auth } from '@/lib/auth'

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cols = await db.select().from(schema.collections).where(eq(schema.collections.userId, user.id))
  const links = await db.select().from(schema.collectionItems)
  const colIds = new Set(cols.map(c => c.id))

  const result = cols.map(c => ({
    ...c,
    itemIds: links.filter(l => l.collectionId === c.id && colIds.has(l.collectionId)).map(l => l.itemId),
  }))
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  if (!body.name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const col = {
    id: crypto.randomUUID(),
    userId: user.id,
    name: String(body.name).slice(0, 100),
    createdAt: new Date(),
  }
  await db.insert(schema.collections).values(col)

  if (body.itemId) {
    await db.insert(schema.collectionItems).values({ collectionId: col.id, itemId: String(body.itemId) })
  }
  return NextResponse.json({ ...col, itemIds: body.itemId ? [body.itemId] : [] }, { status: 201 })
}
