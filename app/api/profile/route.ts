import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { auth } from '@/lib/auth'

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 16) || 'user'
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.select().from(schema.user).where(eq(schema.user.id, session.user.id))
  const me = rows[0]
  if (!me) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // First visit: auto-assign a username so the profile is immediately shareable
  if (!me.username) {
    const base = slugify(me.name)
    let candidate = base
    for (let i = 0; i < 5; i++) {
      const clash = await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.username, candidate))
      if (clash.length === 0) break
      candidate = `${base}${Math.floor(1000 + Math.random() * 9000)}`
    }
    await db.update(schema.user).set({ username: candidate }).where(eq(schema.user.id, me.id))
    me.username = candidate
  }

  return NextResponse.json({ id: me.id, name: me.name, username: me.username, bio: me.bio ?? '' })
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const updates: Record<string, string> = {}

  if (typeof body.username === 'string') {
    const u = body.username.toLowerCase().trim()
    if (!/^[a-z0-9_]{3,20}$/.test(u)) {
      return NextResponse.json({ error: 'Username must be 3–20 characters: letters, numbers, underscores.' }, { status: 400 })
    }
    const clash = await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.username, u))
    if (clash.length > 0 && clash[0].id !== session.user.id) {
      return NextResponse.json({ error: 'That username is taken.' }, { status: 409 })
    }
    updates.username = u
  }
  if (typeof body.bio === 'string') updates.bio = body.bio.slice(0, 160)
  if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim().slice(0, 50)

  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  await db.update(schema.user).set(updates).where(eq(schema.user.id, session.user.id))
  return NextResponse.json({ ok: true })
}
