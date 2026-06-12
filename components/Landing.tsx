'use client'
import Link from 'next/link'
import { btn, colors, radius, font, unsplashUrl, PHOTO_IDS, AESTHETICS } from '@/lib/tokens'
import { Icon } from '@/components/ui/Icon'

// ─── Editorial building blocks ────────────────────────────────────────────────

function PageFooter({ n, label }: { n: string; label: string }) {
  return (
    <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 40px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: colors.text3, fontFamily: font.body }}>
      <span>WANT* — Issue 001</span>
      <span>{label}</span>
      <span>{n}</span>
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: colors.pink, fontFamily: font.body, marginBottom: 18 }}>
      {children}
    </div>
  )
}

// ─── Landing ──────────────────────────────────────────────────────────────────

export function Landing() {
  const spread: React.CSSProperties = {
    height: '100vh',
    scrollSnapAlign: 'start',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 24px',
    overflow: 'hidden',
  }

  const fashionPhotos = PHOTO_IDS.Fashion.slice(0, 3)
  const beautyPhoto = PHOTO_IDS.Beauty[0]
  const homePhoto = PHOTO_IDS.Home[0]

  return (
    <div style={{ height: '100vh', overflowY: 'auto', scrollSnapType: 'y mandatory', background: colors.bg, color: colors.text }}>

      {/* ═══ PAGE 1 — THE COVER ═══ */}
      <section style={{ ...spread, background: colors.bg }} aria-label="Cover">
        {/* Masthead row */}
        <div style={{ position: 'absolute', top: 28, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 40px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: colors.text3, fontFamily: font.body }}>
          <span>Issue 001</span>
          <span>The Wishlist Edition</span>
          <span>Free forever</span>
        </div>

        <div style={{ textAlign: 'center', maxWidth: 720 }}>
          <h1 style={{ fontFamily: font.display, fontWeight: 400, fontSize: 'clamp(88px, 20vw, 220px)', lineHeight: 0.9, letterSpacing: '-0.02em', margin: 0 }}>
            WANT<span style={{ color: colors.pink }}>*</span>
          </h1>
          <p style={{ fontFamily: font.display, fontStyle: 'italic', fontSize: 'clamp(20px, 3.4vw, 32px)', color: colors.text2, marginTop: 18 }}>
            your wishlist, but make it fashion.
          </p>

          {/* Cover lines, like a magazine */}
          <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap', marginTop: 36, fontFamily: font.body, fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase', color: colors.text3 }}>
            <span>Save from any store</span>
            <span aria-hidden="true" style={{ color: colors.pink }}>·</span>
            <span>Organise by vibe</span>
            <span aria-hidden="true" style={{ color: colors.pink }}>·</span>
            <span>AI that knows your taste</span>
          </div>

          <div style={{ marginTop: 44, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/signup" style={{ ...btn('primary'), padding: '13px 28px', fontSize: 14, textDecoration: 'none' }}>
              Start your wishlist — free
            </Link>
            <Link href="/auth/login" style={{ ...btn('secondary'), padding: '12px 24px', fontSize: 14, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </div>

        {/* Flip hint */}
        <div style={{ position: 'absolute', bottom: 52, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: colors.text3, fontFamily: font.body, letterSpacing: '2px', textTransform: 'uppercase', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span>Flip through</span>
          <span style={{ display: 'inline-block', animation: 'fadeIn 1.2s ease infinite alternate' }} aria-hidden="true">↓</span>
        </div>
        <PageFooter n="01" label="Cover" />
      </section>

      {/* ═══ PAGE 2 — THE FEATURE: PASTE ANY LINK ═══ */}
      <section style={{ ...spread, background: colors.card }} aria-label="Save from any store">
        <div style={{ display: 'flex', gap: 'clamp(24px, 6vw, 80px)', alignItems: 'center', maxWidth: 1000, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Editorial copy */}
          <div style={{ flex: '1 1 340px', minWidth: 300, maxWidth: 460 }}>
            <Eyebrow>The feature · 01</Eyebrow>
            <h2 style={{ fontFamily: font.display, fontWeight: 400, fontSize: 'clamp(34px, 5vw, 54px)', lineHeight: 1.05, margin: 0 }}>
              Saw it. Saved it.<br />
              <em style={{ color: colors.pink }}>Real photo, real price.</em>
            </h2>
            <p style={{ fontFamily: font.body, fontSize: 14, lineHeight: 1.8, color: colors.text2, marginTop: 22 }}>
              Copy a product link from any store — paste it into WANT* and the actual
              photo, price, and details appear on your board. No screenshots in your
              camera roll. No tabs you&apos;ll never find again.
            </p>
            <p style={{ fontFamily: font.display, fontStyle: 'italic', fontSize: 19, color: colors.text3, marginTop: 22, borderLeft: `2px solid ${colors.pink}`, paddingLeft: 16 }}>
              &ldquo;like Pinterest, if Pinterest knew the price&rdquo;
            </p>
          </div>

          {/* Product card collage */}
          <div style={{ flex: '0 1 380px', display: 'flex', gap: 14, alignItems: 'flex-start' }} aria-hidden="true">
            {[0, 1].map(col => (
              <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: col === 1 ? 36 : 0 }}>
                {[fashionPhotos[col], col === 0 ? beautyPhoto : homePhoto].map((pid, i) => (
                  <div key={i} style={{ borderRadius: radius.xl, overflow: 'hidden', border: `1px solid ${colors.border}`, background: colors.bg, width: 'clamp(130px, 18vw, 175px)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={unsplashUrl(pid, 350, 380)} alt="" loading="lazy" style={{ width: '100%', height: 'clamp(120px, 16vw, 160px)', objectFit: 'cover', display: 'block' }} />
                    <div style={{ padding: '9px 11px 11px' }}>
                      <div style={{ fontSize: 8, letterSpacing: '1px', textTransform: 'uppercase', color: colors.text3, fontFamily: font.body, fontWeight: 600 }}>{['REFORMATION','MECCA','GLASSONS','CITTA'][col*2+i]}</div>
                      <div style={{ fontFamily: font.display, fontSize: 15, marginTop: 4 }}>{['$189','$54','$49','$89'][col*2+i]}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <PageFooter n="02" label="Save anything" />
      </section>

      {/* ═══ PAGE 3 — THE VIBES SPREAD ═══ */}
      <section style={{ ...spread, background: colors.bg }} aria-label="Organise by aesthetic">
        <div style={{ maxWidth: 880, textAlign: 'center' }}>
          <Eyebrow>The vibes · 02</Eyebrow>
          <h2 style={{ fontFamily: font.display, fontWeight: 400, fontSize: 'clamp(34px, 5vw, 54px)', lineHeight: 1.05, margin: 0 }}>
            Sort your wants <em style={{ color: colors.pink }}>by aesthetic,</em><br />not by folder.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 40, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
            {AESTHETICS.slice(0, 8).map(a => (
              <div key={a.id} style={{ borderRadius: radius.lg, border: `1px solid ${colors.border}`, background: colors.card, padding: '18px 12px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 26 }} aria-hidden="true">{a.emoji}</div>
                <div style={{ fontFamily: font.display, fontSize: 17, marginTop: 8 }}>{a.name}</div>
                <div style={{ fontFamily: font.body, fontSize: 10, color: colors.text3, marginTop: 4, fontStyle: 'italic' }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <PageFooter n="03" label="Your aesthetics" />
      </section>

      {/* ═══ PAGE 4 — THE AI EDITORIAL ═══ */}
      <section style={{ ...spread, background: colors.card }} aria-label="AI recommendations">
        <div style={{ maxWidth: 660, textAlign: 'center' }}>
          <Eyebrow>The clairvoyant · 03</Eyebrow>
          <h2 style={{ fontFamily: font.display, fontWeight: 400, fontSize: 'clamp(36px, 5.5vw, 60px)', lineHeight: 1.08, margin: 0 }}>
            It reads your saves like
            <em style={{ display: 'block', color: colors.pink, marginTop: 4 }}>tea leaves.</em>
          </h2>
          <p style={{ fontFamily: font.body, fontSize: 14, lineHeight: 1.8, color: colors.text2, marginTop: 24, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            WANT*&apos;s AI studies what you save — the stores, the silhouettes, the price points —
            and surfaces pieces you didn&apos;t know you wanted. Set a budget. Pick a vibe. Let it read you.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 30, padding: '10px 20px', borderRadius: radius.pill, background: colors.violetL, border: `1px solid ${colors.border2}`, fontFamily: font.body, fontSize: 12, color: colors.violet, fontWeight: 500 }}>
            <Icon name="sparkles" size={14} /> &ldquo;quiet luxury, but make it under $100&rdquo;
          </div>
        </div>
        <PageFooter n="04" label="Picked for you" />
      </section>

      {/* ═══ PAGE 5 — BACK COVER / CTA ═══ */}
      <section style={{ ...spread, background: colors.text, color: colors.bg }} aria-label="Sign up">
        <div style={{ textAlign: 'center', maxWidth: 620 }}>
          <p style={{ fontFamily: font.body, fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', color: colors.text3, margin: 0 }}>
            The back cover
          </p>
          <h2 style={{ fontFamily: font.display, fontWeight: 400, fontSize: 'clamp(44px, 8vw, 88px)', lineHeight: 1, marginTop: 20 }}>
            Stop losing<br />the things <em style={{ color: colors.pink }}>you want.</em>
          </h2>
          <p style={{ fontFamily: font.body, fontSize: 14, color: colors.text3, marginTop: 22 }}>
            Free to use. Takes thirty seconds. Your future wardrobe is waiting.
          </p>
          <Link
            href="/auth/signup"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 34, padding: '15px 34px', borderRadius: radius.md, background: colors.pink, color: '#fff', fontFamily: font.body, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}
          >
            Create your free account <Icon name="arrow-left" size={15} style={{ transform: 'rotate(180deg)' }} />
          </Link>
          <p style={{ fontFamily: font.display, fontStyle: 'italic', fontSize: 16, color: colors.text3, marginTop: 40 }}>
            WANT* — shop without limits
          </p>
        </div>
        <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 40px', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: colors.text3, fontFamily: font.body }}>
          <span>WANT* — Issue 001</span>
          <span>Made in Aotearoa</span>
          <span>05</span>
        </div>
      </section>
    </div>
  )
}
