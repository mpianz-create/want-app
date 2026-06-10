'use client'
import { useState } from 'react'
import { getPhotoId, unsplashUrl, CATEGORY_EMOJI } from '@/lib/tokens'
import type { Item } from '@/types'

interface Props {
  item: Item
  height: number
  overrideIdx?: number
}

export function ItemImage({ item, height, overrideIdx }: Props) {
  const [failed, setFailed] = useState(false)
  const emoji = CATEGORY_EMOJI[item.category] || '🛍️'
  // Real product image takes priority; curated Unsplash photo as fallback
  const src = item.imageUrl || unsplashUrl(getPhotoId(item.category, overrideIdx ?? item.id), 600, height * 2)

  return (
    <div style={{ height, overflow: 'hidden', background: 'var(--color-bg3)', flexShrink: 0 }}>
      {failed ? (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>{emoji}</div>
      ) : (
        <img
          src={src}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
