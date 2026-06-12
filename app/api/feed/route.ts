import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq, desc, inArray } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const following = await db.select({ id: schema.follows.followingId })
    .from(schema.follows).where(eq(schema.follows.followerId, session.user.id))
  if (following.length === 0) return NextResponse.json([])

  const ids = following.map(f => f.id)
  const rows = await db.select({
    item: schema.items,
    userName: schema.user.name,
    userUsername: schema.user.username,
  }).from(schema.items)
    .innerJoin(schema.user, eq(schema.items.userId, schema.user.id))
    .where(inArray(schema.items.userId, ids))
    .orderBy(desc(schema.items.createdAt))
    .limit(60)

  return NextResponse.json(rows.map(r => ({ ...r.item, by: { name: r.userName, username: r.userUsername } })))
}
