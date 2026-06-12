import { NextResponse } from 'next/server'
import { eq, inArray } from 'drizzle-orm'
import { db, schema } from '@/lib/db'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const cols = await db.select().from(schema.collections).where(eq(schema.collections.id, id))
  const col = cols[0]
  if (!col) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const owners = await db.select({
    name: schema.user.name,
    username: schema.user.username,
  }).from(schema.user).where(eq(schema.user.id, col.userId))
  const owner = owners[0]

  const links = await db.select().from(schema.collectionItems).where(eq(schema.collectionItems.collectionId, id))
  const itemIds = links.map(l => l.itemId)
  const items = itemIds.length > 0
    ? await db.select().from(schema.items).where(inArray(schema.items.id, itemIds))
    : []

  return NextResponse.json({
    collection: { id: col.id, name: col.name },
    owner: owner ? { name: owner.name, username: owner.username } : null,
    items,
  })
}
