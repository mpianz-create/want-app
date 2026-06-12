import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { like, or, ne, and, eq, sql } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = new URL(request.url).searchParams.get('q')?.trim().toLowerCase() ?? ''
  if (q.length < 2) return NextResponse.json([])

  const pattern = `%${q}%`
  const rows = await db.select({
    id: schema.user.id,
    name: schema.user.name,
    username: schema.user.username,
    bio: schema.user.bio,
  }).from(schema.user)
    .where(and(
      ne(schema.user.id, session.user.id),
      or(like(sql`lower(${schema.user.username})`, pattern), like(sql`lower(${schema.user.name})`, pattern)),
    ))
    .limit(20)

  // Mark which ones the viewer already follows
  const following = await db.select({ followingId: schema.follows.followingId })
    .from(schema.follows).where(eq(schema.follows.followerId, session.user.id))
  const followingSet = new Set(following.map(f => f.followingId))

  return NextResponse.json(rows.filter(r => r.username).map(r => ({ ...r, isFollowing: followingSet.has(r.id) })))
}
