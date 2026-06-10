import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { auth } from '@/lib/auth'

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

async function ownsCollection(userId: string, colId: string) {
  const rows = await db.select().from(schema.collections)
    .where(and(eq(schema.collections.id, colId), eq(schema.collections.userId, userId)))
  return rows.length > 0
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!(await ownsCollection(user.id, id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()

  if (body.name?.trim()) {
    await db.update(schema.collections).set({ name: String(body.name).slice(0, 100) })
      .where(eq(schema.collections.id, id))
  }

  // Toggle an item in/out of the collection
  if (body.toggleItemId) {
    const itemId = String(body.toggleItemId)
    const existing = await db.select().from(schema.collectionItems)
      .where(and(eq(schema.collectionItems.collectionId, id), eq(schema.collectionItems.itemId, itemId)))
    if (existing.length > 0) {
      await db.delete(schema.collectionItems)
        .where(and(eq(schema.collectionItems.collectionId, id), eq(schema.collectionItems.itemId, itemId)))
    } else {
      await db.insert(schema.collectionItems).values({ collectionId: id, itemId })
    }
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!(await ownsCollection(user.id, id))) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.delete(schema.collections).where(eq(schema.collections.id, id))
  return NextResponse.json({ ok: true })
}
