'use client'
import { useState, useCallback } from 'react'

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

function CardImg({ item, height }: { item: Item, height: number }) {
  const [failed, setFailed] = useState(false)
  const emoji = EMOJIS[item.category] || '🛍️'
  return (
    <div style={{ height, position: 'relative', overflow: 'hidden' }}>
      {failed ? (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2c003e', fontSize: 32 }}>{emoji}</div>
      ) : (
        <img src={imgUrl(item.image_keyword, item.id, 400, height)} alt={item.name}
          style={{ width: '100%', height, objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
          loading="lazy" onError={() => setFailed(true)} />
      )}
    </div>
  )
}

function ColPreviewImg({ item }: { item: Item }) {
  const [failed, setFailed] = useState(false)
  return failed
    ? <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#2c003e', fontSize: 20 }}>{EMOJIS[item.category]}</div>
    : <img src={imgUrl(item.image_keyword, item.id, 200, 120)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" onError={() => setFailed(true)} />
}

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
  const statItems = catTab === 'all' ? items : items.filter(i => i.category === catTab)
  const totalVal = statItems.reduce((s, i) => s + (i.is_sale ? i.sale_price! : i.price), 0)

  const togglePin = (id: number) => setItems(prev => prev.map(i => i.id === id ? { ...i, is_pinned: !i.is_pinned } : i))
  const toggleSaved = (id: number) => setItems(prev => prev.map(i => i.id === id ? { ...i, is_saved: !i.is_saved } : i))
  const removeItem = (id: number) => { setItems(prev => prev.filter(i => i.id !== id)); setCollections(prev => prev.map(c => ({ ...c, itemIds: c.itemIds.filter(x => x !== id) }))) }
  const toggleItemInCol = (colId: string, itemId: number) => setCollections(prev => prev.map(c => c.id !== colId ? c : { ...c, itemIds: c.itemIds.includes(itemId) ? c.itemIds.filter(x => x !== itemId) : [...c.itemIds, itemId] }))
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

  const loadRecs = useCallback(async () => {
    setLoadingRecs(true); setRecs([]); setSavedRecIds(new Set())
    try {
      const res = await fetch('/api/claude/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: items.slice(0, 50), budget_max: budgetMax }) })
      const data = await res.json()
      setRecs(data.sections || []); setRecSummary(data.taste_summary || '')
    } catch { setRecs([]) }
    setLoadingRecs(false)
  }, [items, budgetMax])

  const loadAesRecs = useCallback(async () => {
    setLoadingAes(true); setAesRecs([])
    const selected = AESTHETICS.filter(a => selectedAes.has(a.id))
    const desc = selected.map(a => `${a.name} (${a.desc})`).join('; ')
    try {
      const res = await fetch('/api/claude/aesthetics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aesthetics: desc, budget_max: budgetMax }) })
      const data = await res.json()
      setAesRecs(data.sections || [])
    } catch { setAesRecs([]) }
    setLoadingAes(false)
  }, [selectedAes, budgetMax])

  const fetchFromUrl = useCallback(async () => {
    if (!urlInput.trim()) return
    setUrlStatus({ type: 'loading', msg: 'Claude is reading the page…' })
    try {
      const res = await fetch('/api/claude/extract-url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: urlInput }) })
      const data = await res.json()
      setModalFields({ name: data.name || '', store: data.store || '', price: String(data.price || ''), category: data.category || 'Fashion', note: '' })
      setUrlStatus({ type: 'ok', msg: 'Done! Review and save.*' })
    } catch { setUrlStatus({ type: 'err', msg: 'Could not extract. Fill in manually.' }) }
  }, [urlInput])

  const onDragStart = (id: number) => setDragSrc(id)
  const onDragOver = (e: React.DragEvent) => e.preventDefault()
  const onDrop = (targetId: number) => {
    if (dragSrc === null || dragSrc === targetId) return
    setItems(prev => { const arr = [...prev]; const si = arr.findIndex(i => i.id === dragSrc); const ti = arr.findIndex(i => i.id === targetId); const [m] = arr.splice(si, 1); arr.splice(ti, 0, m); return arr })
    setDragSrc(null)
  }

  const viewingCol = viewingColId ? collections.find(c => c.id === viewingColId) : null
  const viewingColItems = viewingCol ? viewingCol.itemIds.map(id => items.find(i => i.id === id)).filter(Boolean) as Item[] : []
  const cats: Record<string, number> = {}; const stores: Record<string, number> = {}
  items.forEach(i => { cats[i.category] = (cats[i.category] || 0) + 1; stores[i.store] = (stores[i.store] || 0) + 1 })
  const topCats = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0])
  const topStores = Object.entries(stores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0])

  const s = {
    iconBtn: (active?: boolean, color?: string): React.CSSProperties => ({ width: 28, height: 28, borderRadius: '50%', border: active ? `0.5px solid ${color || 'var(--p)'}` : '0.5px solid rgba(255,224,245,0.14)', background: active ? (color ? `${color}22` : 'var(--pl)') : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? (color || 'var(--p)') : 'var(--lv2)', fontSize: 14, transition: 'all .15s' }),
    pill: (active: boolean): React.CSSProperties => ({ padding: '5px 14px', borderRadius: 16, border: active ? 'none' : '0.5px solid rgba(255,224,245,0.14)', fontSize: 12, color: active ? '#fff' : 'var(--lv2)', cursor: 'pointer', background: active ? 'var(--p)' : 'transparent', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }),
    btn: (color = 'var(--p)'): React.CSSProperties => ({ background: color, color: color === 'var(--y)' ? 'var(--dk)' : '#fff', border: 'none', borderRadius: 20, padding: '9px 18px', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }),
    input: { width: '100%', padding: '10px 14px', border: '0.5px solid rgba(255,224,245,0.14)', borderRadius: 10, fontFamily: 'inherit', fontSize: 13, color: 'var(--w)', background: '#2c003e', outline: 'none' } as React.CSSProperties,
    label: { fontSize: 10, color: 'var(--lv2)', display: 'block', marginBottom: 4, marginTop: 14, letterSpacing: '.8px', textTransform: 'uppercase' as const },
    sectionLabel: { fontSize: 10, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase' as const, color: 'var(--lv2)', marginBottom: 14, fontFamily: 'Syne, sans-serif', display: 'block' } as React.CSSProperties,
  }

  const SkeletonCard = ({ h }: { h: number }) => (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '0.5px solid rgba(255,224,245,0.1)', background: 'var(--dk2)' }}>
      <div style={{ height: h, background: 'var(--dk3)', animation: 'pulse 1.4s ease-in-out infinite' }} />
      <div style={{ padding: '10px 12px 12px' }}>
        {[40, 100, 60].map((w, i) => <div key={i} style={{ height: 11, borderRadius: 4, background: 'var(--dk3)', marginBottom: 6, width: `${w}%`, animation: 'pulse 1.4s ease-in-out infinite' }} />)}
      </div>
    </div>
  )

  const renderCard = (item: Item) => {
    const h = HEIGHTS[item.id % HEIGHTS.length]
    const colCount = collections.filter(c => c.itemIds.includes(item.id)).length
    const inCols = collections.filter(c => c.itemIds.includes(item.id))
    return (
      <div key={item.id} style={{ borderRadius: 14, overflow: 'visible', border: item.is_pinned ? '1.5px solid rgba(255,224,0,0.4)' : '0.5px solid rgba(255,224,245,0.14)', background: 'var(--dk2)', cursor: 'grab', userSelect: 'none', transition: 'all .15s', position: 'relative', opacity: dragSrc === item.id ? 0.3 : 1 }}
        draggable onDragStart={() => onDragStart(item.id)} onDragEnd={() => setDragSrc(null)} onDragOver={onDragOver} onDrop={() => onDrop(item.id)}>
        {item.is_pinned && <div style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, background: 'var(--y)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, zIndex: 3, border: '2px solid var(--dk)' }}>📌</div>}
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
              <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: item.is_sale ? 'var(--p)' : 'var(--w)' }}>${item.is_sale ? item.sale_price : item.price}</span>
              <div style={{ display: 'flex', gap: 4, position: 'relative' }}>
                <button style={s.iconBtn(item.is_pinned, 'var(--y)')} onClick={() => togglePin(item.id)}><i className="ti ti-pin" /></button>
                <button style={s.iconBtn(item.is_saved)} onClick={() => toggleSaved(item.id)}><i className="ti ti-heart" /></button>
                <div style={{ position: 'relative' }}>
                  <button style={s.iconBtn(colCount > 0, 'var(--v)')} onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}><i className="ti ti-folder-plus" /></button>
                  {openMenu === item.id && (
                    <div style={{ position: 'absolute', bottom: 34, right: 0, background: 'var(--dk2)', border: '0.5px solid rgba(255,224,245,0.2)', borderRadius: 12, padding: 6, zIndex: 50, minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,.6)' }} onClick={e => e.stopPropagation()}>
                      {collections.map(c => (
                        <div key={c.id} onClick={() => { toggleItemInCol(c.id, item.id); setOpenMenu(null) }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: inCols.find(x => x.id === c.id) ? 'var(--y)' : 'var(--w)' }}>
                          <i className={`ti ti-${inCols.find(x => x.id === c.id) ? 'check' : 'folder-plus'}`} /> {c.name}
                        </div>
                      ))}
                      <div style={{ borderTop: '0.5px solid rgba(255,224,245,0.08)', marginTop: 4, paddingTop: 4 }}>
                        <div onClick={() => { const n = prompt('Collection name:'); if (n?.trim()) { const id = 'c' + nextColId; setNextColId(x => x + 1); setCollections(prev => [...prev, { id, name: n.trim(), itemIds: [item.id] }]); setOpenMenu(null) } }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: 'var(--lv)' }}>
                          <i className="ti ti-plus" /> new collection
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button style={s.iconBtn()} onClick={() => removeItem(item.id)}><i className="ti ti-trash" /></button>
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
    const fakeItem: Item = { id: idx + 200, name: item.name, store: item.store, price: item.price, sale_price: null, is_sale: false, is_new: false, is_pinned: false, is_saved: false, category: item.category, note: '', image_keyword: kws[idx % kws.length] }
    const done = savedRecIds.has(rid)
    return (
      <div key={rid} style={{ borderRadius: 12, overflow: 'hidden', border: '0.5px solid rgba(255,224,245,0.14)', background: 'var(--dk2)' }}>
        <CardImg item={fakeItem} height={h} />
        <div style={{ padding: '10px 12px 12px' }}>
          <div style={{ fontSize: 10, color: 'var(--lv2)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 2 }}>{item.store}</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--w)', marginBottom: 3, lineHeight: 1.35 }}>{item.name}</div>
          <div style={{ fontSize: 11, color: 'var(--lv2)', marginBottom: 8, fontStyle: 'italic', lineHeight: 1.4 }}>{item.why}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--w)' }}>~${item.price}</span>
            <button style={{ ...s.btn(), fontSize: 10, padding: '5px 12px', background: done ? 'var(--v)' : 'var(--p)', borderRadius: 14 }} onClick={() => saveRec(item, rid)} disabled={done}>{done ? 'wanted ✓' : 'want it'}</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Shared panels ──
  const SavesPanel = () => (
    <>
      <div style={{ padding: '12px 24px', borderBottom: '0.5px solid rgba(255,224,245,0.08)', background: 'var(--dk2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--dk3)', border: '0.5px solid rgba(255,224,245,0.14)', borderRadius: 28, padding: '9px 16px' }}>
          <i className="ti ti-search" style={{ color: 'var(--lv2)', fontSize: 15 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search your wants…" style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, color: 'var(--w)', width: '100%' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lv2)' }}><i className="ti ti-x" /></button>}
        </div>
      </div>
      <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,224,245,0.08)', overflowX: 'auto', background: 'var(--dk2)', padding: '0 24px' }}>
        {['all', 'Fashion', 'Home', 'Beauty', 'Tech'].map(c => (
          <div key={c} onClick={() => setCatTab(c)} style={{ padding: '11px 16px', fontSize: 12, color: catTab === c ? 'var(--w)' : 'var(--lv2)', cursor: 'pointer', borderBottom: catTab === c ? '2px solid var(--v)' : '2px solid transparent', fontFamily: catTab === c ? 'Syne, sans-serif' : 'inherit', fontWeight: catTab === c ? 800 : 400, whiteSpace: 'nowrap' }}>
            {c === 'all' ? 'all saves' : c.toLowerCase()}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '12px 24px', background: 'var(--dk3)', borderBottom: '0.5px solid rgba(255,224,245,0.08)', overflowX: 'auto' }}>
        {[{ val: statItems.length, lbl: 'wants' }, { val: `$${totalVal.toLocaleString()}`, lbl: 'total value' }, { val: statItems.filter(i => i.is_saved).length, lbl: 'obsessed' }, { val: statItems.filter(i => i.is_sale).length, lbl: 'on sale' }].map(st => (
          <div key={st.lbl} style={{ background: 'rgba(255,224,0,0.08)', borderRadius: 10, border: '0.5px solid rgba(255,224,0,0.18)', padding: '8px 16px', flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--y)' }}>{st.val}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,224,0,0.6)', marginTop: 1 }}>{st.lbl}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', padding: '10px 24px', gap: 6, overflowX: 'auto', background: 'var(--dk2)', borderBottom: '0.5px solid rgba(255,224,245,0.08)' }}>
        {([['all', 'all'], ['sale', 'sign from universe'], ['new', 'just dropped'], ['under100', 'under $100'], ['saved', 'obsessed ♡']] as [FilterType, string][]).map(([f, lbl]) => (
          <button key={f} style={s.pill(filter === f)} onClick={() => setFilter(f)}>{lbl}</button>
        ))}
      </div>
      <div style={{ padding: '16px 24px 0', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '-1px' }}>{catTab === 'all' ? 'all wants*' : `${catTab.toLowerCase()} wants`}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,224,245,0.3)' }}><i className="ti ti-drag-drop" /> drag to reorder</span>
      </div>
      {pinnedItems.length > 0 && (
        <div style={{ padding: '12px 24px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--y)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12, fontFamily: 'Syne, sans-serif' }}><i className="ti ti-pin" /> obsessed with</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>{pinnedItems.map(renderCard)}</div>
          <div style={{ height: '0.5px', background: 'rgba(255,224,245,0.1)', marginBottom: 4 }} />
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, padding: '12px 24px 32px' }}>
        {boardItems.length === 0 && pinnedItems.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--lv2)' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>✨</div>
            <p style={{ fontSize: 14 }}>{search ? `no results for "${search}"*` : 'nothing here yet. fix that.*'}</p>
          </div>
        ) : boardItems.map(renderCard)}
      </div>
    </>
  )

  const CollectionsPanel = () => (
    <>
      {!viewingColId ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '0.5px solid rgba(255,224,245,0.08)' }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800 }}>collections*</span>
            <button style={s.btn('var(--v)')} onClick={() => { const n = prompt('Name your collection:'); if (n?.trim()) { setCollections(prev => [...prev, { id: 'c' + nextColId, name: n.trim(), itemIds: [] }]); setNextColId(x => x + 1) } }}><i className="ti ti-plus" /> new</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, padding: '20px 24px' }}>
            {collections.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--lv2)', fontSize: 14 }}>no collections yet.*</div>
            ) : collections.map(col => {
              const colItems = col.itemIds.map(id => items.find(i => i.id === id)).filter(Boolean) as Item[]
              return (
                <div key={col.id} onClick={() => setViewingColId(col.id)} style={{ borderRadius: 14, border: '0.5px solid rgba(255,224,245,0.14)', background: 'var(--dk2)', overflow: 'hidden', cursor: 'pointer', transition: 'border-color .15s' }}>
                  {colItems.length === 0 ? <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, background: 'var(--dk3)' }}>📦</div>
                    : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 120, overflow: 'hidden' }}>{colItems.slice(0, 4).map(it => <div key={it.id} style={{ overflow: 'hidden' }}><ColPreviewImg item={it} /></div>)}</div>}
                  <div style={{ padding: '12px 14px 14px' }}>
                    {renamingCol === col.id
                      ? <input value={renameVal} onChange={e => setRenameVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setCollections(prev => prev.map(c => c.id === col.id ? { ...c, name: renameVal.trim() || c.name } : c)); setRenamingCol(null) } if (e.key === 'Escape') setRenamingCol(null) }} onBlur={() => { setCollections(prev => prev.map(c => c.id === col.id ? { ...c, name: renameVal.trim() || c.name } : c)); setRenamingCol(null) }} autoFocus onClick={e => e.stopPropagation()} style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 800, color: 'var(--w)', border: 'none', outline: 'none', borderBottom: '1.5px solid var(--v)', background: 'transparent', width: '100%' }} />
                      : <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 800, color: 'var(--w)', marginBottom: 4 }}>{col.name}</div>}
                    <div style={{ fontSize: 12, color: 'var(--lv2)', marginBottom: 10 }}>{colItems.length} want{colItems.length !== 1 ? 's' : ''}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ fontSize: 11, padding: '4px 10px', borderRadius: 12, border: '0.5px solid rgba(255,224,245,0.14)', background: 'transparent', cursor: 'pointer', color: 'var(--lv2)', fontFamily: 'inherit' }} onClick={e => { e.stopPropagation(); setRenamingCol(col.id); setRenameVal(col.name) }}><i className="ti ti-pencil" /> rename</button>
                      <button style={{ fontSize: 11, padding: '4px 10px', borderRadius: 12, border: '0.5px solid rgba(255,224,245,0.14)', background: 'transparent', cursor: 'pointer', color: 'var(--lv2)', fontFamily: 'inherit' }} onClick={e => { e.stopPropagation(); if (confirm('Delete this collection?')) setCollections(prev => prev.filter(c => c.id !== col.id)) }}><i className="ti ti-trash" /> delete</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '0.5px solid rgba(255,224,245,0.08)' }}>
            <button onClick={() => setViewingColId(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--lv2)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><i className="ti ti-arrow-left" /> back</button>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, flex: 1 }}>{viewingCol?.name}</span>
          </div>
          {viewingColItems.length === 0
            ? <div style={{ textAlign: 'center', padding: 60, color: 'var(--lv2)', fontSize: 14 }}>nothing here yet. fix that.*</div>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {viewingColItems.map(item => (
                <div key={item.id} style={{ borderRadius: 12, overflow: 'hidden', border: '0.5px solid rgba(255,224,245,0.12)', background: 'var(--dk2)', position: 'relative' }}>
                  <div style={{ overflow: 'hidden', height: 100 }}><img src={imgUrl(item.image_keyword, item.id, 300, 140)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /></div>
                  <div style={{ padding: '8px 10px 10px' }}>
                    <div style={{ fontSize: 12, color: 'var(--w)', marginBottom: 2, lineHeight: 1.3 }}>{item.name}</div>
                    <div style={{ fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--lv2)' }}>${item.is_sale ? item.sale_price : item.price}</div>
                  </div>
                  <button onClick={() => setCollections(prev => prev.map(c => c.id === viewingColId ? { ...c, itemIds: c.itemIds.filter(x => x !== item.id) } : c))} style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'rgba(26,0,40,0.8)', border: '0.5px solid rgba(255,224,245,0.14)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--lv2)' }}><i className="ti ti-x" /></button>
                </div>
              ))}
            </div>}
        </div>
      )}
    </>
  )

  const ExplorePanel = () => (
    <>
      <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,224,245,0.08)', padding: '0 24px' }}>
        {(['foryou', 'aesthetics'] as ExploreTab[]).map(t => (
          <div key={t} onClick={() => setExTab(t)} style={{ padding: '13px 18px', fontSize: 13, color: exTab === t ? 'var(--w)' : 'var(--lv2)', cursor: 'pointer', borderBottom: exTab === t ? '2px solid var(--p)' : '2px solid transparent', fontFamily: exTab === t ? 'Syne, sans-serif' : 'inherit', fontWeight: exTab === t ? 800 : 400, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className={`ti ti-${t === 'foryou' ? 'heart' : 'palette'}`} />{t === 'foryou' ? 'for you' : 'aesthetics'}
          </div>
        ))}
      </div>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--lv2)' }}>budget:</span>
          {[[50, 'under $50'], [100, 'under $100'], [250, 'under $250'], [0, 'no limit*']].map(([v, lbl]) => (
            <button key={v} style={s.pill(budgetMax === Number(v))} onClick={() => setBudgetMax(Number(v))}>{lbl}</button>
          ))}
        </div>

        {exTab === 'foryou' && (
          <>
            <div style={{ background: 'var(--dk2)', borderRadius: 18, padding: '24px', marginBottom: 28, border: '0.5px solid rgba(255,224,245,0.14)' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, letterSpacing: '-1.2px', marginBottom: 6 }}>picked for you*</h2>
              <p style={{ fontSize: 13, color: 'var(--lv2)', marginBottom: 18, lineHeight: 1.7 }}>{recSummary || "Claude reads your saves and finds what you didn't know you wanted yet.*"}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {[...topCats.map(c => c.toLowerCase()), ...topStores].map(chip => (
                  <span key={chip} style={{ padding: '5px 14px', borderRadius: 16, background: 'var(--vl)', border: '0.5px solid rgba(123,0,255,0.3)', fontSize: 12, color: 'var(--lv)' }}>{chip}</span>
                ))}
              </div>
              <button style={s.btn('var(--p)')} onClick={loadRecs} disabled={loadingRecs}>
                <i className={`ti ti-${loadingRecs ? 'loader' : 'sparkles'}`} />{loadingRecs ? 'reading your taste…' : recs.length ? 'refresh picks' : 'generate picks'}
              </button>
            </div>
            {loadingRecs && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>{[160, 175, 150, 165, 170, 155].map((h, i) => <SkeletonCard key={i} h={h} />)}</div>}
            {!loadingRecs && recs.map((sec, si) => (
              <div key={si} style={{ marginBottom: 28 }}>
                <span style={s.sectionLabel}>{sec.label}</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>{sec.items.map((item, ii) => renderRecCard(item, si * 3 + ii, `rec-${si}`))}</div>
              </div>
            ))}
            {!loadingRecs && recs.length === 0 && <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--lv2)' }}><div style={{ fontSize: 48, marginBottom: 14 }}>🧭</div><p style={{ fontSize: 14 }}>generate your picks.*</p></div>}
          </>
        )}

        {exTab === 'aesthetics' && (
          <>
            <p style={{ fontSize: 13, color: 'var(--lv2)', marginBottom: 20, lineHeight: 1.7 }}>pick your vibe. we&apos;ll find the pieces.*</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 24 }}>
              {AESTHETICS.map(a => {
                const sel = selectedAes.has(a.id)
                return (
                  <div key={a.id} onClick={() => setSelectedAes(prev => { const n = new Set(prev); sel ? n.delete(a.id) : n.add(a.id); return n })} style={{ borderRadius: 12, overflow: 'hidden', border: `2px solid ${sel ? 'var(--p)' : 'rgba(255,224,245,0.14)'}`, cursor: 'pointer', background: 'var(--dk2)', position: 'relative' }}>
                    {sel && <div style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, background: 'var(--p)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, zIndex: 2 }}><i className="ti ti-check" /></div>}
                    <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, background: a.bg }}>{a.emoji}</div>
                    <div style={{ padding: '10px 12px 14px' }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 800, color: 'var(--w)', marginBottom: 3 }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--lv2)', lineHeight: 1.4 }}>{a.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'var(--lv2)' }}>{selectedAes.size === 0 ? 'select at least one vibe' : <><strong style={{ color: 'var(--w)' }}>{selectedAes.size}</strong> vibe{selectedAes.size !== 1 ? 's' : ''} selected</>}</span>
              <button style={s.btn('var(--p)')} onClick={loadAesRecs} disabled={selectedAes.size === 0 || loadingAes}><i className={`ti ti-${loadingAes ? 'loader' : 'sparkles'}`} />{loadingAes ? 'finding your vibe…' : 'shop this vibe'}</button>
            </div>
            {loadingAes && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>{[160, 175, 150].map((h, i) => <SkeletonCard key={i} h={h} />)}</div>}
            {!loadingAes && aesRecs.map((sec, si) => (
              <div key={si} style={{ marginBottom: 28 }}>
                <span style={s.sectionLabel}>{sec.label}</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>{sec.items.map((item, ii) => renderRecCard(item, si * 3 + ii, `aes-${si}`))}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  )

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: var(--dk2); }
        ::-webkit-scrollbar-thumb { background: var(--v); border-radius: 2px; }
      `}</style>
      <div onClick={() => setOpenMenu(null)} style={{ minHeight: '100vh', background: 'var(--dk)', display: 'flex', flexDirection: 'column' }}>

        {/* TOP NAV */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 60, borderBottom: '0.5px solid rgba(255,224,245,0.08)', background: 'var(--dk2)', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--w)' }}>WANT<span style={{ color: 'var(--y)' }}>*</span></span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ background: 'rgba(255,224,0,0.08)', border: '0.5px solid rgba(255,224,0,0.25)', color: 'var(--y)', borderRadius: 20, padding: '8px 16px', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setModal('url')}><i className="ti ti-link" /> import URL</button>
            <button style={{ ...s.btn('var(--p)'), fontSize: 12, padding: '8px 16px' }} onClick={() => setModal('manual')}><i className="ti ti-plus" /> want it</button>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

          {/* SIDEBAR NAV */}
          <div style={{ width: 220, borderRight: '0.5px solid rgba(255,224,245,0.08)', background: 'var(--dk2)', flexShrink: 0, padding: '24px 0' }}>
            {([['saves', 'bookmark', 'my wants'], ['collections', 'folder', 'collections'], ['explore', 'sparkles', 'explore']] as [PageTab, string, string][]).map(([p, icon, label]) => (
              <div key={p} onClick={() => setPage(p)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', cursor: 'pointer', color: page === p ? 'var(--w)' : 'var(--lv2)', background: page === p ? 'rgba(255,46,172,0.1)' : 'transparent', borderLeft: page === p ? '3px solid var(--p)' : '3px solid transparent', fontFamily: page === p ? 'Syne, sans-serif' : 'inherit', fontWeight: page === p ? 800 : 400, fontSize: 14, transition: 'all .15s', marginBottom: 2 }}>
                <i className={`ti ti-${icon}`} style={{ fontSize: 18 }} />{label}
              </div>
            ))}

            {/* Stats in sidebar */}
            <div style={{ margin: '32px 16px 0', padding: '16px', background: 'rgba(255,224,0,0.06)', borderRadius: 12, border: '0.5px solid rgba(255,224,0,0.15)' }}>
              <div style={{ fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--y)', fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: 12 }}>my wardrobe</div>
              {[{ val: items.length, lbl: 'total wants' }, { val: `$${items.reduce((s, i) => s + (i.is_sale ? i.sale_price! : i.price), 0).toLocaleString()}`, lbl: 'total value' }, { val: items.filter(i => i.is_saved).length, lbl: 'obsessed' }, { val: items.filter(i => i.is_sale).length, lbl: 'on sale' }].map(st => (
                <div key={st.lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,224,0,0.6)' }}>{st.lbl}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--y)' }}>{st.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={{ flex: 1, overflowY: 'auto', background: 'var(--dk)' }}>
            {page === 'saves' && <SavesPanel />}
            {page === 'collections' && <CollectionsPanel />}
            {page === 'explore' && <ExplorePanel />}
          </div>
        </div>

        {/* MODAL */}
        {modal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setModal(null)}>
            <div style={{ background: 'var(--dk2)', borderRadius: 20, padding: '28px 30px', width: 420, maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', border: '0.5px solid rgba(255,224,245,0.14)' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '-1px', marginBottom: 4 }}>{modal === 'url' ? 'import from URL' : 'add a want*'}</h3>
              <p style={{ fontSize: 13, color: 'var(--lv2)', marginBottom: 20 }}>{modal === 'url' ? 'paste a link. claude reads the rest.*' : 'fill in the details.'}</p>
              {modal === 'url' && (
                <>
                  <label style={s.label}>product URL</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://…" style={{ ...s.input, flex: 1 }} />
                    <button onClick={fetchFromUrl} disabled={urlStatus.type === 'loading'} style={{ ...s.btn('var(--v)'), borderRadius: 10, padding: '10px 16px', fontSize: 12, whiteSpace: 'nowrap' }}><i className="ti ti-sparkles" /> extract</button>
                  </div>
                  {urlStatus.type !== 'idle' && <div style={{ fontSize: 12, marginTop: 10, padding: '9px 14px', borderRadius: 8, background: urlStatus.type === 'loading' ? 'var(--vl)' : urlStatus.type === 'ok' ? 'rgba(255,224,0,0.08)' : 'var(--pl)', color: urlStatus.type === 'ok' ? 'var(--y)' : urlStatus.type === 'err' ? 'var(--p)' : 'var(--lv)' }}>{urlStatus.msg}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0', color: 'rgba(255,224,245,0.3)', fontSize: 12 }}><div style={{ flex: 1, height: '0.5px', background: 'rgba(255,224,245,0.14)' }} />or fill in manually<div style={{ flex: 1, height: '0.5px', background: 'rgba(255,224,245,0.14)' }} /></div>
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
              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                <button onClick={() => setModal(null)} style={{ background: 'transparent', border: '0.5px solid rgba(255,224,245,0.14)', borderRadius: 12, padding: '10px 18px', color: 'var(--lv2)', cursor: 'pointer', fontSize: 13 }}>cancel</button>
                <button onClick={() => addItem(modalFields)} disabled={!modalFields.name.trim()} style={{ ...s.btn('var(--p)'), borderRadius: 12, padding: '10px 20px' }}>want it*</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
