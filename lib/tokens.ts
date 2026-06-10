// ─── Design tokens ────────────────────────────────────────────────────────────
// Single source of truth for all inline style values.
// CSS variables handle light/dark switching — these tokens reference them.

import type React from 'react'

// ── Colour references (use in style={{ color: colors.text }}) ──
export const colors = {
  text:    'var(--text)',
  text2:   'var(--text2)',
  text3:   'var(--text3)',
  bg:      'var(--bg)',
  bg3:     'var(--bg3)',
  card:    'var(--card)',
  border:  'var(--border)',
  border2: 'var(--border2)',
  violet:  'var(--v)',
  violetL: 'var(--vl)',
  pink:    'var(--p)',
  pinkL:   'var(--pl)',
  gold:    'var(--y)',
  lavender:'var(--lv)',
}

// ── Border radius ──
export const radius = {
  sm:   6,
  md:   8,
  lg:   10,
  xl:   12,
  xxl:  16,
  pill: 20,
  full: '50%',
} as const

// ── Spacing ──
export const space = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  6:  24,
  7:  28,
  8:  32,
} as const

// ── Typography ──
export const font = {
  display: "'Syne', sans-serif",
  body:    "'Space Grotesk', sans-serif",
} as const

// ── Product image heights ──
export const CARD_HEIGHTS = [260, 300, 230, 280, 250, 290, 220, 270]

// ── Curated Unsplash photo IDs by category ──
export const PHOTO_IDS: Record<string, string[]> = {
  Fashion: ['NMZdj2Zu36M','omNDTa2oPGg','1_Xp8JFBqDk','WpVjIE3PpGo','I2YSmEUAgDY','mEZ3PoFGs_k'],
  Home:    ['RkBTPqPEGDo','Bkci_8qcdvQ','5SdBLMlFRMg','IFLgWYlT2fI','lH6YGqPKSA4','v3-zcCWMjgM'],
  Beauty:  ['jmURdhtm7Ng','9PqSMHNpNEA','AHF_ZktTL6Q','b-TdPAf_RHQ','z1d-LP8sjuI','iHm6DqPJxuI'],
  Tech:    ['eHD8Y1Znfpk','LJ9KY8pIH3E','IgUR1iX0mqM','X6Uj51n5CE8','ZRns6R5BoSw','E0Spm6XXn4A'],
  Other:   ['RkIsyI0nEio','V3DokM1NQcs','1_Xp8JFBqDk'],
}

export const CATEGORY_EMOJI: Record<string, string> = {
  Fashion: '👜', Home: '🕯️', Beauty: '💄', Tech: '📱', Other: '🛍️',
}

export const AESTHETICS = [
  { id: 'ql',    name: 'quiet luxury',  emoji: '🤍', bg: '#F5F3EE', bgDark: '#1E1C18', desc: 'minimal. timeless. no logos.' },
  { id: 'da',    name: 'dark academia', emoji: '🕯️', bg: '#EDE8E0', bgDark: '#1A1610', desc: 'tweed. candles. obsession.' },
  { id: 'cg',    name: 'coastal grandma',emoji:'🌊', bg: '#E8F0F0', bgDark: '#101818', desc: 'linen. ocean. effortless.' },
  { id: 'cc',    name: 'cottagecore',   emoji: '🌿', bg: '#EBF0E5', bgDark: '#121810', desc: 'floral. wicker. whimsy.' },
  { id: 'clean', name: 'clean girl',    emoji: '✨', bg: '#F5F3EE', bgDark: '#1E1C18', desc: 'glowy. gold hoops. fresh.' },
  { id: 'y2k',   name: 'y2k revival',   emoji: '💿', bg: '#EEE8F5', bgDark: '#180E28', desc: 'metallics. butterfly clips. chaos.' },
  { id: 'sw',    name: 'streetwear',    emoji: '🔥', bg: '#EEEEEE', bgDark: '#181818', desc: 'oversized. sneakers. attitude.' },
  { id: 'bh',    name: 'boho chic',     emoji: '🪬', bg: '#F0EBE0', bgDark: '#1E1608', desc: 'fringe. earthy. free-spirited.' },
]

// ── Style factories ──────────────────────────────────────────────────────────
// These return CSSProperties objects — use as style={{ ...btn() }}

export function btn(variant: 'primary' | 'secondary' | 'ghost' = 'primary'): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: space[2],
    cursor: 'pointer', border: 'none', fontFamily: font.body,
    fontWeight: 600, fontSize: 13, borderRadius: radius.md,
    transition: 'all .15s', whiteSpace: 'nowrap',
  }
  if (variant === 'primary') return { ...base, background: colors.text, color: colors.bg, padding: '9px 18px' }
  if (variant === 'secondary') return { ...base, background: 'transparent', color: colors.text, border: `1px solid ${colors.border2}`, padding: '8px 16px' }
  return { ...base, background: 'transparent', color: colors.text2, border: `1px solid ${colors.border}`, padding: '7px 14px' }
}

export function pill(active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', padding: `6px ${space[4]}px`,
    borderRadius: radius.pill, fontSize: 12, cursor: 'pointer',
    fontFamily: font.body, whiteSpace: 'nowrap', transition: 'all .15s',
    border: active ? 'none' : `1px solid ${colors.border2}`,
    background: active ? colors.text : 'transparent',
    color: active ? colors.bg : colors.text2,
    fontWeight: active ? 600 : 400,
  }
}

export function iconBtn(active = false, activeColor = colors.pink): React.CSSProperties {
  return {
    width: 30, height: 30, borderRadius: radius.sm,
    border: active ? `1px solid ${activeColor}40` : `1px solid ${colors.border}`,
    background: active ? `${activeColor}18` : 'transparent',
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', color: active ? activeColor : colors.text3,
    fontSize: 14, transition: 'all .15s', flexShrink: 0,
  }
}

export const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  border: `1px solid ${colors.border2}`, borderRadius: radius.md,
  fontFamily: font.body, fontSize: 13,
  color: colors.text, background: colors.card, outline: 'none',
}

export const lbl: React.CSSProperties = {
  fontSize: 11, color: colors.text3, display: 'block',
  marginBottom: 5, marginTop: space[4],
  letterSpacing: '.5px', textTransform: 'uppercase',
}

export const sectionHeadStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '1px',
  textTransform: 'uppercase', color: colors.text3, marginBottom: space[4],
}

// ── Helpers ──
export function unsplashUrl(photoId: string, w: number, h: number): string {
  return `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&fit=crop&crop=center&auto=format&q=80`
}

export function getPhotoId(category: string, id: number): string {
  const ids = PHOTO_IDS[category] || PHOTO_IDS.Other
  return ids[id % ids.length]
}

export function isDarkHour(): boolean {
  const h = new Date().getHours()
  return h >= 20 || h < 7
}

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 20 || h < 4) return 'Good evening'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
