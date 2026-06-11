'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth-client'
import { btn, inp, lbl, colors, radius, font } from '@/lib/tokens'
import { Icon } from '@/components/ui/Icon'
import { InlineError } from '@/components/ui/ErrorState'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    const { error } = await signUp.email({ name, email, password })
    setLoading(false)
    if (error) { setError(error.message || 'Sign up failed. Try again.'); return }
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
          <p style={{ fontSize: 13, color: colors.text3, marginTop: 6 }}>Your wishlist, but make it fashion.</p>
        </div>

        <form onSubmit={submit} style={{ background: colors.card, borderRadius: radius.xxl, padding: '28px 30px', border: `1px solid ${colors.border}` }}>
          <label style={{ ...lbl, marginTop: 0 }} htmlFor="name">Name</label>
          <input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inp} autoComplete="name" />

          <label style={lbl} htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inp} autoComplete="email" />

          <label style={lbl} htmlFor="password">Password</label>
          <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" style={inp} autoComplete="new-password" />

          <InlineError message={error} />

          <button type="submit" disabled={loading} style={{ ...btn('primary'), width: '100%', justifyContent: 'center', marginTop: 24, padding: '12px' }}>
            {loading ? <Icon name="loader" spin /> : <Icon name="sparkles" />}
            {loading ? 'Creating account…' : 'Create free account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: colors.text3, marginTop: 20 }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: colors.violet, fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
