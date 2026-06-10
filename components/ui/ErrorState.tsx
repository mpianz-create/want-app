'use client'
import { Icon } from './Icon'
import { btn, colors, radius, font, space } from '@/lib/tokens'

// ─── Inline error (form fields, API responses) ────────────────────────────────
export function InlineError({ message }: { message: string }) {
  if (!message) return null
  return (
    <div
      role="alert"
      style={{ display: 'flex', alignItems: 'center', gap: space[2], fontSize: 12, color: '#991B1B', background: '#FFF0F0', border: '1px solid rgba(153,27,27,0.2)', borderRadius: radius.md, padding: '8px 12px', marginTop: 6 }}
    >
      <Icon name="alert-circle" />
      {message}
    </div>
  )
}

// ─── Full page / section error ────────────────────────────────────────────────
interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({ title = 'Something went wrong', message = 'An unexpected error occurred. Please try again.', onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      style={{ textAlign: 'center', padding: '60px 20px', color: colors.text3 }}
    >
      <Icon name="alert-triangle" />
      <p style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 6, fontFamily: font.display }}>{title}</p>
      <p style={{ fontSize: 13, marginBottom: onRetry ? 20 : 0, maxWidth: 320, margin: '0 auto', lineHeight: 1.6 }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{ ...btn('secondary'), marginTop: 20 }}>
          <Icon name="refresh" /> Try again
        </button>
      )}
    </div>
  )
}

// ─── API call error banner ────────────────────────────────────────────────────
export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div
      role="alert"
      style={{ display: 'flex', alignItems: 'center', gap: space[2], padding: '10px 16px', background: '#FFF0F0', border: '1px solid rgba(153,27,27,0.2)', borderRadius: radius.xl, fontSize: 13, color: '#991B1B' }}
    >
      <Icon name="alert-circle" />
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.6, padding: 2 }} aria-label="Dismiss">
          <Icon name="x" />
        </button>
      )}
    </div>
  )
}
