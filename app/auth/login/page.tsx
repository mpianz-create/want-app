'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/auth-client'
import { btn, inp, lbl, colors, radius, font } from '@/lib/tokens'
import { Icon } from '@/components/ui/Icon'
import { InlineError } from '@/components/ui/ErrorState'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error } = await signIn.email({ email, password })
    setLoading(false)
    if (error) { setError(error.message || 'Login failed. Check your details.'); return }
    router.push('/')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: 400, maxWidth: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontFamily: font.display, fontSize: 40, fontWeight: 400, letterSpacing: '-0.5px', color: colors.text }}>
            WANT<span style={{ color: colors.pink }}>*</span>
          </span>
          <p style={{ fontSize: 13, color: colors.text3, marginTop: 6 }}>Welcome back. Your wishlist missed you.</p>
        </div>

        <form onSubmit={submit} style={{ background: colors.card, borderRadius: radius.xxl, padding: '28px 30px', border: `1px solid ${colors.border}` }}>
          <label style={{ ...lbl, marginTop: 0 }} htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inp} autoComplete="email" />

          <label style={lbl} htmlFor="password">Password</label>
          <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inp} autoComplete="current-password" />

          <InlineError message={error} />

          <button type="submit" disabled={loading} style={{ ...btn('primary'), width: '100%', justifyContent: 'center', marginTop: 24, padding: '12px' }}>
            {loading ? <Icon name="loader" spin /> : <Icon name="arrow-left" style={{ transform: 'rotate(180deg)' }} />}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: colors.text3, marginTop: 20 }}>
          No account yet?{' '}
          <Link href="/auth/signup" style={{ color: colors.violet, fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
