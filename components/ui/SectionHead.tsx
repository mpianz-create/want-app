import { sectionHeadStyle } from '@/lib/tokens'

export function SectionHead({ label }: { label: string }) {
  return <div style={sectionHeadStyle}>{label}</div>
}
