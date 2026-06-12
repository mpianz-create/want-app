import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(_: Request, { params }: { params: Promise<{ username: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { username } = await params

  const rows = await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.username, username.toLowerCase()))
  const target = rows[0]
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (target.id === session.user.id) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })

  const existing = await db.select().from(schema.follows)
    .where(and(eq(schema.follows.followerId, session.user.id), eq(schema.follows.followingId, target.id)))

  if (existing.length > 0) {
    await db.delete(schema.follows)
      .where(and(eq(schema.follows.followerId, session.user.id), eq(schema.follows.followingId, target.id)))
    return NextResponse.json({ following: false })
  }
  await db.insert(schema.follows).values({ followerId: session.user.id, followingId: target.id, createdAt: new Date() })
  return NextResponse.json({ following: true })
}
