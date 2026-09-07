/** Rupiah formatter, "Rp1.250.000" (no space, id-ID grouping). */
export function rupiah(n: number | null | undefined, opts: { short?: boolean } = {}): string {
  const v = Math.round(Number(n) || 0)
  if (opts.short) {
    if (Math.abs(v) >= 1_000_000_000) return `Rp${trim((v / 1_000_000_000).toFixed(1))} M`
    if (Math.abs(v) >= 1_000_000) return `Rp${trim((v / 1_000_000).toFixed(1))} jt`
    if (Math.abs(v) >= 1_000) return `Rp${Math.round(v / 1_000)} rb`
  }
  return 'Rp' + v.toLocaleString('id-ID')
}
const trim = (s: string) => s.replace(/\.0$/, '').replace('.', ',')

/** Points, "6.027" */
export function poin(n: number | null | undefined): string {
  return Math.max(0, Math.round(Number(n) || 0)).toLocaleString('id-ID')
}

/** "04 Sep 2026" */
export function fmtDate(iso: string | Date | null | undefined, withTime = false): string {
  if (!iso) return '-'
  const d = typeof iso === 'string' ? new Date(iso) : iso
  if (Number.isNaN(d.getTime())) return '-'
  const s = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  return withTime ? `${s} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : s
}

/** "Sep 2026" */
export function fmtMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
}

/** mm:ss countdown */
export function mmss(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export const todayISO = () => new Date().toISOString().slice(0, 10)
export const nowISO = () => new Date().toISOString()
