'use client'
import { Icon } from '@/components/ui/Icon'
import { useState, useCallback, useEffect } from 'react'
import { btn, pill, inp, lbl, colors, radius, space, font, isDarkHour, getGreeting, AESTHETICS } from '@/lib/tokens'
import { INITIAL_ITEMS, INITIAL_COLLECTIONS } from '@/lib/data'
import { ProductCard } from '@/components/ui/ProductCard'
import { RecCard } from '@/components/ui/RecCard'
import { ItemImage } from '@/components/ui/ItemImage'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { SectionHead } from '@/components/ui/SectionHead'
import { EmptyState } from '@/components/ui/EmptyState'
import { ToastContainer, useToast } from '@/components/ui/Toast'
import { ErrorState } from '@/components/ui/ErrorState'
import type { Item, Collection, RecSection, FilterType, PageTab, ExploreTab, Category, Theme } from '@/types'

export default function WantApp() {
  const { toasts, toast, dismiss } = useToast()

  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS)
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS)
  const [nextId, setNextId] = useState(8)
  const [nextColId, setNextColId] = useState(3)

  const [page, setPage] = useState<PageTab>('saves')
  const [exTab, setExTab] = useState<ExploreTab>('foryou')
  const [catTab, setCatTab] = useState('all')
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [budgetMax, setBudgetMax] = useState(0)

  const [viewingColId, setViewingColId] = useState<string | null>(null)
  const [renamingCol, setRenamingCol] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')
  const [dragSrc, setDragSrc] = useState<number | null>(null)

  const [selectedAes, setSelectedAes] = useState<Set<string>>(new Set())
  const [recs, setRecs] = useState<RecSection[]>([])
  const [recSummary, setRecSummary] = useState('')
  const [aesRecs, setAesRecs] = useState<RecSection[]>([])
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [loadingAes, setLoadingAes] = useState(false)
  const [recsError, setRecsError] = useState(false)
  const [savedRecIds, setSavedRecIds] = useState<Set<string>>(new Set())

  const [modal, setModal] = useState<null | 'manual' | 'url'>(null)
  const [modalFields, setModalFields] = useState({ name: '', store: '', price: '', category: 'Fashion' as Category, note: '' })
  const [urlInput, setUrlInput] = useState('')
  const [urlStatus, setUrlStatus] = useState<{ type: 'idle'|'loading'|'ok'|'err'; msg: string }>({ type: 'idle', msg: '' })

  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [theme, setTheme] = useState<Theme>('auto')

  // ── Time-based theme ──
  // The inline script in layout.tsx sets data-theme before first paint.
  // This effect syncs React state with what the DOM already has,
  // so there's no flash and no hydration mismatch.
  useEffect(() => {
    setMounted(true)
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'auto' && isDarkHour())
      setIsDark(dark)
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    }
    apply()
    const t = setInterval(apply, 60_000)
    return () => clearInterval(t)
  }, [theme])

  // ── Derived state ──
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
  const boardItems  = search ? filteredItems : filteredItems.filter(i => !i.is_pinned)
  const statItems   = catTab === 'all' ? items : items.filter(i => i.category === catTab)
  const totalVal    = statItems.reduce((s, i) => s + (i.is_sale ? i.sale_price! : i.price), 0)

  // ── Mutations ──
  const togglePin = (id: number) => {
    const item = items.find(i => i.id === id)
    setItems(p => p.map(i => i.id === id ? { ...i, is_pinned: !i.is_pinned } : i))
    toast.info(item?.is_pinned ? 'Unpinned' : 'Pinned to top')
  }
  const toggleSaved = (id: number) => {
    const item = items.find(i => i.id === id)
    setItems(p => p.map(i => i.id === id ? { ...i, is_saved: !i.is_saved } : i))
    toast.success(item?.is_saved ? 'Removed from favourites' : 'Added to favourites')
  }
  const removeItem = (id: number) => {
    setItems(p => p.filter(i => i.id !== id))
    setCollections(p => p.map(c => ({ ...c, itemIds: c.itemIds.filter(x => x !== id) })))
    toast.info('Item removed')
  }
  const toggleInCol = (colId: string, itemId: number) => {
    const col = collections.find(c => c.id === colId)
    const isIn = col?.itemIds.includes(itemId)
    setCollections(p => p.map(c => c.id !== colId ? c : { ...c, itemIds: isIn ? c.itemIds.filter(x => x !== itemId) : [...c.itemIds, itemId] }))
    toast.success(isIn ? `Removed from ${col?.name}` : `Added to ${col?.name}`)
  }
  const newColFor = (itemId: number) => {
    const n = prompt('Collection name:')
    if (n?.trim()) {
      setCollections(p => [...p, { id: 'c'+nextColId, name: n.trim(), itemIds: [itemId] }])
      setNextColId(x => x+1)
      toast.success(`Collection "${n.trim()}" created`)
    }
  }
  const addItem = (f: typeof modalFields) => {
    const id = nextId; setNextId(n => n+1)
    setItems(p => [{ id, name: f.name, store: f.store, price: parseFloat(f.price)||0, sale_price: null, is_sale: false, is_new: true, is_pinned: false, is_saved: false, category: f.category, note: f.note }, ...p])
    setModal(null)
    setModalFields({ name: '', store: '', price: '', category: 'Fashion', note: '' })
    toast.success(`"${f.name}" saved to your list`)
  }
  const saveRec = (rec: { name: string; store: string; price: number; category: Category }, rid: string) => {
    if (savedRecIds.has(rid)) return
    setSavedRecIds(p => new Set([...p, rid]))
    const id = nextId; setNextId(n => n+1)
    setItems(p => [{ id, name: rec.name, store: rec.store, price: rec.price, sale_price: null, is_sale: false, is_new: true, is_pinned: false, is_saved: false, category: rec.category, note: 'from explore' }, ...p])
    toast.success(`"${rec.name}" added to your saves`)
  }

  const onDrop = (targetId: number) => {
    if (dragSrc === null || dragSrc === targetId) return
    setItems(prev => { const a=[...prev]; const si=a.findIndex(i=>i.id===dragSrc); const ti=a.findIndex(i=>i.id===targetId); const [m]=a.splice(si,1); a.splice(ti,0,m); return a })
    setDragSrc(null)
  }

  // ── AI calls ──
  const loadRecs = useCallback(async () => {
    setLoadingRecs(true); setRecs([]); setSavedRecIds(new Set()); setRecsError(false)
    try {
      const res = await fetch('/api/claude/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: items.slice(0,50), budget_max: budgetMax }) })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setRecs(data.sections||[])
      setRecSummary(data.taste_summary||'')
    } catch {
      setRecsError(true)
      toast.error('Could not load recommendations. Check your API key.')
    }
    setLoadingRecs(false)
  }, [items, budgetMax])

  const loadAesRecs = useCallback(async () => {
    setLoadingAes(true); setAesRecs([])
    const sel = AESTHETICS.filter(a => selectedAes.has(a.id))
    try {
      const res = await fetch('/api/claude/aesthetics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aesthetics: sel.map(a=>`${a.name} (${a.desc})`).join('; '), budget_max: budgetMax }) })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAesRecs(data.sections||[])
    } catch {
      toast.error('Could not load picks. Try again.')
    }
    setLoadingAes(false)
  }, [selectedAes, budgetMax])

  const fetchFromUrl = useCallback(async () => {
    if (!urlInput.trim()) return
    setUrlStatus({ type: 'loading', msg: 'Reading the page…' })
    try {
      const res = await fetch('/api/claude/extract-url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: urlInput }) })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setModalFields({ name: data.name||'', store: data.store||'', price: String(data.price||''), category: data.category||'Fashion', note: '' })
      setUrlStatus({ type: 'ok', msg: 'Done — review and save.' })
    } catch {
      setUrlStatus({ type: 'err', msg: 'Could not extract. Fill in manually.' })
    }
  }, [urlInput])

  // ── Computed ──
  const cats: Record<string,number> = {}; const stores: Record<string,number> = {}
  items.forEach(i => { cats[i.category]=(cats[i.category]||0)+1; stores[i.store]=(stores[i.store]||0)+1 })
  const topCats   = Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0])
  const topStores = Object.entries(stores).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0])
  const viewingCol      = viewingColId ? collections.find(c => c.id === viewingColId) : null
  const viewingColItems = viewingCol ? viewingCol.itemIds.map(id => items.find(i => i.id === id)).filter(Boolean) as Item[] : []

  const themeIcon = theme === 'dark' ? 'moon' : theme === 'light' ? 'sun' : isDark ? 'moon' : 'sun'
  const nextTheme: Theme = theme === 'auto' ? (isDark ? 'light' : 'dark') : theme === 'dark' ? 'light' : 'auto'
  const cardGrid = 'want-grid' // CSS class defined in globals.css

  const navItem = (p: PageTab, icon: string, label: string) => (
    <div key={p} onClick={() => setPage(p)} role="button" tabIndex={0} onKeyDown={e => e.key==='Enter' && setPage(p)}
      style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', cursor:'pointer', borderRadius:radius.md, color:page===p?colors.text:colors.text3, background:page===p?colors.bg3:'transparent', fontWeight:page===p?600:400, fontSize:14, marginBottom:2, transition:'all 150ms ease' }}>
      <Icon name={icon} size={17} />{label}
    </div>
  )

  const tabItem = (value: string, label: string, current: string, setter: (v: string) => void) => (
    <div key={value} onClick={() => setter(value)} role="tab" tabIndex={0} aria-selected={current===value} onKeyDown={e => e.key==='Enter' && setter(value)}
      style={{ padding:'12px 16px', fontSize:13, color:current===value?colors.text:colors.text3, cursor:'pointer', borderBottom:current===value?`2px solid ${colors.text}`:'2px solid transparent', fontWeight:current===value?600:400, whiteSpace:'nowrap' as const, transition:'all 150ms ease' }}>
      {label}
    </div>
  )

  const budgetRow = (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:28, flexWrap:'wrap' as const }}>
      <span style={{ fontSize:12, color:colors.text3, fontWeight:600, textTransform:'uppercase' as const, letterSpacing:'.5px' }}>Budget</span>
      {([[50,'Under $50'],[100,'Under $100'],[250,'Under $250'],[0,'No limit']] as [number,string][]).map(([v,l]) => (
        <button key={v} style={pill(budgetMax===v)} onClick={() => setBudgetMax(v)}>{l}</button>
      ))}
    </div>
  )

  return (
    <>
      <div style={{ minHeight:'100vh', background:colors.bg, display:'flex', flexDirection:'column' }}>

        {/* ── TOP NAV ── */}
        <header style={{ height:58, display:'flex', alignItems:'center', justifyContent:'space-between', padding:`0 ${space[7]}px`, borderBottom:`1px solid ${colors.border}`, background:colors.card, flexShrink:0 }}>
          <span style={{ fontFamily:font.display, fontSize:22, fontWeight:800, letterSpacing:'-1px', color:colors.text }}>
            WANT<span style={{ color:colors.pink }}>*</span>
          </span>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button onClick={() => setTheme(nextTheme)} style={{ ...btn('ghost'), padding:'7px 12px', gap:5 }} aria-label={`Switch theme, current: ${theme}`} suppressHydrationWarning>
              <Icon name={mounted ? themeIcon : 'sun'} size={16} />
              <span style={{ fontSize:11, color:colors.text3 }} suppressHydrationWarning>{mounted ? (theme==='auto'?'Auto':theme==='dark'?'Dark':'Light') : 'Auto'}</span>
            </button>
            <button style={btn('secondary')} onClick={() => setModal('url')}><Icon name="link" /> Import URL</button>
            <button style={btn('primary')} onClick={() => setModal('manual')}><Icon name="plus" /> Add item</button>
          </div>
        </header>

        {/* ── BODY ── */}
        <div className="main-body" style={{ display:'flex', flex:1, minHeight:0 }}>

          {/* ── SIDEBAR (hidden on mobile) ── */}
          <aside className="sidebar" style={{ width:220, borderRight:`1px solid ${colors.border}`, background:colors.card, flexShrink:0, padding:'20px 12px', flexDirection:'column' }}>
            <nav aria-label="Main navigation">
              {navItem('saves', 'bookmark', 'My Saves')}
              {navItem('collections', 'folder', 'Collections')}
              {navItem('explore', 'sparkles', 'Explore')}
            </nav>

            <div style={{ marginTop:24, padding:'0 4px' }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.8px', textTransform:'uppercase', color:colors.text3, marginBottom:12 }}>Overview</div>
              {[
                { val: items.length, lbl: 'Total saves' },
                { val: `$${items.reduce((s,i)=>s+(i.is_sale?i.sale_price!:i.price),0).toLocaleString()}`, lbl: 'Total value' },
                { val: items.filter(i=>i.is_saved).length, lbl: 'Favourited' },
                { val: items.filter(i=>i.is_sale).length, lbl: 'On sale' },
              ].map(st => (
                <div key={st.lbl} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:`1px solid ${colors.border}` }}>
                  <span style={{ fontSize:12, color:colors.text3 }}>{st.lbl}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:colors.text, fontFamily:font.display }}>{st.val}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop:'auto', padding:'16px 4px 0', borderTop:`1px solid ${colors.border}` }}>
              <div style={{ fontSize:12, color:colors.text3, lineHeight:1.6 }}>
                <span style={{ display:'block', fontWeight:600, color:colors.text, marginBottom:2 }} suppressHydrationWarning>{mounted ? getGreeting() : 'Welcome'}</span>
                <span suppressHydrationWarning>{mounted ? (isDark ? '🌙 Night mode' : '☀️ Day mode') : ''}</span><br />
                <span style={{ fontSize:11 }}>Switches at 8pm & 7am</span>
              </div>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <main style={{ flex:1, overflowY:'auto', background:colors.bg }} id="main-content">

            {/* ════ MY SAVES ════ */}
            {page === 'saves' && (
              <div className="animate-fade-in">
                <div className="page-pad" style={{ padding:`${space[4]}px 28px`, borderBottom:`1px solid ${colors.border}`, background:colors.card, display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, background:colors.bg, border:`1px solid ${colors.border2}`, borderRadius:radius.md, padding:'8px 14px', flex:'1 1 220px' }}>
                    <Icon name="search" />
                    <input
                      value={search} onChange={e=>setSearch(e.target.value)}
                      placeholder="Search your saves…"
                      aria-label="Search saved items"
                      style={{ border:'none', outline:'none', background:'transparent', fontFamily:font.body, fontSize:13, color:colors.text, width:'100%' }}
                    />
                    {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:colors.text3, padding:0 }} aria-label="Clear search"><Icon name="x" /></button>}
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {([['all','All'],['sale','On sale'],['new','New'],['under100','Under $100'],['saved','Favourited']] as [FilterType,string][]).map(([f,l]) => (
                      <button key={f} style={pill(filter===f)} onClick={() => setFilter(f)} aria-pressed={filter===f}>{l}</button>
                    ))}
                  </div>
                </div>

                <div className="page-pad" style={{ display:'flex', padding:`0 28px`, borderBottom:`1px solid ${colors.border}`, background:colors.card, overflowX:'auto' }} role="tablist" aria-label="Category filter">
                  {['all','Fashion','Home','Beauty','Tech'].map(c => tabItem(c, c==='all'?'All':c, catTab, setCatTab))}
                </div>

                <div className="page-pad" style={{ display:'flex', gap:12, padding:`${space[4]}px 28px`, borderBottom:`1px solid ${colors.border}`, overflowX:'auto' }} aria-label="Summary statistics">
                  {[{val:statItems.length,lbl:'saves'},{val:`$${totalVal.toLocaleString()}`,lbl:'total value'},{val:statItems.filter(i=>i.is_saved).length,lbl:'favourited'},{val:statItems.filter(i=>i.is_sale).length,lbl:'on sale'}].map(st => (
                    <div key={st.lbl} style={{ background:colors.card, borderRadius:radius.md, border:`1px solid ${colors.border}`, padding:'10px 18px', flexShrink:0 }}>
                      <div style={{ fontSize:18, fontWeight:700, fontFamily:font.display, color:colors.text }}>{st.val}</div>
                      <div style={{ fontSize:11, color:colors.text3, marginTop:2, textTransform:'uppercase', letterSpacing:'.5px' }}>{st.lbl}</div>
                    </div>
                  ))}
                </div>

                <div className="page-pad" style={{ padding:`${space[6]}px 28px` }}>
                  {pinnedItems.length > 0 && (
                    <>
                      <SectionHead label="Pinned" />
                      <div className={`${cardGrid} animate-fade-in`} style={{ marginBottom:32 }}>
                        {pinnedItems.map(item => (
                          <ProductCard key={item.id} item={item} collections={collections} isDragging={dragSrc===item.id} onDragStart={() => setDragSrc(item.id)} onDragEnd={() => setDragSrc(null)} onDrop={() => onDrop(item.id)} onTogglePin={() => togglePin(item.id)} onToggleSaved={() => toggleSaved(item.id)} onToggleCollection={colId => toggleInCol(colId, item.id)} onNewCollection={newColFor} onRemove={() => removeItem(item.id)} />
                        ))}
                      </div>
                      <SectionHead label="All saves" />
                    </>
                  )}
                  {boardItems.length === 0 && pinnedItems.length === 0
                    ? <EmptyState icon="bookmark" title={search?`No results for "${search}"`:'Nothing saved yet'} subtitle={search?'Try a different search.':'Add items using the button above.'} />
                    : <div className={cardGrid}>
                        {boardItems.map(item => (
                          <ProductCard key={item.id} item={item} collections={collections} isDragging={dragSrc===item.id} onDragStart={() => setDragSrc(item.id)} onDragEnd={() => setDragSrc(null)} onDrop={() => onDrop(item.id)} onTogglePin={() => togglePin(item.id)} onToggleSaved={() => toggleSaved(item.id)} onToggleCollection={colId => toggleInCol(colId, item.id)} onNewCollection={newColFor} onRemove={() => removeItem(item.id)} />
                        ))}
                      </div>
                  }
                </div>
              </div>
            )}

            {/* ════ COLLECTIONS ════ */}
            {page === 'collections' && (
              <div className="animate-fade-in">
                {!viewingColId ? (
                  <>
                    <div className="page-pad" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:`20px 28px`, borderBottom:`1px solid ${colors.border}`, background:colors.card }}>
                      <div>
                        <h1 style={{ fontFamily:font.display, fontSize:22, fontWeight:800, color:colors.text, marginBottom:2 }}>Collections</h1>
                        <p style={{ fontSize:13, color:colors.text3 }}>Organise your saves into boards.</p>
                      </div>
                      <button style={btn('primary')} onClick={() => { const n=prompt('Collection name:'); if(n?.trim()){setCollections(p=>[...p,{id:'c'+nextColId,name:n.trim(),itemIds:[]}]);setNextColId(x=>x+1);toast.success(`"${n.trim()}" created`)} }}>
                        <Icon name="plus" /> New
                      </button>
                    </div>
                    <div className="page-pad" style={{ padding:`${space[6]}px 28px`, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:16 }}>
                      {collections.length === 0
                        ? <EmptyState icon="folder" title="No collections yet" subtitle="Create one to start organising your saves." />
                        : collections.map(col => {
                            const colItems = col.itemIds.map(id=>items.find(i=>i.id===id)).filter(Boolean) as Item[]
                            return (
                              <div key={col.id} className="card-hover" onClick={() => setViewingColId(col.id)} style={{ borderRadius:radius.xl, border:`1px solid ${colors.border}`, background:colors.card, overflow:'hidden', cursor:'pointer' }}>
                                {colItems.length === 0
                                  ? <div style={{ height:140, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, background:colors.bg3 }}>📦</div>
                                  : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2, height:140, overflow:'hidden' }}>
                                      {colItems.slice(0,4).map(it => <div key={it.id} style={{ overflow:'hidden' }}><ItemImage item={it} height={70} /></div>)}
                                    </div>
                                }
                                <div style={{ padding:'14px 16px 16px' }}>
                                  {renamingCol===col.id
                                    ? <input value={renameVal} onChange={e=>setRenameVal(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){setCollections(p=>p.map(c=>c.id===col.id?{...c,name:renameVal.trim()||c.name}:c));setRenamingCol(null);toast.success('Collection renamed')}if(e.key==='Escape')setRenamingCol(null)}} onBlur={()=>{setCollections(p=>p.map(c=>c.id===col.id?{...c,name:renameVal.trim()||c.name}:c));setRenamingCol(null)}} autoFocus onClick={e=>e.stopPropagation()} aria-label="Rename collection" style={{ fontFamily:font.display, fontSize:15, fontWeight:700, color:colors.text, border:'none', outline:'none', borderBottom:`2px solid ${colors.violet}`, background:'transparent', width:'100%' }} />
                                    : <div style={{ fontFamily:font.display, fontSize:15, fontWeight:700, color:colors.text, marginBottom:4 }}>{col.name}</div>
                                  }
                                  <div style={{ fontSize:12, color:colors.text3, marginBottom:12 }}>{colItems.length} item{colItems.length!==1?'s':''}</div>
                                  <div style={{ display:'flex', gap:6 }}>
                                    <button style={{ ...btn('ghost'), fontSize:11, padding:'5px 12px', borderRadius:6 }} onClick={e=>{e.stopPropagation();setRenamingCol(col.id);setRenameVal(col.name)}}><Icon name="pencil" /> Rename</button>
                                    <button style={{ ...btn('ghost'), fontSize:11, padding:'5px 12px', borderRadius:6 }} onClick={e=>{e.stopPropagation();if(confirm('Delete collection?')){setCollections(p=>p.filter(c=>c.id!==col.id));toast.info('Collection deleted')}}}><Icon name="trash" /> Delete</button>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                      }
                    </div>
                  </>
                ) : (
                  <div className="page-pad" style={{ padding:`${space[6]}px 28px` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, paddingBottom:20, borderBottom:`1px solid ${colors.border}` }}>
                      <button onClick={() => setViewingColId(null)} style={{ ...btn('ghost'), fontSize:13, padding:'7px 14px' }}><Icon name="arrow-left" /> Back</button>
                      <h1 style={{ fontFamily:font.display, fontSize:22, fontWeight:800, color:colors.text, flex:1 }}>{viewingCol?.name}</h1>
                    </div>
                    {viewingColItems.length === 0
                      ? <EmptyState icon="folder-open" title="No items yet" subtitle="Add items from My Saves." />
                      : <div className={cardGrid}>
                          {viewingColItems.map(item => (
                            <div key={item.id} style={{ borderRadius:radius.lg, overflow:'hidden', border:`1px solid ${colors.border}`, background:colors.card, position:'relative' }}>
                              <ItemImage item={item} height={140} />
                              <div style={{ padding:'10px 12px 12px' }}>
                                <div style={{ fontSize:12, color:colors.text, marginBottom:2, fontWeight:500 }}>{item.name}</div>
                                <div style={{ fontSize:13, fontFamily:font.display, fontWeight:700, color:colors.text2 }}>${item.is_sale?item.sale_price:item.price}</div>
                              </div>
                              <button onClick={() => {setCollections(p=>p.map(c=>c.id===viewingColId?{...c,itemIds:c.itemIds.filter(x=>x!==item.id)}:c));toast.info('Removed from collection')}} aria-label="Remove from collection" style={{ position:'absolute', top:8, right:8, width:24, height:24, borderRadius:6, background:colors.card, border:`1px solid ${colors.border}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:colors.text3 }}>
                                <Icon name="x" />
                              </button>
                            </div>
                          ))}
                        </div>
                    }
                  </div>
                )}
              </div>
            )}

            {/* ════ EXPLORE ════ */}
            {page === 'explore' && (
              <div className="animate-fade-in">
                <div className="page-pad" style={{ display:'flex', borderBottom:`1px solid ${colors.border}`, padding:`0 28px`, background:colors.card }} role="tablist" aria-label="Explore tabs">
                  {(['foryou','aesthetics'] as ExploreTab[]).map(t => (
                    <div key={t} onClick={() => setExTab(t)} role="tab" tabIndex={0} aria-selected={exTab===t} onKeyDown={e=>e.key==='Enter'&&setExTab(t)}
                      style={{ padding:'14px 18px', fontSize:13, color:exTab===t?colors.text:colors.text3, cursor:'pointer', borderBottom:exTab===t?`2px solid ${colors.text}`:'2px solid transparent', fontWeight:exTab===t?600:400, display:'flex', alignItems:'center', gap:6, transition:'all 150ms ease' }}>
                      <Icon name={t==='foryou'?'sparkles':'palette'} size={15} />{t==='foryou'?'For You':'Aesthetics'}
                    </div>
                  ))}
                </div>

                <div className="page-pad" style={{ padding:space[7] }}>
                  {budgetRow}

                  {exTab === 'foryou' && (
                    <>
                      <div style={{ background:colors.card, borderRadius:radius.xl, padding:`${space[6]}px ${space[7]}px`, marginBottom:32, border:`1px solid ${colors.border}` }}>
                        <h2 style={{ fontFamily:font.display, fontSize:24, fontWeight:800, color:colors.text, marginBottom:6 }}>Picked for you</h2>
                        <p style={{ fontSize:13, color:colors.text3, marginBottom:20, lineHeight:1.6 }}>{recSummary||"Claude analyses your saves and finds what you didn't know you wanted."}</p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:22 }}>
                          {[...topCats.map(c=>c.toLowerCase()),...topStores].map(chip => (
                            <span key={chip} style={{ padding:'4px 12px', borderRadius:radius.pill, background:colors.violetL, border:`1px solid ${colors.border2}`, fontSize:12, color:colors.violet, fontWeight:500 }}>{chip}</span>
                          ))}
                        </div>
                        <button style={btn('primary')} onClick={loadRecs} disabled={loadingRecs} aria-busy={loadingRecs}>
                          <Icon name={loadingRecs?'loader':'sparkles'} size={15} spin={loadingRecs} />
                          {loadingRecs?'Analysing…':recs.length?'Refresh picks':'Generate picks'}
                        </button>
                      </div>
                      {loadingRecs && <SkeletonGrid heights={[220,245,200,230,210,240]} />}
                      {!loadingRecs && recsError && <ErrorState title="Couldn't load picks" message="Check your Anthropic API key is set in Vercel environment variables." onRetry={loadRecs} />}
                      {!loadingRecs && !recsError && recs.map((sec,si) => (
                        <div key={si} style={{ marginBottom:32 }}>
                          <SectionHead label={sec.label} />
                          <div className={cardGrid}>
                            {sec.items.map((item,ii) => { const idx=si*3+ii; const rid=`rec-${idx}`; return <RecCard key={rid} item={item} idx={idx} saved={savedRecIds.has(rid)} onSave={() => saveRec(item, rid)} /> })}
                          </div>
                        </div>
                      ))}
                      {!loadingRecs && !recsError && recs.length===0 && <EmptyState icon="compass" title="Your picks are waiting" subtitle="Hit generate above." />}
                    </>
                  )}

                  {exTab === 'aesthetics' && (
                    <>
                      <p style={{ fontSize:13, color:colors.text3, marginBottom:24, lineHeight:1.6 }}>Select one or more aesthetics and we&apos;ll find pieces that match.</p>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:10, marginBottom:28 }}>
                        {AESTHETICS.map(a => {
                          const sel = selectedAes.has(a.id)
                          return (
                            <div key={a.id} onClick={() => setSelectedAes(p=>{const n=new Set(p);sel?n.delete(a.id):n.add(a.id);return n})} role="checkbox" aria-checked={sel} tabIndex={0} onKeyDown={e=>e.key==='Enter'&&setSelectedAes(p=>{const n=new Set(p);sel?n.delete(a.id):n.add(a.id);return n})}
                              className="card-hover"
                              style={{ borderRadius:radius.lg, overflow:'hidden', border:`${sel?2:1}px solid ${sel?colors.violet:colors.border}`, cursor:'pointer', background:colors.card, position:'relative' }}>
                              {sel && <div style={{ position:'absolute', top:8, right:8, width:22, height:22, background:colors.violet, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, zIndex:2 }} aria-hidden="true"><Icon name="check" /></div>}
                              <div style={{ height:80, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, background:isDark?a.bgDark:a.bg }}>{a.emoji}</div>
                              <div style={{ padding:'10px 12px 14px' }}>
                                <div style={{ fontSize:13, fontWeight:600, color:colors.text, marginBottom:3 }}>{a.name}</div>
                                <div style={{ fontSize:11, color:colors.text3, lineHeight:1.4 }}>{a.desc}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:32, flexWrap:'wrap' }}>
                        <span style={{ fontSize:13, color:colors.text3 }} aria-live="polite">{selectedAes.size===0?'Select at least one':<><strong style={{ color:colors.text }}>{selectedAes.size}</strong> selected</>}</span>
                        <button style={btn('primary')} onClick={loadAesRecs} disabled={selectedAes.size===0||loadingAes} aria-busy={loadingAes}>
                          <Icon name={loadingAes?'loader':'sparkles'} size={15} spin={loadingAes} />
                          {loadingAes?'Finding pieces…':'Shop this vibe'}
                        </button>
                      </div>
                      {loadingAes && <SkeletonGrid heights={[220,240,210]} />}
                      {!loadingAes && aesRecs.map((sec,si) => (
                        <div key={si} style={{ marginBottom:32 }}>
                          <SectionHead label={sec.label} />
                          <div className={cardGrid}>
                            {sec.items.map((item,ii) => { const idx=si*3+ii; const rid=`aes-${idx}`; return <RecCard key={rid} item={item} idx={idx} saved={savedRecIds.has(rid)} onSave={() => saveRec(item, rid)} /> })}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="mobile-nav" aria-label="Mobile navigation" style={{ borderTop:`1px solid ${colors.border}`, background:colors.card, justifyContent:'space-around', alignItems:'center', padding:'8px 0', flexShrink:0 }}>
          {([['saves','bookmark','Saves'],['collections','folder','Collections'],['explore','sparkles','Explore']] as [PageTab,string,string][]).map(([p,icon,label]) => (
            <button key={p} onClick={() => setPage(p)} aria-current={page===p?'page':undefined}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer', padding:'4px 16px', color:page===p?colors.text:colors.text3, fontFamily:font.body, fontSize:11, fontWeight:page===p?600:400 }}>
              <Icon name={icon} size={20} />
              {label}
            </button>
          ))}
        </nav>

        {/* ── MODAL ── */}
        {modal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }} onClick={() => setModal(null)} role="dialog" aria-modal="true" aria-label={modal==='url'?'Import from URL':'Add an item'}>
            <div className="animate-scale-in" style={{ background:colors.card, borderRadius:radius.xxl, padding:'28px 30px', width:440, maxWidth:'92%', maxHeight:'90vh', overflowY:'auto', border:`1px solid ${colors.border}` }} onClick={e=>e.stopPropagation()}>
              <h2 style={{ fontFamily:font.display, fontSize:20, fontWeight:800, color:colors.text, marginBottom:4 }}>{modal==='url'?'Import from URL':'Add an item'}</h2>
              <p style={{ fontSize:13, color:colors.text3, marginBottom:20 }}>{modal==='url'?"Paste a product link — we'll fill in the details.":'Fill in the details below.'}</p>

              {modal === 'url' && (
                <>
                  <label style={lbl} htmlFor="url-input">Product URL</label>
                  <div style={{ display:'flex', gap:8 }}>
                    <input id="url-input" value={urlInput} onChange={e=>setUrlInput(e.target.value)} placeholder="https://…" style={{ ...inp, flex:1 }} />
                    <button onClick={fetchFromUrl} disabled={urlStatus.type==='loading'} style={{ ...btn('primary'), borderRadius:radius.md, padding:'10px 16px', fontSize:12, whiteSpace:'nowrap' }}>
                      <Icon name={urlStatus.type==='loading'?'loader':'sparkles'} spin={urlStatus.type==='loading'} /> Extract
                    </button>
                  </div>
                  {urlStatus.type !== 'idle' && (
                    <div role="status" style={{ fontSize:12, marginTop:10, padding:'10px 14px', borderRadius:radius.md, background:urlStatus.type==='loading'?colors.violetL:urlStatus.type==='ok'?'rgba(0,150,80,0.1)':'rgba(220,0,0,0.08)', color:urlStatus.type==='ok'?'#166534':urlStatus.type==='err'?'#991B1B':colors.violet }}>
                      {urlStatus.msg}
                    </div>
                  )}
                  <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0', color:colors.text3, fontSize:12 }}>
                    <div style={{ flex:1, height:'1px', background:colors.border }} />or fill in manually<div style={{ flex:1, height:'1px', background:colors.border }} />
                  </div>
                </>
              )}

              <label style={lbl} htmlFor="item-name">Item name</label>
              <input id="item-name" value={modalFields.name} onChange={e=>setModalFields(f=>({...f,name:e.target.value}))} placeholder="e.g. Silk slip dress" style={inp} />
              <label style={lbl} htmlFor="item-store">Store / brand</label>
              <input id="item-store" value={modalFields.store} onChange={e=>setModalFields(f=>({...f,store:e.target.value}))} placeholder="e.g. Reformation" style={inp} />
              <label style={lbl} htmlFor="item-price">Price ($)</label>
              <input id="item-price" value={modalFields.price} onChange={e=>setModalFields(f=>({...f,price:e.target.value}))} placeholder="0" type="number" min="0" style={inp} />
              <label style={lbl} htmlFor="item-category">Category</label>
              <select id="item-category" value={modalFields.category} onChange={e=>setModalFields(f=>({...f,category:e.target.value as Category}))} style={inp}>
                {['Fashion','Home','Beauty','Tech','Other'].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <label style={lbl} htmlFor="item-note">Note (optional)</label>
              <input id="item-note" value={modalFields.note} onChange={e=>setModalFields(f=>({...f,note:e.target.value}))} placeholder="e.g. Want in size S" style={inp} />

              <div style={{ display:'flex', gap:10, marginTop:24, justifyContent:'flex-end' }}>
                <button onClick={() => setModal(null)} style={btn('secondary')}>Cancel</button>
                <button onClick={() => addItem(modalFields)} disabled={!modalFields.name.trim()} style={btn('primary')}>Save item</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── TOAST NOTIFICATIONS ── */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} isDark={isDark} />
    </>
  )
}
