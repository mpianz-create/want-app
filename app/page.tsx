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
  Fashion: ['linen blazer fashion editorial', 'leather handbag minimal', 'silk dress fashion', 'tailored trousers woman'],
  Home: ['ceramic lamp interior minimal', 'candle home decor', 'minimalist room design', 'nordic interior home'],
  Beauty: ['skincare serum bottle minimal', 'face cream flatlay beauty', 'sunscreen spf beauty', 'perfume bottle minimal'],
  Tech: ['wireless headphones product', 'laptop minimal desk', 'earbuds product white', 'camera minimal product'],
  Other: ['fashion flatlay minimal', 'product minimal white', 'shopping lifestyle'],
}
const HEIGHTS = [220, 260, 195, 240, 210, 250, 185, 230]
const AESTHETICS = [
  { id: 'ql', name: 'quiet luxury', emoji: '🤍', bg: '#F5F3EE', desc: 'minimal. timeless. no logos.' },
  { id: 'da', name: 'dark academia', emoji: '🕯️', bg: '#EDE8E0', desc: 'tweed. candles. obsession.' },
  { id: 'cg', name: 'coastal grandma', emoji: '🌊', bg: '#E8F0F0', desc: 'linen. ocean. effortless.' },
  { id: 'cc', name: 'cottagecore', emoji: '🌿', bg: '#EBF0E5', desc: 'floral. wicker. whimsy.' },
  { id: 'clean', name: 'clean girl', emoji: '✨', bg: '#F5F3EE', desc: 'glowy. gold hoops. fresh.' },
  { id: 'y2k', name: 'y2k revival', emoji: '💿', bg: '#EEE8F5', desc: 'metallics. butterfly clips. chaos.' },
  { id: 'sw', name: 'streetwear', emoji: '🔥', bg: '#EEEEEE', desc: 'oversized. sneakers. attitude.' },
  { id: 'bh', name: 'boho chic', emoji: '🪬', bg: '#F0EBE0', desc: 'fringe. earthy. free-spirited.' },
]

const INITIAL_ITEMS: Item[] = [
  { id: 1, name: 'Linen Oversized Blazer', store: '& Other Stories', price: 149, sale_price: null, is_sale: false, is_new: false, is_pinned: true, is_saved: true, category: 'Fashion', note: '', image_keyword: 'linen blazer fashion editorial' },
  { id: 2, name: 'Ceramic Table Lamp', store: 'Muji', price: 89, sale_price: 62, is_sale: true, is_new: true, is_pinned: false, is_saved: false, category: 'Home', note: 'For bedside table', image_keyword: 'ceramic lamp interior minimal' },
  { id: 3, name: 'Vitamin C Serum 20%', store: 'The Ordinary', price: 12, sale_price: null, is_sale: false, is_new: false, is_pinned: false, is_saved: true, category: 'Beauty', note: '', image_keyword: 'skincare serum bottle minimal' },
  { id: 4, name: 'Leather Mini Shoulder Bag', store: 'ZARA', price: 69, sale_price: 45, is_sale: true, is_new: false, is_pinned: false, is_saved: false, category: 'Fashion', note: 'Want in black', image_keyword: 'leather handbag minimal' },
  { id: 5, name: 'Noise-Cancelling Headphones', store: 'Sony', price: 349, sale_price: null, is_sale: false, is_new: false, is_pinned: false, is_saved: true, category: 'Tech', note: '', image_keyword: 'wireless headphones product' },
  { id: 6, name: 'Beeswax Pillar Candle Set', store: 'Aesop', price: 48, sale_price: null, is_sale: false, is_new: true, is_pinned: false, is_saved: false, category: 'Home', note: '', image_keyword: 'candle home decor' },
  { id: 7, name: 'High-Rise Tailored Trousers', store: 'COS', price: 115, sale_price: null, is_sale: false, is_new: true, is_pinned: false, is_saved: false, category: 'Fashion', note: 'Check sizing', image_keyword: 'tailored trousers woman' },
  { id: 8, name: 'SPF 50 Tinted Moisturiser', store: 'Fenty Skin', price: 38, sale_price: 26, is_sale: true, is_new: false, is_pinned: false, is_saved: true, category: 'Beauty', note: '', image_keyword: 'sunscreen spf beauty' },
]
const INITIAL_COLLECTIONS: Collection[] = [
  { id: 'c1', name: 'Summer fits', itemIds: [1, 4, 7] },
  { id: 'c2', name: 'Home refresh', itemIds: [2, 6] },
]

function imgUrl(keyword: string, id: number, w = 600, h = 400) {
  return `https://source.unsplash.com/${w}x${h}/?${encodeURIComponent(keyword)}&sig=${id}`
}

function CardImg({ item, height }: { item: Item, height: number }) {
  const [failed, setFailed] = useState(false)
  const emoji = EMOJIS[item.category] || '🛍️'
  return (
    <div style={{ height, overflow: 'hidden', background: '#F5F3EE', position: 'relative' }}>
      {failed
        ? <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, background: '#F5F3EE' }}>{emoji}</div>
        : <img src={imgUrl(item.image_keyword, item.id, 600, height * 2)} alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
            loading="lazy" onError={() => setFailed(true)} />
      }
    </div>
  )
}

function ColPreviewImg({ item }: { item: Item }) {
  const [failed, setFailed] = useState(false)
  return failed
    ? <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F3EE', fontSize: 22 }}>{EMOJIS[item.category]}</div>
    : <img src={imgUrl(item.image_keyword, item.id, 300, 200)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" onError={() => setFailed(true)} />
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
  const [urlStatus, setUrlStatus] = useState<{ type: 'idle'|'loading'|'ok'|'err'; msg: string }>({ type: 'idle', msg: '' })
  const [renamingCol, setRenamingCol] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')
  const [dragSrc, setDragSrc] = useState<number | null>(null)

  const filteredItems = items.filter(i => {
    if (catTab !== 'all' && i.category !== catTab) return false
    if (filter === 'sale' && !i.is_sale) return false
    if (filter === 'new' && !i.is_new) return false
    if (filter === 'under100' && (i.is_sale ? i.sale_price! : i.price) >= 100) return false
    if (filter === 'saved' && !i.is_saved) return false
    if (search) { const q = search.toLowerCase(); return [i.name, i.store, i.category, i.note].some(f => f?.toLowerCase().includes(q)) }
    return true
  })
  const pinnedItems = filteredItems.filter(i => i.is_pinned && !search)
  const boardItems = search ? filteredItems : filteredItems.filter(i => !i.is_pinned)
  const statItems = catTab === 'all' ? items : items.filter(i => i.category === catTab)
  const totalVal = statItems.reduce((s, i) => s + (i.is_sale ? i.sale_price! : i.price), 0)

  const togglePin = (id: number) => setItems(p => p.map(i => i.id === id ? { ...i, is_pinned: !i.is_pinned } : i))
  const toggleSaved = (id: number) => setItems(p => p.map(i => i.id === id ? { ...i, is_saved: !i.is_saved } : i))
  const removeItem = (id: number) => { setItems(p => p.filter(i => i.id !== id)); setCollections(p => p.map(c => ({ ...c, itemIds: c.itemIds.filter(x => x !== id) }))) }
  const toggleItemInCol = (colId: string, itemId: number) => setCollections(p => p.map(c => c.id !== colId ? c : { ...c, itemIds: c.itemIds.includes(itemId) ? c.itemIds.filter(x => x !== itemId) : [...c.itemIds, itemId] }))
  const addItem = (f: typeof modalFields) => {
    const id = nextId; setNextId(n => n + 1)
    const kws = IMG_KEYWORDS[f.category] || IMG_KEYWORDS.Other
    setItems(p => [{ id, name: f.name, store: f.store, price: parseFloat(f.price)||0, sale_price: null, is_sale: false, is_new: true, is_pinned: false, is_saved: false, category: f.category, note: f.note, image_keyword: kws[id % kws.length] }, ...p])
    setModal(null); setModalFields({ name: '', store: '', price: '', category: 'Fashion', note: '' })
  }
  const saveRec = (rec: RecItem, rid: string) => {
    if (savedRecIds.has(rid)) return
    setSavedRecIds(p => new Set([...p, rid]))
    const id = nextId; setNextId(n => n + 1)
    const kws = IMG_KEYWORDS[rec.category] || IMG_KEYWORDS.Other
    setItems(p => [{ id, name: rec.name, store: rec.store, price: rec.price, sale_price: null, is_sale: false, is_new: true, is_pinned: false, is_saved: false, category: rec.category, note: 'from explore', image_keyword: kws[id % kws.length] }, ...p])
  }

  const loadRecs = useCallback(async () => {
    setLoadingRecs(true); setRecs([]); setSavedRecIds(new Set())
    try {
      const res = await fetch('/api/claude/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: items.slice(0,50), budget_max: budgetMax }) })
      const data = await res.json(); setRecs(data.sections||[]); setRecSummary(data.taste_summary||'')
    } catch { setRecs([]) }
    setLoadingRecs(false)
  }, [items, budgetMax])

  const loadAesRecs = useCallback(async () => {
    setLoadingAes(true); setAesRecs([])
    const selected = AESTHETICS.filter(a => selectedAes.has(a.id))
    const desc = selected.map(a => `${a.name} (${a.desc})`).join('; ')
    try {
      const res = await fetch('/api/claude/aesthetics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aesthetics: desc, budget_max: budgetMax }) })
      const data = await res.json(); setAesRecs(data.sections||[])
    } catch { setAesRecs([]) }
    setLoadingAes(false)
  }, [selectedAes, budgetMax])

  const fetchFromUrl = useCallback(async () => {
    if (!urlInput.trim()) return
    setUrlStatus({ type: 'loading', msg: 'Reading the page…' })
    try {
      const res = await fetch('/api/claude/extract-url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: urlInput }) })
      const data = await res.json()
      setModalFields({ name: data.name||'', store: data.store||'', price: String(data.price||''), category: data.category||'Fashion', note: '' })
      setUrlStatus({ type: 'ok', msg: 'Done — review and save.' })
    } catch { setUrlStatus({ type: 'err', msg: 'Could not extract. Fill in manually.' }) }
  }, [urlInput])

  const onDragStart = (id: number) => setDragSrc(id)
  const onDragOver = (e: React.DragEvent) => e.preventDefault()
  const onDrop = (targetId: number) => {
    if (dragSrc === null || dragSrc === targetId) return
    setItems(prev => { const a = [...prev]; const si = a.findIndex(i => i.id === dragSrc); const ti = a.findIndex(i => i.id === targetId); const [m] = a.splice(si,1); a.splice(ti,0,m); return a })
    setDragSrc(null)
  }

  const viewingCol = viewingColId ? collections.find(c => c.id === viewingColId) : null
  const viewingColItems = viewingCol ? viewingCol.itemIds.map(id => items.find(i => i.id === id)).filter(Boolean) as Item[] : []
  const cats: Record<string,number> = {}; const stores: Record<string,number> = {}
  items.forEach(i => { cats[i.category]=(cats[i.category]||0)+1; stores[i.store]=(stores[i.store]||0)+1 })
  const topCats = Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0])
  const topStores = Object.entries(stores).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0])

  // ── Style helpers ──
  const btn = (variant: 'primary'|'secondary'|'ghost' = 'primary'): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: 'none',
    fontFamily: 'inherit', fontWeight: 600, fontSize: 13, borderRadius: 8, transition: 'all .15s',
    ...(variant === 'primary' ? { background: 'var(--text)', color: '#fff', padding: '9px 18px' }
      : variant === 'secondary' ? { background: 'transparent', color: 'var(--text)', border: '1px solid var(--border2)', padding: '8px 16px' }
      : { background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', padding: '7px 14px' })
  })
  const pill = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const, transition: 'all .15s', border: active ? 'none' : '1px solid var(--border2)',
    background: active ? 'var(--text)' : 'transparent', color: active ? '#fff' : 'var(--text2)', fontWeight: active ? 600 : 400,
  })
  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid var(--border2)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, color: 'var(--text)', background: '#fff', outline: 'none' }
  const lbl: React.CSSProperties = { fontSize: 11, color: 'var(--text3)', display: 'block', marginBottom: 5, marginTop: 16, letterSpacing: '.5px', textTransform: 'uppercase' }
  const iconBtn = (active?: boolean, activeColor?: string): React.CSSProperties => ({
    width: 30, height: 30, borderRadius: 6, border: '1px solid var(--border)', background: active ? (activeColor ? `${activeColor}15` : 'var(--pl)') : 'transparent',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: active ? (activeColor || 'var(--p)') : 'var(--text3)', fontSize: 14, transition: 'all .15s',
  })

  const SkeletonCard = ({ h }: { h: number }) => (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: '#fff' }}>
      <div style={{ height: h, background: 'var(--bg3)', animation: 'pulse 1.4s ease-in-out infinite' }} />
      <div style={{ padding: '12px 14px 14px' }}>
        {[35, 85, 55].map((w,i) => <div key={i} style={{ height: 11, borderRadius: 4, background: 'var(--bg3)', marginBottom: 7, width: `${w}%`, animation: 'pulse 1.4s ease-in-out infinite' }} />)}
      </div>
    </div>
  )

  const renderCard = (item: Item) => {
    const h = HEIGHTS[item.id % HEIGHTS.length]
    const inCols = collections.filter(c => c.itemIds.includes(item.id))
    return (
      <div key={item.id}
        style={{ borderRadius: 12, overflow: 'visible', border: item.is_pinned ? '2px solid var(--v)' : '1px solid var(--border)', background: '#fff', cursor: 'grab', userSelect: 'none', position: 'relative', opacity: dragSrc===item.id ? 0.4 : 1, transition: 'box-shadow .15s, transform .15s' }}
        draggable onDragStart={() => onDragStart(item.id)} onDragEnd={() => setDragSrc(null)} onDragOver={onDragOver} onDrop={() => onDrop(item.id)}>
        {item.is_pinned && <div style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, background: 'var(--v)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, zIndex: 3, color: '#fff' }}>📌</div>}
        <div style={{ borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ position: 'relative' }}>
            {item.is_sale && <span style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, background: 'var(--p)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>Sale</span>}
            {item.is_new && !item.is_sale && <span style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, background: 'var(--text)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>New</span>}
            <CardImg item={item} height={h} />
          </div>
          <div style={{ padding: '12px 14px 14px' }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4, fontWeight: 600 }}>{item.store}</div>
            <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 8, lineHeight: 1.4, fontWeight: 500 }}>{item.name}</div>
            {item.note && <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, fontStyle: 'italic' }}>{item.note}</div>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: item.is_sale ? 'var(--p)' : 'var(--text)', fontFamily: 'Syne, sans-serif' }}>${item.is_sale ? item.sale_price : item.price}</span>
              <div style={{ display: 'flex', gap: 4, position: 'relative' }}>
                <button style={iconBtn(item.is_pinned, 'var(--v)')} onClick={() => togglePin(item.id)} title="pin"><i className="ti ti-pin" /></button>
                <button style={iconBtn(item.is_saved, 'var(--p)')} onClick={() => toggleSaved(item.id)} title="save"><i className="ti ti-heart" /></button>
                <div style={{ position: 'relative' }}>
                  <button style={iconBtn(inCols.length > 0, 'var(--v)')} onClick={() => setOpenMenu(openMenu===item.id ? null : item.id)} title="collections"><i className="ti ti-folder-plus" /></button>
                  {openMenu === item.id && (
                    <div style={{ position: 'absolute', bottom: 36, right: 0, background: '#fff', border: '1px solid var(--border2)', borderRadius: 10, padding: 6, zIndex: 50, minWidth: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
                      {collections.map(c => (
                        <div key={c.id} onClick={() => { toggleItemInCol(c.id, item.id); setOpenMenu(null) }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: inCols.find(x=>x.id===c.id) ? 'var(--v)' : 'var(--text)', fontWeight: inCols.find(x=>x.id===c.id) ? 600 : 400 }}>
                          <i className={`ti ti-${inCols.find(x=>x.id===c.id) ? 'check' : 'folder'}`} style={{ fontSize: 15 }} /> {c.name}
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4 }}>
                        <div onClick={() => { const n=prompt('Collection name:'); if(n?.trim()){setCollections(p=>[...p,{id:'c'+nextColId,name:n.trim(),itemIds:[item.id]}]);setNextColId(x=>x+1);setOpenMenu(null)}}} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13, color: 'var(--lv)' }}>
                          <i className="ti ti-plus" style={{ fontSize: 15 }} /> New collection
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button style={iconBtn()} onClick={() => removeItem(item.id)} title="remove"><i className="ti ti-trash" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderRecCard = (item: RecItem, idx: number, prefix: string) => {
    const rid = `${prefix}-${idx}`
    const h = 200 + (idx%3)*30
    const kws = IMG_KEYWORDS[item.category] || IMG_KEYWORDS.Other
    const fakeItem: Item = { id: idx+200, name: item.name, store: item.store, price: item.price, sale_price: null, is_sale: false, is_new: false, is_pinned: false, is_saved: false, category: item.category, note: '', image_keyword: kws[idx%kws.length] }
    const done = savedRecIds.has(rid)
    return (
      <div key={rid} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: '#fff' }}>
        <CardImg item={fakeItem} height={h} />
        <div style={{ padding: '12px 14px 14px' }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4, fontWeight: 600 }}>{item.store}</div>
          <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4, lineHeight: 1.4, fontWeight: 500 }}>{item.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10, fontStyle: 'italic', lineHeight: 1.5 }}>{item.why}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>~${item.price}</span>
            <button style={{ ...btn(done ? 'ghost' : 'primary'), fontSize: 11, padding: '6px 14px', borderRadius: 20, background: done ? 'var(--bg3)' : 'var(--text)', color: done ? 'var(--text3)' : '#fff' }} onClick={() => saveRec(item, rid)} disabled={done}>{done ? 'Saved' : 'Save'}</button>
          </div>
        </div>
      </div>
    )
  }

  const navItem = (p: PageTab, icon: string, label: string) => (
    <div onClick={() => setPage(p)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', borderRadius: 8, color: page===p ? 'var(--text)' : 'var(--text3)', background: page===p ? 'var(--bg3)' : 'transparent', fontWeight: page===p ? 600 : 400, fontSize: 14, marginBottom: 2, transition: 'all .15s' }}>
      <i className={`ti ti-${icon}`} style={{ fontSize: 17 }} />{label}
    </div>
  )

  const sectionHead = (label: string) => (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const, color: 'var(--text3)', marginBottom: 16 }}>{label}</div>
  )

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
      <div onClick={() => setOpenMenu(null)} style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

        {/* TOP NAV */}
        <header style={{ height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', borderBottom: '1px solid var(--border)', background: '#fff', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '-1px', color: 'var(--text)' }}>
            WANT<span style={{ color: 'var(--p)' }}>*</span>
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={btn('secondary')} onClick={() => setModal('url')}><i className="ti ti-link" style={{ fontSize: 15 }} /> Import URL</button>
            <button style={btn('primary')} onClick={() => setModal('manual')}><i className="ti ti-plus" style={{ fontSize: 15 }} /> Add item</button>
          </div>
        </header>

        {/* BODY */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

          {/* SIDEBAR */}
          <aside style={{ width: 220, borderRight: '1px solid var(--border)', background: '#fff', flexShrink: 0, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ marginBottom: 8 }}>
              {navItem('saves', 'bookmark', 'My Saves')}
              {navItem('collections', 'folder', 'Collections')}
              {navItem('explore', 'sparkles', 'Explore')}
            </div>

            <div style={{ marginTop: 20, padding: '0 4px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>Overview</div>
              {[
                { val: items.length, lbl: 'Total saves' },
                { val: `$${items.reduce((s,i)=>s+(i.is_sale?i.sale_price!:i.price),0).toLocaleString()}`, lbl: 'Total value' },
                { val: items.filter(i=>i.is_saved).length, lbl: 'Favourited' },
                { val: items.filter(i=>i.is_sale).length, lbl: 'On sale' },
              ].map(st => (
                <div key={st.lbl} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{st.lbl}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{st.val}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'auto', padding: '16px 4px 0', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700, color: 'var(--v)', fontFamily: 'Syne, sans-serif' }}>WANT*</span> — your wishlist,<br />but make it fashion.
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>

            {/* ── MY SAVES ── */}
            {page === 'saves' && (
              <>
                {/* Toolbar */}
                <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 14px', flex: '1 1 220px' }}>
                    <i className="ti ti-search" style={{ color: 'var(--text3)', fontSize: 15 }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your saves…" style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, color: 'var(--text)', width: '100%' }} />
                    {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 0 }}><i className="ti ti-x" /></button>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {([['all','All'],['sale','On sale'],['new','New'],['under100','Under $100'],['saved','Favourited']] as [FilterType,string][]).map(([f,lbl]) => (
                      <button key={f} style={pill(filter===f)} onClick={() => setFilter(f)}>{lbl}</button>
                    ))}
                  </div>
                </div>

                {/* Category tabs */}
                <div style={{ display: 'flex', padding: '0 28px', borderBottom: '1px solid var(--border)', background: '#fff', overflowX: 'auto' }}>
                  {['all','Fashion','Home','Beauty','Tech'].map(c => (
                    <div key={c} onClick={() => setCatTab(c)} style={{ padding: '12px 16px', fontSize: 13, color: catTab===c ? 'var(--text)' : 'var(--text3)', cursor: 'pointer', borderBottom: catTab===c ? '2px solid var(--text)' : '2px solid transparent', fontWeight: catTab===c ? 600 : 400, whiteSpace: 'nowrap', transition: 'all .15s' }}>
                      {c==='all' ? 'All' : c}
                    </div>
                  ))}
                </div>

                {/* Stats bar */}
                <div style={{ display: 'flex', gap: 12, padding: '16px 28px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
                  {[{val:statItems.length,lbl:'saves'},{val:`$${totalVal.toLocaleString()}`,lbl:'total value'},{val:statItems.filter(i=>i.is_saved).length,lbl:'favourited'},{val:statItems.filter(i=>i.is_sale).length,lbl:'on sale'}].map(st => (
                    <div key={st.lbl} style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)', padding: '10px 18px', flexShrink: 0 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>{st.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.5px' }}>{st.lbl}</div>
                    </div>
                  ))}
                </div>

                {/* Board */}
                <div style={{ padding: '24px 28px' }}>
                  {pinnedItems.length > 0 && (
                    <>
                      {sectionHead('Pinned')}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                        {pinnedItems.map(renderCard)}
                      </div>
                      {sectionHead('All saves')}
                    </>
                  )}
                  {boardItems.length === 0 && pinnedItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text3)' }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
                      <p style={{ fontSize: 15, marginBottom: 8, color: 'var(--text)' }}>{search ? `No results for "${search}"` : 'Nothing saved yet'}</p>
                      <p style={{ fontSize: 13 }}>{search ? 'Try a different search.' : 'Add items using the button above.'}</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                      {boardItems.map(renderCard)}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── COLLECTIONS ── */}
            {page === 'collections' && (
              <>
                {!viewingColId ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--border)', background: '#fff' }}>
                      <div>
                        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>Collections</h1>
                        <p style={{ fontSize: 13, color: 'var(--text3)' }}>Organise your saves into curated boards.</p>
                      </div>
                      <button style={btn('primary')} onClick={() => { const n=prompt('Collection name:'); if(n?.trim()){setCollections(p=>[...p,{id:'c'+nextColId,name:n.trim(),itemIds:[]}]);setNextColId(x=>x+1)} }}><i className="ti ti-plus" /> New</button>
                    </div>
                    <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                      {collections.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 80, color: 'var(--text3)' }}>
                          <div style={{ fontSize: 40, marginBottom: 16 }}>📁</div>
                          <p style={{ fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>No collections yet</p>
                          <p style={{ fontSize: 13 }}>Create one to start organising your saves.</p>
                        </div>
                      ) : collections.map(col => {
                        const colItems = col.itemIds.map(id=>items.find(i=>i.id===id)).filter(Boolean) as Item[]
                        return (
                          <div key={col.id} onClick={() => setViewingColId(col.id)} style={{ borderRadius: 12, border: '1px solid var(--border)', background: '#fff', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow .15s' }}>
                            {colItems.length === 0
                              ? <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, background: 'var(--bg3)' }}>📦</div>
                              : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 140, overflow: 'hidden' }}>{colItems.slice(0,4).map(it=><div key={it.id} style={{ overflow: 'hidden' }}><ColPreviewImg item={it} /></div>)}</div>
                            }
                            <div style={{ padding: '14px 16px 16px' }}>
                              {renamingCol===col.id
                                ? <input value={renameVal} onChange={e=>setRenameVal(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){setCollections(p=>p.map(c=>c.id===col.id?{...c,name:renameVal.trim()||c.name}:c));setRenamingCol(null)}if(e.key==='Escape')setRenamingCol(null)}} onBlur={()=>{setCollections(p=>p.map(c=>c.id===col.id?{...c,name:renameVal.trim()||c.name}:c));setRenamingCol(null)}} autoFocus onClick={e=>e.stopPropagation()} style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,color:'var(--text)',border:'none',outline:'none',borderBottom:'2px solid var(--v)',background:'transparent',width:'100%'}} />
                                : <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{col.name}</div>
                              }
                              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>{colItems.length} item{colItems.length!==1?'s':''}</div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button style={{ ...btn('ghost'), fontSize: 11, padding: '5px 12px', borderRadius: 6 }} onClick={e=>{e.stopPropagation();setRenamingCol(col.id);setRenameVal(col.name)}}><i className="ti ti-pencil" /> Rename</button>
                                <button style={{ ...btn('ghost'), fontSize: 11, padding: '5px 12px', borderRadius: 6 }} onClick={e=>{e.stopPropagation();if(confirm('Delete collection?'))setCollections(p=>p.filter(c=>c.id!==col.id))}}><i className="ti ti-trash" /> Delete</button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '24px 28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                      <button onClick={() => setViewingColId(null)} style={{ ...btn('ghost'), fontSize: 13, padding: '7px 14px', borderRadius: 8 }}><i className="ti ti-arrow-left" /> Back</button>
                      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'var(--text)', flex: 1 }}>{viewingCol?.name}</h1>
                    </div>
                    {viewingColItems.length === 0
                      ? <div style={{ textAlign: 'center', padding: 80, color: 'var(--text3)', fontSize: 14 }}>No items in this collection yet.<br />Add items from My Saves.</div>
                      : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                          {viewingColItems.map(item => (
                            <div key={item.id} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', background: '#fff', position: 'relative' }}>
                              <div style={{ overflow: 'hidden', height: 120 }}><img src={imgUrl(item.image_keyword,item.id,400,240)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" /></div>
                              <div style={{ padding: '10px 12px 12px' }}>
                                <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 2, fontWeight: 500 }}>{item.name}</div>
                                <div style={{ fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text2)' }}>${item.is_sale?item.sale_price:item.price}</div>
                              </div>
                              <button onClick={() => setCollections(p=>p.map(c=>c.id===viewingColId?{...c,itemIds:c.itemIds.filter(x=>x!==item.id)}:c))} style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text3)' }}><i className="ti ti-x" /></button>
                            </div>
                          ))}
                        </div>
                    }
                  </div>
                )}
              </>
            )}

            {/* ── EXPLORE ── */}
            {page === 'explore' && (
              <>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 28px', background: '#fff' }}>
                  {(['foryou','aesthetics'] as ExploreTab[]).map(t => (
                    <div key={t} onClick={() => setExTab(t)} style={{ padding: '14px 18px', fontSize: 13, color: exTab===t ? 'var(--text)' : 'var(--text3)', cursor: 'pointer', borderBottom: exTab===t ? '2px solid var(--text)' : '2px solid transparent', fontWeight: exTab===t ? 600 : 400, display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s' }}>
                      <i className={`ti ti-${t==='foryou'?'sparkles':'palette'}`} style={{ fontSize: 15 }} />{t==='foryou'?'For You':'Aesthetics'}
                    </div>
                  ))}
                </div>

                <div style={{ padding: '28px' }}>
                  {/* Budget */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Budget</span>
                    {[[50,'Under $50'],[100,'Under $100'],[250,'Under $250'],[0,'No limit']].map(([v,lbl]) => (
                      <button key={v} style={pill(budgetMax===Number(v))} onClick={() => setBudgetMax(Number(v))}>{lbl}</button>
                    ))}
                  </div>

                  {exTab === 'foryou' && (
                    <>
                      <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', marginBottom: 32, border: '1px solid var(--border)' }}>
                        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.5px' }}>Picked for you</h2>
                        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20, lineHeight: 1.6 }}>{recSummary || "Claude analyses your saves and surfaces what you didn't know you wanted yet."}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
                          {[...topCats.map(c=>c.toLowerCase()),...topStores].map(chip => (
                            <span key={chip} style={{ padding: '4px 12px', borderRadius: 20, background: 'var(--vl)', border: '1px solid rgba(102,0,238,0.15)', fontSize: 12, color: 'var(--v)', fontWeight: 500 }}>{chip}</span>
                          ))}
                        </div>
                        <button style={btn('primary')} onClick={loadRecs} disabled={loadingRecs}>
                          <i className={`ti ti-${loadingRecs?'loader':'sparkles'}`} style={{ fontSize: 15 }} />{loadingRecs?'Analysing your taste…':recs.length?'Refresh picks':'Generate picks'}
                        </button>
                      </div>
                      {loadingRecs && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>{[220,245,200,230,210,240].map((h,i)=><SkeletonCard key={i} h={h}/>)}</div>}
                      {!loadingRecs && recs.map((sec,si) => (
                        <div key={si} style={{ marginBottom: 32 }}>
                          {sectionHead(sec.label)}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>{sec.items.map((item,ii)=>renderRecCard(item,si*3+ii,`rec-${si}`))}</div>
                        </div>
                      ))}
                      {!loadingRecs && recs.length===0 && (
                        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text3)' }}>
                          <i className="ti ti-compass" style={{ fontSize: 48, display: 'block', marginBottom: 16, color: 'var(--border2)' }} />
                          <p style={{ fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>Your picks are waiting</p>
                          <p style={{ fontSize: 13 }}>Generate recommendations above.</p>
                        </div>
                      )}
                    </>
                  )}

                  {exTab === 'aesthetics' && (
                    <>
                      <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24, lineHeight: 1.6 }}>Select one or more aesthetics and we&apos;ll find pieces that match your vibe.</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginBottom: 28 }}>
                        {AESTHETICS.map(a => {
                          const sel = selectedAes.has(a.id)
                          return (
                            <div key={a.id} onClick={() => setSelectedAes(p => { const n=new Set(p); sel?n.delete(a.id):n.add(a.id); return n })} style={{ borderRadius: 10, overflow: 'hidden', border: `${sel?2:1}px solid ${sel?'var(--v)':'var(--border)'}`, cursor: 'pointer', background: '#fff', position: 'relative', transition: 'all .15s' }}>
                              {sel && <div style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, background: 'var(--v)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, zIndex: 2 }}><i className="ti ti-check" /></div>}
                              <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, background: a.bg }}>{a.emoji}</div>
                              <div style={{ padding: '10px 12px 14px' }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{a.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.4 }}>{a.desc}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, color: 'var(--text3)' }}>{selectedAes.size===0?'Select at least one aesthetic':<><strong style={{ color: 'var(--text)' }}>{selectedAes.size}</strong> selected</>}</span>
                        <button style={btn('primary')} onClick={loadAesRecs} disabled={selectedAes.size===0||loadingAes}><i className={`ti ti-${loadingAes?'loader':'sparkles'}`} style={{ fontSize: 15 }} />{loadingAes?'Finding pieces…':'Shop this vibe'}</button>
                      </div>
                      {loadingAes && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>{[220,240,210].map((h,i)=><SkeletonCard key={i} h={h}/>)}</div>}
                      {!loadingAes && aesRecs.map((sec,si) => (
                        <div key={si} style={{ marginBottom: 32 }}>
                          {sectionHead(sec.label)}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>{sec.items.map((item,ii)=>renderRecCard(item,si*3+ii,`aes-${si}`))}</div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </main>
        </div>

        {/* MODAL */}
        {modal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setModal(null)}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '28px 30px', width: 440, maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{modal==='url'?'Import from URL':'Add an item'}</h2>
              <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>{modal==='url'?'Paste a product link — we\'ll fill in the details.':'Fill in the details below.'}</p>
              {modal==='url' && (
                <>
                  <label style={lbl}>Product URL</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={urlInput} onChange={e=>setUrlInput(e.target.value)} placeholder="https://…" style={{ ...inp, flex: 1 }} />
                    <button onClick={fetchFromUrl} disabled={urlStatus.type==='loading'} style={{ ...btn('primary'), borderRadius: 8, padding: '10px 16px', fontSize: 12, whiteSpace: 'nowrap' }}><i className="ti ti-sparkles" /> Extract</button>
                  </div>
                  {urlStatus.type!=='idle' && (
                    <div style={{ fontSize: 12, marginTop: 10, padding: '10px 14px', borderRadius: 8, background: urlStatus.type==='loading'?'var(--vl)':urlStatus.type==='ok'?'#F0FFF4':'#FFF0F0', color: urlStatus.type==='ok'?'#166534':urlStatus.type==='err'?'#991B1B':'var(--v)' }}>{urlStatus.msg}</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: 'var(--text3)', fontSize: 12 }}><div style={{ flex:1, height:'1px', background:'var(--border)' }} />or fill in manually<div style={{ flex:1, height:'1px', background:'var(--border)' }} /></div>
                </>
              )}
              <label style={lbl}>Item name</label>
              <input value={modalFields.name} onChange={e=>setModalFields(f=>({...f,name:e.target.value}))} placeholder="e.g. Silk slip dress" style={inp} />
              <label style={lbl}>Store / brand</label>
              <input value={modalFields.store} onChange={e=>setModalFields(f=>({...f,store:e.target.value}))} placeholder="e.g. Reformation" style={inp} />
              <label style={lbl}>Price ($)</label>
              <input value={modalFields.price} onChange={e=>setModalFields(f=>({...f,price:e.target.value}))} placeholder="0" type="number" style={inp} />
              <label style={lbl}>Category</label>
              <select value={modalFields.category} onChange={e=>setModalFields(f=>({...f,category:e.target.value as Category}))} style={inp}>
                {['Fashion','Home','Beauty','Tech','Other'].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <label style={lbl}>Note (optional)</label>
              <input value={modalFields.note} onChange={e=>setModalFields(f=>({...f,note:e.target.value}))} placeholder="e.g. Want in size S" style={inp} />
              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                <button onClick={() => setModal(null)} style={btn('secondary')}>Cancel</button>
                <button onClick={() => addItem(modalFields)} disabled={!modalFields.name.trim()} style={btn('primary')}>Save item</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
