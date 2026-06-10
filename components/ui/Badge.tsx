type BadgeVariant = 'sale' | 'new' | 'pinned'

const styles: Record<BadgeVariant, React.CSSProperties> = {
  sale:   { background: 'var(--p)', color: '#fff' },
  new:    { background: 'var(--text)', color: 'var(--bg)' },
  pinned: { background: 'var(--y)', color: '#fff' },
}

export function Badge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  return (
    <span style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, ...styles[variant] }}>
      {children}
    </span>
  )
}
