'use client'

interface Props { height: number }

export function SkeletonCard({ height }: Props) {
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--card)' }}>
      <div style={{ height, background: 'var(--bg3)', animation: 'pulse 1.4s ease-in-out infinite' }} />
      <div style={{ padding: '12px 14px 14px' }}>
        {[35, 85, 55].map((w, i) => (
          <div key={i} style={{ height: 11, borderRadius: 4, background: 'var(--bg3)', marginBottom: 7, width: `${w}%`, animation: 'pulse 1.4s ease-in-out infinite' }} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonGrid({ heights }: { heights: number[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
      {heights.map((h, i) => <SkeletonCard key={i} height={h} />)}
    </div>
  )
}
