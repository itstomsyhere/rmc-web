import * as React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ExternalLink, Lock, LockKeyhole } from 'lucide-react'
import { useConfig } from '@/store/config'
import { useSession } from '@/store/session'
import { useCrm } from '@/store/crm'
import { useOrders } from '@/store/orders'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminShell, isAdminSection, type AdminSectionId } from '@/components/admin/AdminShell'
import { KontenSection } from '@/components/admin/sections/KontenSection'
import { AsetSection } from '@/components/admin/sections/AsetSection'
import { BenefitSection } from '@/components/admin/sections/BenefitSection'
import { KampanyeSection } from '@/components/admin/sections/KampanyeSection'
import { HadiahSection } from '@/components/admin/sections/HadiahSection'
import { ItemsSection } from '@/components/admin/sections/ItemsSection'
import { PembayaranSection } from '@/components/admin/sections/PembayaranSection'
import { TransaksiSection } from '@/components/admin/sections/TransaksiSection'
import { KlaimSection } from '@/components/admin/sections/KlaimSection'
import { AkunSection } from '@/components/admin/sections/AkunSection'
import { ResetSection } from '@/components/admin/sections/ResetSection'

const SECTIONS: Record<AdminSectionId, React.ComponentType> = {
  konten: KontenSection, aset: AsetSection, benefit: BenefitSection,
  kampanye: KampanyeSection, hadiah: HadiahSection, items: ItemsSection,
  pembayaran: PembayaranSection, transaksi: TransaksiSection, klaim: KlaimSection,
  akun: AkunSection, reset: ResetSection,
}

/* `#/admin?embed=1&tab=…` is what the UM app iframes; `?key=<passcode>` skips the gate for deep links. */
export function AdminPage() {
  const [params, setParams] = useSearchParams()
  const embed = params.get('embed') === '1'
  const key = params.get('key')
  const tabParam = params.get('tab')
  const tab: AdminSectionId = isAdminSection(tabParam) ? tabParam : 'konten'

  const passcode = useConfig(s => s.config.admin.passcode)
  const logo = useConfig(s => s.config.assets.logo)
  const unlocked = useSession(s => s.adminUnlocked)
  const unlock = useSession(s => s.unlockAdmin)
  const lock = useSession(s => s.lockAdmin)
  const openClaims = useCrm(s => s.claims.filter(c => c.status === 'open').length)
  const pendingProofs = useOrders(s => s.orders.filter(o => o.status === 'Bukti Diunggah').length)

  React.useEffect(() => { document.title = 'Golden Privilege · Konfigurasi' }, [])
  React.useEffect(() => { if (!unlocked && key && key === passcode) unlock() }, [key, passcode, unlocked, unlock])

  const setTab = (id: AdminSectionId) => setParams(p => { const n = new URLSearchParams(p); n.set('tab', id); return n }, { replace: true })

  if (!unlocked && key !== passcode) return <Gate onUnlock={unlock} passcode={passcode} logo={logo} />

  const Section = SECTIONS[tab]
  return (
    <div className="min-h-dvh bg-bg">
      {!embed && (
        <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2.5">
              <img src={logo} alt="" className="h-8 w-8 rounded-[9px]" />
              <p className="truncate text-[14px] font-extrabold tracking-tight text-teal-700">Golden Privilege <span className="font-semibold text-ink-3">· Konfigurasi</span></p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button asChild variant="ghost" size="sm"><Link to="/">Lihat situs<ExternalLink strokeWidth={1.6} /></Link></Button>
              <Button variant="outline" size="sm" onClick={() => lock()}><Lock strokeWidth={1.6} />Kunci</Button>
            </div>
          </div>
        </header>
      )}
      <AdminShell active={tab} onChange={setTab} embed={embed} badges={{ klaim: openClaims, transaksi: pendingProofs }}>
        <Section key={tab} />
      </AdminShell>
    </div>
  )
}

function Gate({ onUnlock, passcode, logo }: { onUnlock: () => void; passcode: string; logo: string }) {
  const [v, setV] = React.useState('')
  const [err, setErr] = React.useState<string | undefined>()
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (v === passcode) { onUnlock(); return }
    setErr('Kode akses salah')
  }
  return (
    <div className="grid min-h-dvh place-items-center bg-bg px-4 py-10">
      <Card className="w-full max-w-sm" data-admin-gate>
        <CardHeader className="items-center text-center">
          <img src={logo} alt="" className="mb-2 h-12 w-12 rounded-xl" />
          <CardTitle>Golden Privilege — Admin</CardTitle>
          <CardDescription>Masukkan kode akses untuk membuka konfigurasi.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Kode akses" htmlFor="admin-passcode" error={err}>
              <Input id="admin-passcode" type="password" autoFocus autoComplete="current-password" value={v} aria-invalid={!!err || undefined} onChange={e => { setV(e.target.value); setErr(undefined) }} />
            </Field>
            <Button type="submit" className="w-full" disabled={!v}><LockKeyhole strokeWidth={1.6} />Buka</Button>
            <p className="text-center text-[12px] text-ink-3">Prototype: kode akses menggantikan peran UM. <Link to="/" className="text-teal-600 underline-offset-2 hover:underline">Kembali ke situs</Link></p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
