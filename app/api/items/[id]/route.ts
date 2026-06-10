import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { and, eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { auth } from '@/lib/auth'

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await request.json()
  const allowed: Record<string, unknown> = {}
  for (const k of ['name','store','price','salePrice','isSale','isPinned','isSaved','category','note','position','isNew'] as const) {
    if (k in body) allowed[k] = body[k]
  }

  await db.update(schema.items).set(allowed)
    .where(and(eq(schema.items.id, id), eq(schema.items.userId, user.id)))
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  await db.delete(schema.items)
    .where(and(eq(schema.items.id, id), eq(schema.items.userId, user.id)))
  return NextResponse.json({ ok: true })
}
