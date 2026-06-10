import { Icon } from './Icon'
interface Props {
  icon: string
  title: string
  subtitle?: string
}

export function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text3)' }}>
      <Icon name={icon} size={48} style={{ display: 'block', margin: '0 auto 16px', color: 'var(--color-border2)' }} />
      <p style={{ fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13 }}>{subtitle}</p>}
    </div>
  )
}
