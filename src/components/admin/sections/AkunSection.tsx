import type { Account } from '@/model/types'
import { fmtDate } from '@/lib/format'
import { displayPhone } from '@/model/phone'
import { useAccounts } from '@/store/accounts'
import { useCrm } from '@/store/crm'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { EmptyState, Table, TBody, TD, TH, THead, TR } from '@/components/ui/misc'
import { PageHead, SettingsCard } from '../parts'

const LINK: Record<Account['link'], { label: string; variant: BadgeProps['variant'] }> = {
  LINKED: { label: 'Terhubung', variant: 'ok' },
  PENDING: { label: 'Menunggu klaim', variant: 'warn' },
  LEAD: { label: 'Lead', variant: 'muted' },
}
const PATH: Record<Account['matchPath'], string> = { 1: 'HP cocok', 2: 'RSL + nama', 3: 'Nama mirip', 4: 'Tidak cocok' }

export function AkunSection() {
  const accounts = useAccounts(s => s.accounts)
  const audit = useCrm(s => s.audit)
  const latest = audit.slice(0, 100)

  return (
    <div data-admin-section="akun" className="space-y-4">
      <PageHead title="Akun & Audit" sub="Akun RMC Web yang terdaftar di browser ini dan jejak audit sisi CRM (100 terbaru)." />

      <SettingsCard title="Akun terdaftar" desc={`${accounts.length} akun · ${accounts.filter(a => a.link === 'LINKED').length} terhubung ke pelanggan CRM.`} bodyClassName="p-0">
        {accounts.length === 0 ? <div className="p-5"><EmptyState title="Belum ada akun" desc="Daftar lewat halaman Daftar di situs untuk mengisi tabel ini." /></div> : (
          <Table>
            <THead><TR><TH className="pl-5">Laundry</TH><TH>PIC</TH><TH>HP</TH><TH>Email</TH><TH>Kota</TH><TH>Status</TH><TH>Jalur</TH><TH className="pr-5">Dibuat</TH></TR></THead>
            <TBody>
              {accounts.map(a => (
                <TR key={a.id}>
                  <TD className="pl-5"><span className="font-semibold">{a.laundry}</span>{a.rsl && <span className="block t-code text-[11px] text-ink-3">{a.rsl}</span>}</TD>
                  <TD>{a.pic}</TD>
                  <TD className="t-num whitespace-nowrap">{displayPhone(a.phone)}</TD>
                  <TD className="text-ink-3">{a.email}</TD>
                  <TD>{a.kota}</TD>
                  <TD><Badge variant={LINK[a.link].variant}>{LINK[a.link].label}</Badge>{a.crmCustomerId && <span className="block t-code text-[11px] text-ink-3">{a.crmCustomerId}</span>}</TD>
                  <TD className="text-ink-2">{a.matchPath} · {PATH[a.matchPath]}{a.matchScore != null && a.matchPath === 3 ? ` (${Math.round(a.matchScore * 100)}%)` : ''}</TD>
                  <TD className="whitespace-nowrap pr-5 text-ink-3">{fmtDate(a.createdAt, true)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </SettingsCard>

      <SettingsCard title="Jejak audit" desc={`${audit.length} entri · menampilkan ${latest.length} terbaru.`} bodyClassName="p-0">
        {latest.length === 0 ? <div className="p-5"><EmptyState title="Belum ada aktivitas" desc="Pendaftaran, pesanan, dan verifikasi tercatat di sini." /></div> : (
          <ol className="divide-y divide-line-2">
            {latest.map(r => (
              <li key={r.id} className="grid gap-x-4 gap-y-0.5 px-5 py-2.5 text-[13px] sm:grid-cols-[150px_1fr]">
                <time className="t-num whitespace-nowrap text-[12px] text-ink-3" dateTime={r.t}>{fmtDate(r.t, true)}</time>
                <div className="min-w-0"><p className="font-semibold text-ink">{r.event}</p><p className="truncate text-[12px] text-ink-3">{r.meta}</p></div>
              </li>
            ))}
          </ol>
        )}
      </SettingsCard>
    </div>
  )
}
