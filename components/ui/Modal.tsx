'use client'
import { btn, inp, lbl, colors, radius, space } from '@/lib/tokens'

interface Props {
  title: string
  subtitle: string
  onClose: () => void
  children: React.ReactNode
  footer: React.ReactNode
}

export function Modal({ title, subtitle, onClose, children, footer }: Props) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
      onClick={onClose}
    >
      <div
        style={{ background: colors.card, borderRadius: radius.xxl, padding: '28px 30px', width: 440, maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', border: `1px solid ${colors.border}` }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: colors.text, marginBottom: 4 }}>{title}</h2>
        <p style={{ fontSize: 13, color: colors.text3, marginBottom: space[6] }}>{subtitle}</p>
        {children}
        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          {footer}
        </div>
      </div>
    </div>
  )
}

// Re-export helpers so modal consumers can import from one place
export { btn, inp, lbl }
