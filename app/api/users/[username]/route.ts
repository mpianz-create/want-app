import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq, and, desc, count, inArray } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(_: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  const rows = await db.select({
    id: schema.user.id, name: schema.user.name,
    username: schema.user.username, bio: schema.user.bio,
  }).from(schema.user).where(eq(schema.user.username, username.toLowerCase()))
  const profile = rows[0]
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [followerCount] = await db.select({ n: count() }).from(schema.follows).where(eq(schema.follows.followingId, profile.id))
  const [followingCount] = await db.select({ n: count() }).from(schema.follows).where(eq(schema.follows.followerId, profile.id))

  let isFollowing = false
  if (session?.user && session.user.id !== profile.id) {
    const f = await db.select().from(schema.follows)
      .where(and(eq(schema.follows.followerId, session.user.id), eq(schema.follows.followingId, profile.id)))
    isFollowing = f.length > 0
  }

  const items = await db.select().from(schema.items)
    .where(eq(schema.items.userId, profile.id))
    .orderBy(desc(schema.items.createdAt)).limit(60)

  const cols = await db.select().from(schema.collections).where(eq(schema.collections.userId, profile.id))
  const colIds = cols.map(c => c.id)
  const links = colIds.length > 0
    ? await db.select().from(schema.collectionItems).where(inArray(schema.collectionItems.collectionId, colIds))
    : []
  const collections = cols.map(c => ({ ...c, itemIds: links.filter(l => l.collectionId === c.id).map(l => l.itemId) }))

  return NextResponse.json({
    profile: { ...profile, followers: followerCount.n, following: followingCount.n, isFollowing, isMe: session?.user?.id === profile.id },
    items, collections,
  })
}
