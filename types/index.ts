export type Category = 'Fashion' | 'Home' | 'Beauty' | 'Tech' | 'Other'
export type FilterType = 'all' | 'sale' | 'new' | 'under100' | 'saved'
export type PageTab = 'saves' | 'collections' | 'explore'
export type ExploreTab = 'foryou' | 'aesthetics'
export type Theme = 'auto' | 'light' | 'dark'

export interface Item {
  id: string
  name: string
  store: string
  price: number
  salePrice: number | null
  isSale: boolean
  isNew: boolean
  isPinned: boolean
  isSaved: boolean
  category: Category
  note: string
  imageUrl?: string | null
  productUrl?: string | null
}

export interface Collection {
  id: string
  name: string
  itemIds: string[]
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
