'use client'
import { btn, colors, font, CARD_HEIGHTS } from '@/lib/tokens'
import { ItemImage } from './ItemImage'
import type { RecItem, Item } from '@/types'

interface Props {
  item: RecItem
  idx: number
  saved: boolean
  onSave: () => void
}

export function RecCard({ item, idx, saved, onSave }: Props) {
  const height = 220 + (idx % 3) * 30
  // Build a minimal Item shape for ItemImage
  const fakeItem: Item = { id: idx + 100, name: item.name, store: item.store, price: item.price, sale_price: null, is_sale: false, is_new: false, is_pinned: false, is_saved: false, category: item.category, note: '' }

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${colors.border}`, background: colors.card }}>
      <ItemImage item={fakeItem} height={height} overrideIdx={idx} />
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontSize: 10, color: colors.text3, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4, fontWeight: 600 }}>{item.store}</div>
        <div style={{ fontSize: 13, color: colors.text, marginBottom: 4, lineHeight: 1.4, fontWeight: 500 }}>{item.name}</div>
        <div style={{ fontSize: 12, color: colors.text3, marginBottom: 10, fontStyle: 'italic', lineHeight: 1.5 }}>{item.why}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 700, fontFamily: font.display, color: colors.text }}>~${item.price}</span>
          <button
            style={{ ...btn(saved ? 'ghost' : 'primary'), fontSize: 11, padding: '6px 14px', borderRadius: 20 }}
            onClick={onSave}
            disabled={saved}
          >
            {saved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
