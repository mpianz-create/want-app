export type Category = 'Fashion' | 'Home' | 'Beauty' | 'Tech' | 'Other'
export type FilterType = 'all' | 'sale' | 'new' | 'under100' | 'saved'
export type PageTab = 'saves' | 'collections' | 'explore'
export type ExploreTab = 'foryou' | 'aesthetics'
export type Theme = 'auto' | 'light' | 'dark'

export interface Item {
  id: number
  name: string
  store: string
  price: number
  sale_price: number | null
  is_sale: boolean
  is_new: boolean
  is_pinned: boolean
  is_saved: boolean
  category: Category
  note: string
}

export interface Collection {
  id: string
  name: string
  itemIds: number[]
}

export interface RecItem {
  name: string
  store: string
  price: number
  category: Category
  why: string
}

export interface RecSection {
  label: string
  items: RecItem[]
}
