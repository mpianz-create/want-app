'use client'
import { useState } from 'react'
import { btn, iconBtn, colors, radius, space, font, CARD_HEIGHTS } from '@/lib/tokens'
import { ItemImage } from './ItemImage'
import { Badge } from './Badge'
import type { Item, Collection } from '@/types'

interface Props {
  item: Item
  collections: Collection[]
  isDragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onDrop: () => void
  onTogglePin: () => void
  onToggleSaved: () => void
  onToggleCollection: (colId: string) => void
  onNewCollection: (itemId: number) => void
  onRemove: () => void
}

export function ProductCard({ item, collections, isDragging, onDragStart, onDragEnd, onDrop, onTogglePin, onToggleSaved, onToggleCollection, onNewCollection, onRemove }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const height = CARD_HEIGHTS[item.id % CARD_HEIGHTS.length]
  const inCols = collections.filter(c => c.itemIds.includes(item.id))

  return (
    <div
      style={{ borderRadius: radius.xl, overflow: 'visible', border: item.is_pinned ? `2px solid ${colors.violet}` : `1px solid ${colors.border}`, background: colors.card, cursor: 'grab', userSelect: 'none', position: 'relative', opacity: isDragging ? 0.4 : 1, transition: 'box-shadow .2s' }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
    >
      {item.is_pinned && (
        <div style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, background: colors.violet, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, zIndex: 3 }}>📌</div>
      )}

      <div style={{ borderRadius: radius.xl, overflow: 'hidden' }}>
        <div style={{ position: 'relative' }}>
          {item.is_sale && <Badge variant="sale">Sale</Badge>}
          {item.is_new && !item.is_sale && <Badge variant="new">New</Badge>}
          <ItemImage item={item} height={height} />
        </div>

        <div style={{ padding: '12px 14px 14px' }}>
          <div style={{ fontSize: 10, color: colors.text3, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4, fontWeight: 600 }}>{item.store}</div>
          <div style={{ fontSize: 13, color: colors.text, marginBottom: 8, lineHeight: 1.4, fontWeight: 500 }}>{item.name}</div>
          {item.note && <div style={{ fontSize: 11, color: colors.text3, marginBottom: 8, fontStyle: 'italic' }}>{item.note}</div>}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: font.display, color: item.is_sale ? colors.pink : colors.text }}>
              ${item.is_sale ? item.sale_price : item.price}
            </span>

            <div style={{ display: 'flex', gap: 4, position: 'relative' }}>
              <button style={iconBtn(item.is_pinned, colors.violet)} onClick={onTogglePin}><i className="ti ti-pin" /></button>
              <button style={iconBtn(item.is_saved, colors.pink)} onClick={onToggleSaved}><i className="ti ti-heart" /></button>

              <div style={{ position: 'relative' }}>
                <button style={iconBtn(inCols.length > 0, colors.violet)} onClick={() => setMenuOpen(v => !v)}><i className="ti ti-folder-plus" /></button>
                {menuOpen && (
                  <div
                    style={{ position: 'absolute', bottom: 36, right: 0, background: colors.card, border: `1px solid ${colors.border2}`, borderRadius: radius.lg, padding: space[1], zIndex: 50, minWidth: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                    onClick={e => e.stopPropagation()}
                  >
                    {collections.map(c => (
                      <div
                        key={c.id}
                        onClick={() => { onToggleCollection(c.id); setMenuOpen(false) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: inCols.find(x => x.id === c.id) ? colors.violet : colors.text, fontWeight: inCols.find(x => x.id === c.id) ? 600 : 400 }}
                      >
                        <i className={`ti ti-${inCols.find(x => x.id === c.id) ? 'check' : 'folder'}`} /> {c.name}
                      </div>
                    ))}
                    <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: 4, paddingTop: 4 }}>
                      <div onClick={() => { onNewCollection(item.id); setMenuOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: colors.lavender }}>
                        <i className="ti ti-plus" /> New collection
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button style={iconBtn()} onClick={onRemove}><i className="ti ti-trash" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
