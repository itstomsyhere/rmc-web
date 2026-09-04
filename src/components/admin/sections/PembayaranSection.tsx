import * as React from 'react'
import { toast } from 'sonner'
import { useConfig } from '@/store/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/label'
import { useDraft } from '../useDraft'
import { CheckRow, NumInput, PageHead, SaveBar, SettingsCard } from '../parts'

const splitList = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean)

export function PembayaranSection() {
  const d = useDraft('payment', 'Pembayaran')
  return (
    <div data-admin-section="pembayaran" className="space-y-4">
      <PageHead title="Pembayaran" sub="Parameter QRIS demo, kanal alternatif, dan kunci admin halaman ini." />

      <SettingsCard title="QRIS" desc="Prototype menampilkan QR statis; produksi memakai QRIS dinamis per pesanan.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama merchant" htmlFor="pay-merchant"><Input id="pay-merchant" value={d.draft.qrisMerchant} className="h-10 text-[14px]" onChange={e => d.patch({ qrisMerchant: e.target.value })} /></Field>
          <Field label="NMID" htmlFor="pay-nmid"><Input id="pay-nmid" value={d.draft.qrisNmid} className="h-10 font-mono text-[14px]" onChange={e => d.patch({ qrisNmid: e.target.value })} /></Field>
          <Field label="Batas waktu QR (detik)" htmlFor="pay-timeout" hint={`${Math.round(d.draft.qrTimeoutSec / 60)} menit — pesanan kedaluwarsa jika belum dibayar.`}><NumInput id="pay-timeout" value={d.draft.qrTimeoutSec} min={30} className="h-10" onChange={n => d.patch({ qrTimeoutSec: n })} /></Field>
          <Field label="Jeda unggah bukti (detik)" htmlFor="pay-delay" hint="Tombol unggah bukti baru aktif setelah jeda ini."><NumInput id="pay-delay" value={d.draft.uploadDelaySec} min={0} className="h-10" onChange={n => d.patch({ uploadDelaySec: n })} /></Field>
        </div>
      </SettingsCard>

      <SettingsCard title="Kanal alternatif" desc="Virtual account dan e-wallet. Daftar dipisah koma.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <CheckRow id="pay-va" checked={d.draft.vaEnabled} onChange={v => d.patch({ vaEnabled: v })} label="Aktifkan Virtual Account" />
            <Field label="Bank VA" htmlFor="pay-va-banks" hint="Contoh: BCA, BNI, Mandiri, BRI"><Input id="pay-va-banks" value={d.draft.vaBanks.join(', ')} disabled={!d.draft.vaEnabled} className="h-10 text-[14px]" onChange={e => d.patch({ vaBanks: splitList(e.target.value) })} /></Field>
          </div>
          <div className="space-y-3">
            <CheckRow id="pay-ew" checked={d.draft.ewalletEnabled} onChange={v => d.patch({ ewalletEnabled: v })} label="Aktifkan e-wallet" />
            <Field label="E-wallet" htmlFor="pay-ewallets" hint="Contoh: GoPay, ShopeePay, OVO, DANA"><Input id="pay-ewallets" value={d.draft.ewallets.join(', ')} disabled={!d.draft.ewalletEnabled} className="h-10 text-[14px]" onChange={e => d.patch({ ewallets: splitList(e.target.value) })} /></Field>
          </div>
        </div>
        <SaveBar dirty={d.dirty} onSave={() => d.save()} onReset={d.reset} />
      </SettingsCard>

      <PasscodeCard />
    </div>
  )
}

function PasscodeCard() {
  const passcode = useConfig(s => s.config.admin.passcode)
  const setSection = useConfig(s => s.setSection)
  const [cur, setCur] = React.useState('')
  const [next, setNext] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const mismatch = confirm.length > 0 && next !== confirm
  const tooShort = next.length > 0 && next.length < 6
  const canSave = cur === passcode && next.length >= 6 && next === confirm
  const submit = () => {
    if (cur !== passcode) { toast.error('Kode akses saat ini salah'); return }
    setSection('admin', { passcode: next })
    setCur(''); setNext(''); setConfirm('')
    toast.success('Kode akses admin diperbarui')
  }
  return (
    <SettingsCard title="Kode akses admin" desc="Prototype: gerbang halaman ini. Produksi memakai peran UM, bukan kode akses.">
      <form className="grid gap-4 sm:grid-cols-3" onSubmit={e => { e.preventDefault(); if (canSave) submit() }}>
        <Field label="Kode saat ini" htmlFor="pc-cur"><Input id="pc-cur" type="password" autoComplete="current-password" value={cur} className="h-10" onChange={e => setCur(e.target.value)} /></Field>
        <Field label="Kode baru" htmlFor="pc-new" error={tooShort ? 'Minimal 6 karakter' : undefined}><Input id="pc-new" type="password" autoComplete="new-password" value={next} aria-invalid={tooShort || undefined} className="h-10" onChange={e => setNext(e.target.value)} /></Field>
        <Field label="Ulangi kode baru" htmlFor="pc-conf" error={mismatch ? 'Tidak sama dengan kode baru' : undefined}><Input id="pc-conf" type="password" autoComplete="new-password" value={confirm} aria-invalid={mismatch || undefined} className="h-10" onChange={e => setConfirm(e.target.value)} /></Field>
        <div className="sm:col-span-3 flex justify-end"><Button type="submit" size="sm" disabled={!canSave}>Ganti kode akses</Button></div>
      </form>
    </SettingsCard>
  )
}
