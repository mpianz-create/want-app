'use client'
import { Icon } from './Icon'
import { useState, useEffect, useCallback, useRef } from 'react'
import { colors, radius, font, space } from '@/lib/tokens'

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Usage: const { toast } = useToast()
//        toast.success('Item saved!')
//        toast.error('Something went wrong.')
//        toast.info('Switching to dark mode.')

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts(p => p.filter(t => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) { clearTimeout(timer); timers.current.delete(id) }
  }, [])

  const show = useCallback((message: string, variant: ToastVariant = 'info', duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts(p => [...p.slice(-3), { id, message, variant }]) // max 4 at once
    const timer = setTimeout(() => dismiss(id), duration)
    timers.current.set(id, timer)
    return id
  }, [dismiss])

  // Cleanup all timers on unmount
  useEffect(() => {
    const current = timers.current
    return () => { current.forEach(t => clearTimeout(t)) }
  }, [])

  const toast = {
    success: (msg: string, ms?: number) => show(msg, 'success', ms),
    error:   (msg: string, ms?: number) => show(msg, 'error',   ms ?? 5000),
    info:    (msg: string, ms?: number) => show(msg, 'info',    ms),
  }

  return { toasts, toast, dismiss }
}

// ─── Component ────────────────────────────────────────────────────────────────
const VARIANT_STYLES: Record<ToastVariant, { bg: string; color: string; icon: string; border: string }> = {
  success: { bg: '#F0FFF4', color: '#166534', icon: 'circle-check',   border: 'rgba(22,101,52,0.2)' },
  error:   { bg: '#FFF0F0', color: '#991B1B', icon: 'alert-circle',   border: 'rgba(153,27,27,0.2)' },
  info:    { bg: colors.card, color: colors.text, icon: 'info-circle', border: colors.border2 },
}

const DARK_VARIANT_STYLES: Record<ToastVariant, { bg: string; color: string; border: string }> = {
  success: { bg: '#052e16', color: '#86efac', border: 'rgba(134,239,172,0.2)' },
  error:   { bg: '#2d0a0a', color: '#fca5a5', border: 'rgba(252,165,165,0.2)' },
  info:    { bg: '#1A1A1A', color: '#F0F0EE', border: 'rgba(255,255,255,0.13)' },
}

function ToastMessage({ toast, onDismiss, isDark }: { toast: ToastItem; onDismiss: (id: string) => void; isDark: boolean }) {
  const [visible, setVisible] = useState(false)
  const v = isDark ? DARK_VARIANT_STYLES[toast.variant] : VARIANT_STYLES[toast.variant]
  const icon = VARIANT_STYLES[toast.variant].icon

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex', alignItems: 'center', gap: space[2],
        padding: '12px 16px',
        background: v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: radius.xl,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        color: v.color,
        fontFamily: font.body, fontSize: 13, fontWeight: 500,
        minWidth: 260, maxWidth: 360,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 200ms ease, transform 200ms ease',
        cursor: 'default',
      }}
    >
      <Icon name={icon} size={16} />
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.6, padding: 2, display: 'flex', alignItems: 'center', flexShrink: 0 }}
      >
        <Icon name="x" />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onDismiss, isDark }: { toasts: ToastItem[]; onDismiss: (id: string) => void; isDark: boolean }) {
  if (toasts.length === 0) return null
  return (
    <div
      aria-label="Notifications"
      style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 300, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}
    >
      {toasts.map(t => (
        <ToastMessage key={t.id} toast={t} onDismiss={onDismiss} isDark={isDark} />
      ))}
    </div>
  )
}
