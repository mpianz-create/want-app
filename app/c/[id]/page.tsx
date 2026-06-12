'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { btn, colors, radius, font, space, CARD_HEIGHTS, strHash } from '@/lib/tokens'
import { Icon } from '@/components/ui/Icon'
import { ItemImage } from '@/components/ui/ItemImage'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Item } from '@/types'

interface SharedCollection {
  collection: { id: string; name: string }
  owner: { name: string; username: string | null } | null
  items: Item[]
}

export default function SharedCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<SharedCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/collections/${id}/public`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [id])

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
        <EmptyState icon="folder-open" title="Collection not found" subtitle="This collection may have been deleted." />
        <Link href="/" style={{ ...btn('secondary'), textDecoration: 'none' }}>Back to WANT*</Link>
      </div>
    )
  }

  const { collection, owner, items } = data
  const totalVal = items.reduce((s, i) => s + (i.isSale ? i.salePrice! : i.price), 0)

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      {/* Top bar */}
      <header style={{ height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', borderBottom: `1px solid ${colors.border}`, background: colors.card }}>
        <Link href="/" style={{ fontFamily: font.display, fontSize: 26, fontWeight: 400, letterSpacing: '-0.5px', color: colors.text, textDecoration: 'none' }}>
          WANT<span style={{ color: colors.pink }}>*</span>
        </Link>
        <Link href="/auth/signup" style={{ ...btn('primary'), textDecoration: 'none', fontSize: 12 }}>Start your own wishlist</Link>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: `${space[8]}px 28px` }}>
        {/* Collection header — editorial */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: colors.pink, fontFamily: font.body, marginBottom: 14 }}>
            A WANT* collection
          </div>
          <h1 style={{ fontFamily: font.display, fontWeight: 400, fontSize: 'clamp(38px, 7vw, 64px)', lineHeight: 1.05, margin: 0 }}>
            {collection.name}
          </h1>
          {owner && (
            <p style={{ fontFamily: font.body, fontSize: 13, color: colors.text3, marginTop: 14 }}>
              curated by{' '}
              {owner.username
                ? <Link href={`/u/${owner.username}`} style={{ color: colors.violet, fontWeight: 600, textDecoration: 'none' }}>@{owner.username}</Link>
                : <span style={{ fontWeight: 600 }}>{owner.name}</span>
              }
              <span aria-hidden="true"> · </span>{items.length} item{items.length !== 1 ? 's' : ''}
              <span aria-hidden="true"> · </span>${totalVal.toLocaleString()} of wants
            </p>
          )}
        </div>

        {/* Items */}
        {items.length === 0
          ? <EmptyState icon="folder-open" title="Nothing here yet" subtitle="This collection is waiting for its first item." />
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

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: 56, paddingTop: 40, borderTop: `1px solid ${colors.border}` }}>
          <p style={{ fontFamily: font.display, fontStyle: 'italic', fontSize: 22, color: colors.text2, margin: 0 }}>
            want a board like this?
          </p>
          <Link href="/auth/signup" style={{ ...btn('primary'), textDecoration: 'none', marginTop: 18, padding: '12px 26px', fontSize: 14, display: 'inline-flex' }}>
            Create your free wishlist
          </Link>
        </div>
      </div>
    </div>
  )
}
