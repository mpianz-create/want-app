'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { btn, colors, radius, font, space, CARD_HEIGHTS, strHash } from '@/lib/tokens'
import { Icon } from '@/components/ui/Icon'
import { ItemImage } from '@/components/ui/ItemImage'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHead } from '@/components/ui/SectionHead'
import type { Item, Collection } from '@/types'

interface ProfileData {
  profile: {
    id: string; name: string; username: string; bio: string | null
    followers: number; following: number; isFollowing: boolean; isMe: boolean
  }
  items: Item[]
  collections: Collection[]
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [followBusy, setFollowBusy] = useState(false)

  useEffect(() => {
    fetch(`/api/users/${username}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [username])

  const toggleFollow = async () => {
    if (!data || followBusy) return
    setFollowBusy(true)
    const wasFollowing = data.profile.isFollowing
    setData(d => d && ({ ...d, profile: { ...d.profile, isFollowing: !wasFollowing, followers: d.profile.followers + (wasFollowing ? -1 : 1) } }))
    try {
      const res = await fetch(`/api/users/${username}/follow`, { method: 'POST' })
      if (res.status === 401) { window.location.href = '/auth/signup'; return }
      if (!res.ok) throw new Error()
    } catch {
      setData(d => d && ({ ...d, profile: { ...d.profile, isFollowing: wasFollowing, followers: d.profile.followers + (wasFollowing ? 1 : -1) } }))
    }
    setFollowBusy(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, padding: `${space[8]}px 28px`, maxWidth: 1100, margin: '0 auto' }}>
        <SkeletonGrid heights={[260, 300, 230, 280]} />
      </div>
    )
  }

  if (notFound || !data) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <EmptyState icon="compass" title="Profile not found" subtitle="This account doesn't exist or hasn't set a username yet." />
        <Link href="/" style={{ ...btn('secondary'), textDecoration: 'none' }}>Back to WANT*</Link>
      </div>
    )
  }

  const { profile, items, collections } = data
  const initial = (profile.name || profile.username)[0]?.toUpperCase() ?? '?'

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      {/* Top bar */}
      <header style={{ height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', borderBottom: `1px solid ${colors.border}`, background: colors.card }}>
        <Link href="/" style={{ fontFamily: font.display, fontSize: 26, fontWeight: 400, letterSpacing: '-0.5px', color: colors.text, textDecoration: 'none' }}>
          WANT<span style={{ color: colors.pink }}>*</span>
        </Link>
        <Link href="/" style={{ ...btn('ghost'), textDecoration: 'none', fontSize: 12 }}>My board</Link>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: `${space[8]}px 28px` }}>
        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 36, flexWrap: 'wrap' }}>
          <div aria-hidden="true" style={{ width: 84, height: 84, borderRadius: '50%', background: colors.violetL, border: `2px solid ${colors.violet}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.display, fontSize: 38, color: colors.violet, flexShrink: 0 }}>
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ fontFamily: font.display, fontWeight: 400, fontSize: 32, margin: 0 }}>{profile.name}</h1>
            <div style={{ fontFamily: font.body, fontSize: 13, color: colors.text3, marginTop: 2 }}>@{profile.username}</div>
            {profile.bio && <p style={{ fontFamily: font.body, fontSize: 13, color: colors.text2, marginTop: 8, maxWidth: 440, lineHeight: 1.6 }}>{profile.bio}</p>}
            <div style={{ display: 'flex', gap: 18, marginTop: 10, fontFamily: font.body, fontSize: 13, color: colors.text3 }}>
              <span><strong style={{ color: colors.text }}>{items.length}</strong> saves</span>
              <span><strong style={{ color: colors.text }}>{profile.followers}</strong> followers</span>
              <span><strong style={{ color: colors.text }}>{profile.following}</strong> following</span>
            </div>
          </div>
          {!profile.isMe && (
            <button onClick={toggleFollow} disabled={followBusy}
              style={{ ...btn(profile.isFollowing ? 'secondary' : 'primary'), padding: '11px 26px', fontSize: 14 }}>
              <Icon name={profile.isFollowing ? 'check' : 'plus'} size={15} />
              {profile.isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* Collections strip */}
        {collections.length > 0 && (
          <>
            <SectionHead label="Collections" />
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, marginBottom: 32 }}>
              {collections.map(col => {
                const colItems = col.itemIds.map(id => items.find(i => i.id === id)).filter(Boolean) as Item[]
                return (
                  <div key={col.id} style={{ minWidth: 180, borderRadius: radius.lg, border: `1px solid ${colors.border}`, background: colors.card, overflow: 'hidden', flexShrink: 0 }}>
                    {colItems.length === 0
                      ? <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, background: colors.bg3 }}>📦</div>
                      : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 90, overflow: 'hidden' }}>
                          {colItems.slice(0, 2).map(it => <div key={it.id} style={{ overflow: 'hidden' }}><ItemImage item={it} height={90} /></div>)}
                        </div>
                    }
                    <div style={{ padding: '10px 12px 12px' }}>
                      <div style={{ fontFamily: font.display, fontSize: 16 }}>{col.name}</div>
                      <div style={{ fontFamily: font.body, fontSize: 11, color: colors.text3 }}>{colItems.length} item{colItems.length !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Saves grid */}
        <SectionHead label={profile.isMe ? 'Your saves (public view)' : 'Saves'} />
        {items.length === 0
          ? <EmptyState icon="bookmark" title="Nothing saved yet" subtitle="Their wants will show up here." />
          : <div className="want-grid">
              {items.map(item => (
                <div key={item.id} style={{ borderRadius: radius.xl, overflow: 'hidden', border: `1px solid ${colors.border}`, background: colors.card }}>
                  <ItemImage item={item} height={CARD_HEIGHTS[strHash(item.id) % CARD_HEIGHTS.length]} />
                  <div style={{ padding: '12px 14px 14px' }}>
                    <div style={{ fontSize: 10, color: colors.text3, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4, fontWeight: 600, fontFamily: font.body }}>{item.store}</div>
                    <div style={{ fontSize: 13, color: colors.text, lineHeight: 1.4, fontWeight: 500, fontFamily: font.body }}>{item.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <span style={{ fontSize: 16, fontFamily: font.display, color: item.isSale ? colors.pink : colors.text }}>
                        ${item.isSale ? item.salePrice : item.price}
                      </span>
                      {item.productUrl && (
                        <a href={item.productUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${item.name} at ${item.store}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: colors.violet, textDecoration: 'none', fontFamily: font.body, fontWeight: 600 }}>
                          Shop <Icon name="external-link" size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}
