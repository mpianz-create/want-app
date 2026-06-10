import type { Item, Collection } from '@/types'

export const INITIAL_ITEMS: Item[] = [
  { id: 0, name: 'Linen Oversized Blazer',    store: '& Other Stories', price: 149, sale_price: null, is_sale: false, is_new: false, is_pinned: true,  is_saved: true,  category: 'Fashion', note: '' },
  { id: 1, name: 'Ceramic Table Lamp',         store: 'Muji',            price: 89,  sale_price: 62,   is_sale: true,  is_new: true,  is_pinned: false, is_saved: false, category: 'Home',    note: 'For bedside table' },
  { id: 2, name: 'Vitamin C Serum 20%',        store: 'The Ordinary',    price: 12,  sale_price: null, is_sale: false, is_new: false, is_pinned: false, is_saved: true,  category: 'Beauty',  note: '' },
  { id: 3, name: 'Leather Mini Shoulder Bag',  store: 'ZARA',            price: 69,  sale_price: 45,   is_sale: true,  is_new: false, is_pinned: false, is_saved: false, category: 'Fashion', note: 'Want in black' },
  { id: 4, name: 'Noise-Cancelling Headphones',store: 'Sony',            price: 349, sale_price: null, is_sale: false, is_new: false, is_pinned: false, is_saved: true,  category: 'Tech',    note: '' },
  { id: 5, name: 'Beeswax Pillar Candle Set',  store: 'Aesop',           price: 48,  sale_price: null, is_sale: false, is_new: true,  is_pinned: false, is_saved: false, category: 'Home',    note: '' },
  { id: 6, name: 'High-Rise Tailored Trousers',store: 'COS',             price: 115, sale_price: null, is_sale: false, is_new: true,  is_pinned: false, is_saved: false, category: 'Fashion', note: 'Check sizing' },
  { id: 7, name: 'SPF 50 Tinted Moisturiser',  store: 'Fenty Skin',      price: 38,  sale_price: 26,   is_sale: true,  is_new: false, is_pinned: false, is_saved: true,  category: 'Beauty',  note: '' },
]

export const INITIAL_COLLECTIONS: Collection[] = [
  { id: 'c1', name: 'Summer fits',   itemIds: [0, 3, 6] },
  { id: 'c2', name: 'Home refresh',  itemIds: [1, 5] },
]
