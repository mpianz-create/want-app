'use client'
import { useState, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Category = 'Fashion' | 'Home' | 'Beauty' | 'Tech' | 'Other'
type FilterType = 'all' | 'sale' | 'new' | 'under100' | 'saved'
type PageTab = 'saves' | 'collections' | 'explore'
type ExploreTab = 'foryou' | 'aesthetics'

interface Item {
  id: number; name: string; store: string; price: number
  sale_price: number | null; is_sale: boolean; is_new: boolean
  is_pinned: boolean; is_saved: boolean; category: Category
  note: string; image_keyword: string
}
interface Collection { id: string; name: string; itemIds: number[] }
interface RecItem { name: string; store: string; price: number; category: Category; why: string }
interface RecSection { label: string; items: RecItem[] }

// ─── Constants ────────────────────────────────────────────────────────────────
const EMOJIS: Record<string, string> = { Fashion: '👜', Home: '🕯️', Beauty: '💄', Tech: '📱', Other: '🛍️' }
const IMG_KEYWORDS: Record<string, string[]> = {
  Fashion: ['linen blazer fashion', 'leather handbag', 'silk dress editorial', 'tailored trousers woman'],
  Home: ['ceramic lamp home', 'candle interior decor', 'minimalist room', 'nordic interior'],
  Beauty: ['skincare serum bottle', 'face cream flatlay', 'sunscreen beauty', 'perfume bottle'],
  Tech: ['wireless headphones', 'laptop desk', 'earbuds product', 'camera minimal'],
  Other: ['fashion flatlay', 'product minimal', 'shopping aesthetic'],
}
const HEIGHTS = [160, 185, 145, 170, 155, 175, 140, 165]
const AESTHETICS = [
  { id: 'ql', name: 'quiet luxury', emoji: '🤍', bg: '#181510', desc: 'minimal. timeless. no logos.' },
  { id: 'da', name: 'dark academia', emoji: '🕯️', bg: '#0d0808', desc: 'tweed. candles. obsession.' },
  { id: 'cg', name: 'coastal grandma', emoji: '🌊', bg: '#071218', desc: 'linen. ocean. effortless.' },
  { id: 'cc', name: 'cottagecore', emoji: '🌿', bg: '#091408', desc: 'floral. wicker. whimsy.' },
  { id: 'clean', name: 'clean girl', emoji: '✨', bg: '#181510', desc: 'glowy. gold hoops. fresh.' },
  { id: 'y2k', name: 'y2k revival', emoji: '💿', bg: '#180830', desc: 'metallics. butterfly clips. chaos.' },
  { id: 'sw', name: 'streetwear', emoji: '🔥', bg: '#0a0a0a', desc: 'oversized. sneakers. attitude.' },
  { id: 'bh', name: 'boho chic', emoji: '🪬', bg: '#1a1008', desc: 'fringe. earthy. free-spirited.' },
]

const INITIAL_ITEMS: Item[] = [
  { id: 1, name: 'Linen Oversized Blazer', store: '& Other Stories', price: 149, sale_price: null, is_sale: false, is_new: false, is_pinned: true, is_saved: true, category: 'Fashion', note: '', image_keyword: 'linen blazer fashion' },
  { id: 2, name: 'Ceramic Table Lamp', store: 'Muji', price: 89, sale_price: 62, is_sale: true, is_new: true, is_pinned: false, is_saved: false, category: 'Home', note: 'For bedside table', image_keyword: 'ceramic lamp home' },
  { id: 3, name: 'Vitamin C Serum 20%', store: 'The Ordinary', price: 12, sale_price: null, is_sale: false, is_new: false, is_pinned: false, is_saved: true, category: 'Beauty', note: '', image_keyword: 'skincare serum bottle' },
  { id: 4, name: 'Leather Mini Shoulder Bag', store: 'ZARA', price: 69, sale_price: 45, is_sale: true, is_new: false, is_pinned: false, is_saved: false, category: 'Fashion', note: 'Want in black', image_keyword: 'leather handbag' },
  { id: 5, name: 'Noise-Cancelling Headphones', store: 'Sony', price: 349, sale_price: null, is_sale: false, is_new: false, is_pinned: false, is_saved: true, category: 'Tech', note: '', image_keyword: 'wireless headphones' },
  { id: 6, name: 'Beeswax Pillar Candle Set', store: 'Aesop', price: 48, sale_price: null, is_sale: false, is_new: true, is_pinned: false, is_saved: false, category: 'Home', note: '', image_keyword: 'candle interior decor' },
  { id: 7, name: 'High-Rise Tailored Trousers', store: 'COS', price: 115, sale_price: null, is_sale: false, is_new: true, is_pinned: false, is_saved: false, category: 'Fashion', note: 'Check sizing', image_keyword: 'tailored trousers woman' },
  { id: 8, name: 'SPF 50 Tinted Moisturiser', store: 'Fenty Skin', price: 38, sale_price: 26, is_sale: true, is_new: false, is_pinned: false, is_saved: true, category: 'Beauty', note: '', image_keyword: 'sunscreen beauty' },
]
const INITIAL_COLLECTIONS: Collection[] = [
  { id: 'c1', name: 'Summer fits ☀️', itemIds: [1, 4, 7] },
  { id: 'c2', name: 'Home refresh 🕯️', itemIds: [2, 6] },
]

function imgUrl(keyword: string, id: number, w = 400, h = 220) {
  return `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent(keyword)}&sig=${id}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function CardImg({ item, height }: { item: Item | RecItem & { id?: number }, height: number }) {
  const [failed, setFailed] = useState(false)
  const it = item as Item
  const keyword = it.image_keyword || IMG_KEYWORDS[it.category]?.[0] || 'fashion'
  const sig = it.id ?? Math.floor(Math.random() * 1000)
  const emoji = EMOJIS[it.category] || '🛍️'
  return (
    <div style={{ height, position: 'relative', overflow: 'hidden' }}>
      {failed ? (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2c003e', fontSize: 32 }}>{emoji}</div>
      ) : (
        <img
          src={imgUrl(keyword, sig, 400, height)}
          alt={item.name}
          style={{ width: '100%', height, objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function WantApp() {
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS)
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS)
  const [nextId, setNextId] = useState(9)
  const [nextColId, setNextColId] = useState(3)
  const [page, setPage] = useState<PageTab>('saves')
  const [exTab, setExTab] = useState<ExploreTab>('foryou')
  const [catTab, setCatTab] = useState<string>('all')
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [budgetMax, setBudgetMax] = useState(0)
  const [viewingColId, setViewingColId] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [selectedAes, setSelectedAes] = useState<Set<string>>(new Set())
  const [recs, setRecs] = useState<RecSection[]>([])
  const [recSummary, setRecSummary] = useState('')
  const [aesRecs, setAesRecs] = useState<RecSection[]>([])
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [loadingAes, setLoadingAes] = useState(false)
  const [savedRecIds, setSavedRecIds] = useState<Set<string>>(new Set())
  const [modal, setModal] = useState<null | 'manual' | 'url'>(null)
  const [modalFields, setModalFields] = useState({ name: '', store: '', price: '', category: 'Fashion' as Category, note: '' })
  const [urlInput, setUrlInput] = useState('')
  const [urlStatus, setUrlStatus] = useState<{ type: 'idle' | 'loading' | 'ok' | 'err'; msg: string }>({ type: 'idle', msg: '' })
  const [renamingCol, setRenamingCol] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')
  const [dragSrc, setDragSrc] = useState<number | null>(null)

  // ── Filtering ──
  const filteredItems = items.filter(i => {
    if (catTab !== 'all' && i.category !== catTab) return false
    if (filter === 'sale' && !i.is_sale) return false
    if (filter === 'new' && !i.is_new) return false
    if (filter === 'under100' && (i.is_sale ? i.sale_price! : i.price) >= 100) return false
    if (filter === 'saved' && !i.is_saved) return false
    if (search) {
      const q = search.toLowerCase()
      return [i.name, i.store, i.category, i.note].some(f => f?.toLowerCase().includes(q))
    }
    return true
  })
  const pinnedItems = filteredItems.filter(i => i.is_pinned && !search)
  const boardItems = search ? filteredItems : filteredItems.filter(i => !i.is_pinned)

  // ── Stats ──
  const statItems = catTab === 'all' ? items : items.filter(i => i.category === catTab)
  const totalVal = statItems.reduce((s, i) => s + (i.is_sale ? i.sale_price! : i.price), 0)

  // ── Mutations ──
  const togglePin = (id: number) => setItems(prev => prev.map(i => i.id === id ? { ...i, is_pinned: !i.is_pinned } : i))
  const toggleSaved = (id: number) => setItems(prev => prev.map(i => i.id === id ? { ...i, is_saved: !i.is_saved } : i))
  const removeItem = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id))
    setCollections(prev => prev.map(c => ({ ...c, itemIds: c.itemIds.filter(x => x !== id) })))
  }
  const toggleItemInCol = (colId: string, itemId: number) => {
    setCollections(prev => prev.map(c => c.id !== colId ? c : {
      ...c, itemIds: c.itemIds.includes(itemId) ? c.itemIds.filter(x => x !== itemId) : [...c.itemIds, itemId]
    }))
  }
  const addItem = (fields: typeof modalFields) => {
    const id = nextId; setNextId(n => n + 1)
    const kws = IMG_KEYWORDS[fields.category] || IMG_KEYWORDS.Other
    setItems(prev => [{ id, name: fields.name, store: fields.store, price: parseFloat(fields.price) || 0, sale_price: null, is_sale: false, is_new: true, is_pinned: false, is_saved: false, category: fields.category, note: fields.note, image_keyword: kws[id % kws.length] }, ...prev])
    setModal(null); setModalFields({ name: '', store: '', price: '', category: 'Fashion', note: '' })
  }
  const saveRec = (rec: RecItem, rid: string) => {
    if (savedRecIds.has(rid)) return
    setSavedRecIds(prev => new Set([...prev, rid]))
    const id = nextId; setNextId(n => n + 1)
    const kws = IMG_KEYWORDS[rec.category] || IMG_KEYWORDS.Other
    setItems(prev => [{ id, name: rec.name, store: rec.store, price: rec.price, sale_price: null, is_sale: false, is_new: true, is_pinned: false, is_saved: false, category: rec.category, note: 'from explore', image_keyword: kws[id % kws.length] }, ...prev])
  }

  // ── AI calls ──
  const loadRecs = useCallback(async () => {
    setLoadingRecs(true); setRecs([]); setSavedRecIds(new Set())
    try {
      const res = await fetch('/api/claude/recommendations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.slice(0, 50), budget_max: budgetMax })
      })
      const data = await res.json()
      setRecs(data.sections || [])
      setRecSummary(data.taste_summary || '')
    } catch { setRecs([]) }
    setLoadingRecs(false)
  }, [items, budgetMax])

  const loadAesRecs = useCallback(async () => {
    setLoadingAes(true); setAesRecs([])
    const selected = AESTHETICS.filter(a => selectedAes.has(a.id))
    const desc = selected.map(a => `${a.name} (${a.desc})`).join('; ')
    try {
      const res = await fetch('/api/claude/aesthetics', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aesthetics: desc, budget_max: budgetMax })
      })
      const data = await res.json()
      setAesRecs(data.sections || [])
    } catch { setAesRecs([]) }
    setLoadingAes(false)
  }, [selectedAes, budgetMax])

  const fetchFromUrl = useCallback(async () => {
    if (!urlInput.trim()) return
    setUrlStatus({ type: 'loading', msg: 'Claude is reading the page…' })
    try {
      const res = await fetch('/api/claude/extract-url', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput })
      })
      const data = await res.json()
      setModalFields({ name: data.name || '', store: data.store || '', price: String(data.price || ''), category: data.category || 'Fashion', note: '' })
      setUrlStatus({ type: 'ok', msg: 'Done! Review and save.*' })
    } catch { setUrlStatus({ type: 'err', msg: 'Could not extract. Fill in manually.' }) }
  }, [urlInput])

  // ── Drag-drop ──
  const onDragStart = (id: number) => setDragSrc(id)
  const onDragOver = (e: React.DragEvent) => e.preventDefault()
  const onDrop = (targetId: number) => {
    if (dragSrc === null || dragSrc === targetId) return
    setItems(prev => {
      const arr = [...prev]
      const si = arr.findIndex(i => i.id === dragSrc)
      const ti = arr.findIndex(i => i.id === targetId)
      const [m] = arr.splice(si, 1); arr.splice(ti, 0, m)
      return arr
    })
    setDragSrc(null)
  }

  // ── Collections ──
  const viewingCol = viewingColId ? collections.find(c => c.id === viewingColId) : null
  const viewingColItems = viewingCol ? viewingCol.itemIds.map(id => items.find(i => i.id === id)).filter(Boolean) as Item[] : []

  // ── Taste chips ──
  const cats: Record<string, number> = {}; const stores: Record<string, number> = {}
  items.forEach(i => { cats[i.category] = (cats[i.category] || 0) + 1; stores[i.store] = (stores[i.store] || 0) + 1 })
  const topCats = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0])
  const topStores = Object.entries(stores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0])

  // ── Shared styles ──
  const s = {
    nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: '0.5px solid rgba(255,224,245,0.08)', background: 'var(--dk2)' } as React.CSSProperties,
    pageTab: (active: boolean): React.CSSProperties => ({ padding: '11px 16px', fontSize: 12, color: active ? 'var(--w)' : 'var(--lv2)', cursor: 'pointer', borderBottom: active ? '2px solid var(--p)' : '2px solid transparent', fontFamily: active ? 'Syne, sans-serif' : 'inherit', fontWeight: active ? 800 : 400, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }),
    card: { borderRadius: 14, overflow: 'visible', border: '0.5px solid rgba(255,224,245,0.14)', background: 'var(--dk2)', cursor: 'grab', userSelect: 'none', transition: 'all .15s', position: 'relative' } as React.CSSProperties,
    iconBtn: (active?: boolean, color?: string): React.CSSProperties => ({ width: 26, height: 26, borderRadius: '50%', border: active ? `0.5px solid ${color || 'var(--p)'}` : '0.5px solid rgba(255,224,245,0.14)', background: active ? (color ? `${color}22` : 'var(--pl)') : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? (color || 'var(--p)') : 'var(--lv2)', fontSize: 13, transition: 'all .15s' }),
    pill: (active: boolean): React.CSSProperties => ({ padding: '5px 12px', borderRadius: 16, border: active ? 'none' : '0.5px solid rgba(255,224,245,0.14)', fontSize: 11, color: active ? '#fff' : 'var(--lv2)', cursor: 'pointer', background: active ? 'var(--p)' : 'transparent', fontFamily: 'inherit', whiteSpace: 'nowrap' }),
    btn: (color = 'var(--p)'): React.CSSProperties => ({ background: color, color: color === 'var(--y)' ? 'var(--dk)' : '#fff', border: 'none', borderRadius: 20, padding: '8px 16px', fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }),
    input: { width: '100%', padding: '9px 12px', border: '0.5px solid rgba(255,224,245,0.14)', borderRadius: 10, fontFamily: 'inherit', fontSize: 13, color: 'var(--w)', background: '#2c003e', outline: 'none' } as React.CSSProperties,
    label: { fontSize: 10, color: 'var(--lv2)', display: 'block', marginBottom: 3, marginTop: 12, letterSpacing: '.8px', textTransform: 'uppercase' as const },
  }

  // ── Render card ──
  const renderCard = (item: Item) => {
    const h = HEIGHTS[item.id % HEIGHTS.length]
    const colCount = collections.filter(c => c.itemIds.includes(item.id)).length
    const inCols = collections.filter(c => c.itemIds.includes(item.id))
    return (
      <div key={item.id} data-id={item.id} style={{ ...s.card, ...(dragSrc === item.id ? { opacity: 0.3 } : {}), ...(item.is_pinned ? { borderColor: 'rgba(255,224,0,0.4)', boxShadow: '0 0 0 1px rgba(255,224,0,0.12)' } : {}) }}
        draggable onDragStart={() => onDragStart(item.id)} onDragEnd={() => setDragSrc(null)} onDragOver={onDragOver} onDrop={() => onDrop(item.id)}>
        {item.is_pinned && <div style={{ position: 'absolute', top: -7, right: -7, width: 22, height: 22, background: 'var(--y)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, zIndex: 3, border: '2px solid var(--dk)' }}>📌</div>}
        <div style={{ borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ position: 'relative' }}>
            {item.is_sale && <span style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, background: 'var(--p)', color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 10, fontFamily: 'Syne, sans-serif' }}>universe said go</span>}
            {item.is_new && !item.is_sale && <span style={{ position: 'absolute', top: 8, left: 8, zIndex: 2, background: 'var(--y)', color: 'var(--dk)', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 10, fontFamily: 'Syne, sans-serif' }}>just dropped</span>}
            <CardImg item={item} height={h} />
          </div>
          <div style={{ padding: '10px 12px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--lv2)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 3 }}>{item.store}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--w)', marginBottom: 6, lineHeight: 1.35 }}>{item.name}</div>
            {item.note && <div style={{ fontSize: 10, color: 'var(--lv2)', marginBottom: 5, fontStyle: 'italic' }}>{item.note}</div>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Syne, sans-serif', letterSpacing: '-.5px', color: item.is_sale ? 'var(--p)' : 'var(--w)' }}>
                ${item.is_sale ? item.sale_price : item.price}
              </span>
              <div style={{ display: 'flex', gap: 4, position: 'relative' }}>
                <button style={s.iconBtn(item.is_pinned, 'var(--y)')} onClick={() => togglePin(item.id)} title="pin"><i className="ti ti-pin" /></button>
                <button style={s.iconBtn(item.is_saved)} onClick={() => toggleSaved(item.id)} title="obsessed"><i className="ti ti-heart" /></button>
                <div style={{ position: 'relative' }}>
                  <button style={s.iconBtn(colCount > 0, 'var(--v)')} onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)} title="add to collection"><i className="ti ti-folder-plus" /></button>
                  {openMenu === item.id && (
                    <div style={{ position: 'absolute', bottom: 32, right: 0, background: 'var(--dk2)', border: '0.5px solid rgba(255,224,245,0.14)', borderRadius: 12, padding: 6, zIndex: 50, minWidth: 190, boxShadow: '0 8px 24px rgba(0,0,0,.5)' }} onClick={e => e.stopPropagation()}>
                      {collections.map(c => (
                        <div key={c.id} onClick={() => { toggleItemInCol(c.id, item.id); setOpenMenu(null) }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: inCols.find(x => x.id === c.id) ? 'var(--y)' : 'var(--w)', background: 'transparent' }}>
                          <i className={`ti ti-${inCols.find(x => x.id === c.id) ? 'check' : 'folder-plus'}`} /> {c.name}
                        </div>
                      ))}
                      <div style={{ borderTop: '0.5px solid rgba(255,224,245,0.08)', marginTop: 4, paddingTop: 4 }}>
                        <div onClick={() => { const n = prompt('Collection name:'); if (n?.trim()) { const id = 'c' + (nextColId); setNextColId(x => x + 1); setCollections(prev => [...prev, { id, name: n.trim(), itemIds: [item.id] }]); setOpenMenu(null) } }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--lv)' }}>
                          <i className="ti ti-plus" /> new collection
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button style={s.iconBtn()} onClick={() => removeItem(item.id)} title="remove"><i className="ti ti-trash" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderRecCard = (item: RecItem, idx: number, prefix: string) => {
    const rid = `${prefix}-${idx}`
    const h = HEIGHTS[idx % HEIGHTS.length]
    const kws = IMG_KEYWORDS[item.category] || IMG_KEYWORDS.Other
    const imgItem = { ...item, id: idx + 200, image_keyword: kws[idx % kws.length] }
    const done = savedRecIds.has(rid)
    return (
      <div key={rid} style={{ borderRadius: 12, overflow: 'hidden', border: '0.5px solid rgba(255,224,245,0.14)', background: 'var(--dk2)' }}>
        <CardImg item={imgItem as unknown as Item} height={h} />
        <div style={{ padding: '9px 11px 11px' }}>
          <div style={{ fontSize: 10, color: 'var(--lv2)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 2 }}>{item.store}</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--w)', marginBottom: 3, lineHeight: 1.35 }}>{item.name}</div>
          <div style={{ fontSize: 11, color: 'var(--lv2)', marginBottom: 7, fontStyle: 'italic', lineHeight: 1.4 }}>{item.why}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--w)' }}>~${item.price}</span>
            <button style={{ ...s.btn(), fontSize: 10, padding: '5px 12px', background: done ? 'var(--v)' : 'var(--p)', borderRadius: 14 }} onClick={() => saveRec(item, rid)} disabled={done}>
              {done ? 'wanted ✓' : 'want it'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const SkeletonCard = ({ h }: { h: number }) => (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '0.5px solid rgba(255,224,245,0.1)', background: 'var(--dk2)' }}>
      <div style={{ height: h, background: 'var(--dk3)', animation: 'pulse 1.4s ease-in-out infinite' }} />
      <div style={{ padding: '9px 11px 11px' }}>
        <div style={{ height: 10, borderRadius: 4, background: 'var(--dk3)', marginBottom: 6, width: '40%', animation: 'pulse 1.4s ease-in-out infinite' }} />
        <div style={{ height: 11, borderRadius: 4, background: 'var(--dk3)', marginBottom: 4, animation: 'pulse 1.4s ease-in-out infinite' }} />
        <div style={{ height: 11, borderRadius: 4, background: 'var(--dk3)', width: '60%', animation: 'pulse 1.4s ease-in-out infinite' }} />
      </div>
    </div>
  )

  // ── Render ──
  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .card:hover { border-color: rgba(255,46,172,.5) !important; }
        .icon-btn:hover { border-color: var(--p) !important; color: var(--p) !important; }
      `}</style>
      <div onClick={() => setOpenMenu(null)} style={{ minHeight: '100vh', background: 'var(--dk)' }}>
        <div style={{ maxWidth: 430, margin: '0 auto', background: 'var(--dk)', minHeight: '100vh', position: 'relative' }}>

          {/* NAV */}
          <div style={s.nav}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--w)' }}>
              WANT<span style={{ color: 'var(--y)' }}>*</span>
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...s.btn('transparent'), border: '0.5px solid rgba(255,224,0,0.25)', color: 'var(--y)', fontSize: 11, padding: '7px 13px' }} onClick={() => setModal('url')}>
                <i className="ti ti-link" /> import URL
              </button>
              <button style={{ ...s.btn('var(--p)'), fontSize: 11, padding: '7px 13px' }} onClick={() => setModal('manual')}>
                <i className="ti ti-plus" /> want it
              </button>
            </div>
          </div>

          {/* PAGE TABS */}
          <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,224,245,0.08)', background: 'var(--dk2)', overflowX: 'auto' }}>
            {(['saves', 'collections', 'explore'] as PageTab[]).map(p => (
              <div key={p} style={s.pageTab(page === p)} onClick={() => setPage(p)}>
                <i className={`ti ti-${p === 'saves' ? 'bookmark' : p === 'collections' ? 'folder' : 'sparkles'}`} />
                {p === 'saves' ? 'my wants' : p}
              </div>
            ))}
          </div>

          {/* ── SAVES PAGE ── */}
          {page === 'saves' && (
            <>
              {/* Search */}
              <div style={{ padding: '10px 20px', borderBottom: '0.5px solid rgba(255,224,245,0.08)', background: 'var(--dk2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--dk3)', border: '0.5px solid rgba(255,224,245,0.14)', borderRadius: 24, padding: '8px 14px' }}>
                  <i className="ti ti-search" style={{ color: 'var(--lv2)', fontSize: 15 }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search your wants…" style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, color: 'var(--w)', width: '100%' }} />
                  {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lv2)' }}><i className="ti ti-x" /></button>}
                </div>
                {search && <div style={{ fontSize: 11, color: 'var(--lv2)', paddingTop: 6 }}>{filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;</div>}
              </div>

              {/* Category tabs */}
              <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,224,245,0.08)', overflowX: 'auto', background: 'var(--dk2)' }}>
                {['all', 'Fashion', 'Home', 'Beauty', 'Tech'].map(c => (
                  <div key={c} onClick={() => setCatTab(c)} style={{ padding: '10px 14px', fontSize: 12, color: catTab === c ? 'var(--w)' : 'var(--lv2)', cursor: 'pointer', borderBottom: catTab === c ? '2px solid var(--v)' : '2px solid transparent', fontFamily: catTab === c ? 'Syne, sans-serif' : 'inherit', fontWeight: catTab === c ? 800 : 400, whiteSpace: 'nowrap' }}>
                    {c === 'all' ? 'all saves' : c.toLowerCase()}
                  </div>
                ))}
              </div>

              {/* Summary bar */}
              <div style={{ display: 'flex', gap: 8, padding: '10px 20px', background: 'var(--dk3)', borderBottom: '0.5px solid rgba(255,224,245,0.08)', overflowX: 'auto' }}>
                {[{ val: statItems.length, lbl: 'wants' }, { val: `$${totalVal.toLocaleString()}`, lbl: 'total value' }, { val: statItems.filter(i => i.is_saved).length, lbl: 'obsessed' }, { val: statItems.filter(i => i.is_sale).length, lbl: 'on sale' }].map(s => (
                  <div key={s.lbl} style={{ background: 'rgba(255,224,0,0.08)', borderRadius: 8, border: '0.5px solid rgba(255,224,0,0.18)', padding: '7px 13px', flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--y)' }}>{s.val}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,224,0,0.6)', marginTop: 1 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', padding: '8px 20px', gap: 6, overflowX: 'auto', background: 'var(--dk2)', borderBottom: '0.5px solid rgba(255,224,245,0.08)' }}>
                {([['all', 'all'], ['sale', 'sign from universe'], ['new', 'just dropped'], ['under100', 'under $100'], ['saved', 'obsessed ♡']] as [FilterType, string][]).map(([f, lbl]) => (
                  <button key={f} style={s.pill(filter === f)} onClick={() => setFilter(f)}>{lbl}</button>
                ))}
              </div>

              {/* Board header */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '14px 20px 6px', background: 'var(--dk)' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, letterSpacing: '-1px' }}>{catTab === 'all' ? 'all wants*' : `${catTab.toLowerCase()} wants`}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,224,245,0.3)' }}><i className="ti ti-drag-drop" /> drag to reorder</span>
              </div>

              {/* Pinned section */}
              {pinnedItems.length > 0 && (
                <div style={{ padding: '0 20px 8px', background: 'var(--dk)' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--y)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10, fontFamily: 'Syne, sans-serif' }}>
                    <i className="ti ti-pin" /> obsessed with
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                    {pinnedItems.map(renderCard)}
                  </div>
                  <div style={{ height: '0.5px', background: 'rgba(255,224,245,0.1)', margin: '12px 0 0' }} />
                </div>
              )}

              {/* Board grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, padding: '12px 20px 24px', background: 'var(--dk)' }}>
                {boardItems.length === 0 && pinnedItems.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 20px', color: 'var(--lv2)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
                    <p style={{ fontSize: 13 }}>{search ? `no results for "${search}"*` : 'nothing here yet. fix that.*'}</p>
                  </div>
                ) : boardItems.map(renderCard)}
              </div>
            </>
          )}

          {/* ── COLLECTIONS PAGE ── */}
          {page === 'collections' && (
            <>
              {!viewingColId ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '0.5px solid rgba(255,224,245,0.08)', background: 'var(--dk2)' }}>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800 }}>collections*</span>
                    <button style={s.btn('var(--v)')} onClick={() => { const n = prompt('Name your collection:'); if (n?.trim()) { setCollections(prev => [...prev, { id: 'c' + nextColId, name: n.trim(), itemIds: [] }]); setNextColId(x => x + 1) } }}>
                      <i className="ti ti-plus" /> new
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, padding: '16px 20px', background: 'var(--dk)' }}>
                    {collections.length === 0 ? (
                      <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 48, color: 'var(--lv2)', fontSize: 13 }}>no collections yet.*</div>
                    ) : collections.map(col => {
                      const colItems = col.itemIds.map(id => items.find(i => i.id === id)).filter(Boolean) as Item[]
                      return (
                        <div key={col.id} onClick={() => setViewingColId(col.id)} style={{ borderRadius: 14, border: '0.5px solid rgba(255,224,245,0.14)', background: 'var(--dk2)', overflow: 'hidden', cursor: 'pointer' }}>
                          {colItems.length === 0 ? (
                            <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, background: 'var(--dk3)' }}>📦</div>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 100, overflow: 'hidden' }}>
                              {colItems.slice(0, 4).map(it => (
                                <div key={it.id} style={{ overflow: 'hidden' }}>
                                  <ColPreviewImg item={it} />
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ padding: '10px 12px 12px' }}>
                            {renamingCol === col.id ? (
                              <input value={renameVal} onChange={e => setRenameVal(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { setCollections(prev => prev.map(c => c.id === col.id ? { ...c, name: renameVal.trim() || c.name } : c)); setRenamingCol(null) } if (e.key === 'Escape') setRenamingCol(null) }}
                                onBlur={() => { setCollections(prev => prev.map(c => c.id === col.id ? { ...c, name: renameVal.trim() || c.name } : c)); setRenamingCol(null) }}
                                autoFocus onClick={e => e.stopPropagation()}
                                style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 800, color: 'var(--w)', border: 'none', outline: 'none', borderBottom: '1.5px solid var(--v)', background: 'transparent', width: '100%' }} />
                            ) : (
                              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 800, color: 'var(--w)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{col.name}</div>
                            )}
                            <div style={{ fontSize: 11, color: 'var(--lv2)', marginBottom: 8 }}>{colItems.length} want{colItems.length !== 1 ? 's' : ''}</div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button style={{ fontSize: 11, padding: '4px 10px', borderRadius: 12, border: '0.5px solid rgba(255,224,245,0.14)', background: 'transparent', cursor: 'pointer', color: 'var(--lv2)', fontFamily: 'inherit' }}
                                onClick={e => { e.stopPropagation(); setRenamingCol(col.id); setRenameVal(col.name) }}>
                                <i className="ti ti-pencil" /> rename
                              </button>
                              <button style={{ fontSize: 11, padding: '4px 10px', borderRadius: 12, border: '0.5px solid rgba(255,224,245,0.14)', background: 'transparent', cursor: 'pointer', color: 'var(--lv2)', fontFamily: 'inherit' }}
                                onClick={e => { e.stopPropagation(); if (confirm('Delete this collection?')) setCollections(prev => prev.filter(c => c.id !== col.id)) }}>
                                <i className="ti ti-trash" /> delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div style={{ padding: '0 20px 24px', background: 'var(--dk)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0 10px', borderBottom: '0.5px solid rgba(255,224,245,0.08)', marginBottom: 14 }}>
                    <button onClick={() => setViewingColId(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--lv2)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="ti ti-arrow-left" /> back
                    </button>
                    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, flex: 1 }}>{viewingCol?.name}</span>
                  </div>
                  {viewingColItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--lv2)', fontSize: 12 }}>nothing here yet. fix that.*</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                      {viewingColItems.map(item => (
                        <div key={item.id} style={{ borderRadius: 10, overflow: 'hidden', border: '0.5px solid rgba(255,224,245,0.12)', background: 'var(--dk2)', position: 'relative' }}>
                          <div style={{ overflow: 'hidden', height: 80 }}>
                            <img src={imgUrl(item.image_keyword, item.id, 200, 120)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                          </div>
                          <div style={{ padding: '7px 9px 9px' }}>
                            <div style={{ fontSize: 11, color: 'var(--w)', marginBottom: 2, lineHeight: 1.3 }}>{item.name}</div>
                            <div style={{ fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--lv2)' }}>${item.is_sale ? item.sale_price : item.price}</div>
                          </div>
                          <button onClick={() => { setCollections(prev => prev.map(c => c.id === viewingColId ? { ...c, itemIds: c.itemIds.filter(x => x !== item.id) } : c)) }} style={{ position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: '50%', background: 'rgba(26,0,40,0.8)', border: '0.5px solid rgba(255,224,245,0.14)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--lv2)' }}>
                            <i className="ti ti-x" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── EXPLORE PAGE ── */}
          {page === 'explore' && (
            <>
              <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,224,245,0.08)', background: 'var(--dk2)', padding: '0 20px' }}>
                {(['foryou', 'aesthetics'] as ExploreTab[]).map(t => (
                  <div key={t} style={{ padding: '11px 16px', fontSize: 12, color: exTab === t ? 'var(--w)' : 'var(--lv2)', cursor: 'pointer', borderBottom: exTab === t ? '2px solid var(--p)' : '2px solid transparent', fontFamily: exTab === t ? 'Syne, sans-serif' : 'inherit', fontWeight: exTab === t ? 800 : 400, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <i className={`ti ti-${t === 'foryou' ? 'heart' : 'palette'}`} />
                    {t === 'foryou' ? 'for you' : 'aesthetics'}
                  </div>
                ))}
              </div>

              <div style={{ padding: '16px 20px 24px', background: 'var(--dk)' }}>
                {/* Budget controls (shared) */}
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--lv2)' }}>budget:</span>
                  {[[50, 'under $50'], [100, 'under $100'], [250, 'under $250'], [0, 'no limit*']] .map(([v, lbl]) => (
                    <button key={v} style={s.pill(budgetMax === v)} onClick={() => setBudgetMax(Number(v))}>{lbl}</button>
                  ))}
                </div>

                {/* FOR YOU */}
                {exTab === 'foryou' && (
                  <>
                    <div style={{ background: 'var(--dk2)', borderRadius: 16, padding: '18px 20px', marginBottom: 20, border: '0.5px solid rgba(255,224,245,0.14)' }}>
                      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '-1.2px', marginBottom: 4 }}>picked for you*</h2>
                      <p style={{ fontSize: 12, color: 'var(--lv2)', marginBottom: 14, lineHeight: 1.6 }}>
                        {recSummary || 'Claude reads your saves and finds what you didn\'t know you wanted yet.*'}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                        {[...topCats.map(c => c.toLowerCase()), ...topStores].map(chip => (
                          <span key={chip} style={{ padding: '4px 12px', borderRadius: 16, background: 'var(--vl)', border: '0.5px solid rgba(123,0,255,0.3)', fontSize: 11, color: 'var(--lv)' }}>{chip}</span>
                        ))}
                      </div>
                      <button style={s.btn('var(--p)')} onClick={loadRecs} disabled={loadingRecs}>
                        <i className={`ti ti-${loadingRecs ? 'loader' : 'sparkles'}`} />
                        {loadingRecs ? 'reading your taste…' : recs.length ? 'refresh picks' : 'generate picks'}
                      </button>
                    </div>
                    {loadingRecs && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                        {[150, 170, 145, 160, 175, 150].map((h, i) => <SkeletonCard key={i} h={h} />)}
                      </div>
                    )}
                    {!loadingRecs && recs.map((sec, si) => (
                      <div key={si} style={{ marginBottom: 22 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--lv2)', marginBottom: 12, fontFamily: 'Syne, sans-serif' }}>{sec.label}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                          {sec.items.map((item, ii) => renderRecCard(item, si * 3 + ii, `rec-${si}`))}
                        </div>
                      </div>
                    ))}
                    {!loadingRecs && recs.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--lv2)' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🧭</div>
                        <p style={{ fontSize: 13 }}>generate your picks.*</p>
                      </div>
                    )}
                  </>
                )}

                {/* AESTHETICS */}
                {exTab === 'aesthetics' && (
                  <>
                    <p style={{ fontSize: 12, color: 'var(--lv2)', marginBottom: 16, lineHeight: 1.6 }}>pick your vibe. we&apos;ll find the pieces.*</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 18 }}>
                      {AESTHETICS.map(a => {
                        const sel = selectedAes.has(a.id)
                        return (
                          <div key={a.id} onClick={() => setSelectedAes(prev => { const n = new Set(prev); sel ? n.delete(a.id) : n.add(a.id); return n })}
                            style={{ borderRadius: 12, overflow: 'hidden', border: `2px solid ${sel ? 'var(--p)' : 'rgba(255,224,245,0.14)'}`, cursor: 'pointer', background: 'var(--dk2)', position: 'relative', boxShadow: sel ? '0 0 0 1px rgba(255,46,172,0.2)' : 'none' }}>
                            {sel && <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, background: 'var(--p)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, zIndex: 2 }}><i className="ti ti-check" /></div>}
                            <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, background: a.bg }}>{a.emoji}</div>
                            <div style={{ padding: '9px 11px 12px' }}>
                              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 800, color: 'var(--w)', marginBottom: 2 }}>{a.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--lv2)', lineHeight: 1.4 }}>{a.desc}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                      <span style={{ fontSize: 12, color: 'var(--lv2)' }}>
                        {selectedAes.size === 0 ? 'select at least one vibe' : <><strong style={{ color: 'var(--w)' }}>{selectedAes.size}</strong> vibe{selectedAes.size !== 1 ? 's' : ''} selected</>}
                      </span>
                      <button style={s.btn('var(--p)')} onClick={loadAesRecs} disabled={selectedAes.size === 0 || loadingAes}>
                        <i className={`ti ti-${loadingAes ? 'loader' : 'sparkles'}`} />
                        {loadingAes ? 'finding your vibe…' : 'shop this vibe'}
                      </button>
                    </div>
                    {loadingAes && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                        {[150, 170, 145].map((h, i) => <SkeletonCard key={i} h={h} />)}
                      </div>
                    )}
                    {!loadingAes && aesRecs.map((sec, si) => (
                      <div key={si} style={{ marginBottom: 22 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--lv2)', marginBottom: 12, fontFamily: 'Syne, sans-serif' }}>{sec.label}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                          {sec.items.map((item, ii) => renderRecCard(item, si * 3 + ii, `aes-${si}`))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}

          {/* ── MODALS ── */}
          {modal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setModal(null)}>
              <div style={{ background: 'var(--dk2)', borderRadius: 18, padding: '24px 26px', width: 360, maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', border: '0.5px solid rgba(255,224,245,0.14)' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, letterSpacing: '-1px', marginBottom: 4 }}>{modal === 'url' ? 'import from URL' : 'add a want*'}</h3>
                <p style={{ fontSize: 12, color: 'var(--lv2)', marginBottom: 16 }}>{modal === 'url' ? 'paste a link. claude reads the rest.*' : 'fill in the details.'}</p>

                {modal === 'url' && (
                  <>
                    <label style={s.label}>product URL</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://…" style={{ ...s.input, flex: 1 }} />
                      <button onClick={fetchFromUrl} disabled={urlStatus.type === 'loading'} style={{ ...s.btn('var(--v)'), borderRadius: 10, padding: '10px 14px', fontSize: 12, whiteSpace: 'nowrap' }}>
                        <i className="ti ti-sparkles" /> extract
                      </button>
                    </div>
                    {urlStatus.type !== 'idle' && (
                      <div style={{ fontSize: 12, marginTop: 8, padding: '8px 12px', borderRadius: 8, background: urlStatus.type === 'loading' ? 'var(--vl)' : urlStatus.type === 'ok' ? 'rgba(255,224,0,0.08)' : 'var(--pl)', color: urlStatus.type === 'ok' ? 'var(--y)' : urlStatus.type === 'err' ? 'var(--p)' : 'var(--lv)' }}>
                        {urlStatus.msg}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0', color: 'rgba(255,224,245,0.3)', fontSize: 11 }}>
                      <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,224,245,0.14)' }} />or fill in manually<div style={{ flex: 1, height: '0.5px', background: 'rgba(255,224,245,0.14)' }} />
                    </div>
                  </>
                )}

                <label style={s.label}>item name</label>
                <input value={modalFields.name} onChange={e => setModalFields(f => ({ ...f, name: e.target.value }))} placeholder="e.g. silk slip dress" style={s.input} />
                <label style={s.label}>store / brand</label>
                <input value={modalFields.store} onChange={e => setModalFields(f => ({ ...f, store: e.target.value }))} placeholder="e.g. Reformation" style={s.input} />
                <label style={s.label}>price ($)</label>
                <input value={modalFields.price} onChange={e => setModalFields(f => ({ ...f, price: e.target.value }))} placeholder="0" type="number" style={s.input} />
                <label style={s.label}>category</label>
                <select value={modalFields.category} onChange={e => setModalFields(f => ({ ...f, category: e.target.value as Category }))} style={{ ...s.input }}>
                  {['Fashion', 'Home', 'Beauty', 'Tech', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <label style={s.label}>note (optional)</label>
                <input value={modalFields.note} onChange={e => setModalFields(f => ({ ...f, note: e.target.value }))} placeholder="e.g. want in size S" style={s.input} />

                <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
                  <button onClick={() => setModal(null)} style={{ background: 'transparent', border: '0.5px solid rgba(255,224,245,0.14)', borderRadius: 10, padding: '9px 16px', color: 'var(--lv2)', cursor: 'pointer', fontSize: 12 }}>cancel</button>
                  <button onClick={() => addItem(modalFields)} disabled={!modalFields.name.trim()} style={{ ...s.btn('var(--p)'), borderRadius: 10, padding: '9px 18px' }}>want it*</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

// Small helper component to avoid hook-in-loop issues
function ColPreviewImg({ item }: { item: Item }) {
  const [failed, setFailed] = useState(false)
  return failed
    ? <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2c003e', fontSize: 20 }}>{EMOJIS[item.category]}</div>
    : <img src={imgUrl(item.image_keyword, item.id, 200, 120)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" onError={() => setFailed(true)} />
}
