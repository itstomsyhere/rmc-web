import * as React from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, KeyRound, Sparkles } from 'lucide-react'
import { Reveal } from '@/lib/reveal'
import { Narrow } from '@/components/layout/Shell'
import { normalizePhone, displayPhone } from '@/model/phone'
import { useAccounts } from '@/store/accounts'
import { useSession } from '@/store/session'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { MockInboxCard } from '@/components/auth/MockInboxCard'
import { PasswordInput } from '@/components/auth/PasswordChecklist'

/* Login — PRD Fitur 3. Username = nomor HP; temp password forces /change-password on first sign-in. */
export function LoginPage() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const prefill = params.get('phone') || ''
  const [phone, setPhone] = React.useState(() => (normalizePhone(prefill) ? displayPhone(prefill) : prefill))
  const [pw, setPw] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [mode, setMode] = React.useState<'login' | 'reset'>('login')
  const phoneNorm = normalizePhone(phone)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNorm) { setError('Nomor HP tidak valid'); return }
    if (!pw) { setError('Kata sandi wajib diisi'); return }
    const res = useAccounts.getState().login(phoneNorm, pw)
    if (!res.ok) { setError(res.reason); toast.error(res.reason); return }
    setError(null)
    useSession.getState().signIn(res.account.id)
    toast.success(`Masuk sebagai ${res.account.pic.split(' ')[0]}`)
    nav(res.account.mustChangePassword ? '/change-password' : '/profile')
  }

  return (
    <Narrow>
      <Reveal>
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-200 bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-700 backdrop-blur">
            <Sparkles className="h-3 w-3" strokeWidth={2} /> Resique Member Card
          </span>
          <Link to="/register" className="rounded-full px-3 py-2 text-[13px] font-semibold text-teal-700 transition-colors hover:bg-teal-50">Belum punya akun? Daftar</Link>
        </div>
      </Reveal>

      {mode === 'login' ? (
        <>
          <Reveal delay={40}>
            <h1 className="t-h1 mt-5 text-ink">Masuk</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-3 sm:text-base">Masuk pakai nomor HP yang terdaftar di Resique. Lihat poin, tier, dan pesanan Golden Sale.</p>
          </Reveal>
          <Reveal delay={80}>
            <form onSubmit={submit} noValidate className="mt-8 space-y-6">
              <Field label="No. HP" required htmlFor="phone" error={error && /HP|terdaftar/i.test(error) ? error : undefined} hint={phoneNorm ? `Masuk sebagai ${phoneNorm}` : undefined}>
                <Input id="phone" type="tel" spellCheck={false} inputMode="tel" autoComplete="username" placeholder="0812 3456 7890" value={phone} onChange={e => { setPhone(e.target.value); setError(null) }} aria-invalid={!!error && /HP|terdaftar/i.test(error)} autoFocus={!prefill} />
              </Field>
              <Field label="Kata sandi" required htmlFor="pw" error={error && /sandi/i.test(error) ? error : undefined}>
                <PasswordInput id="pw" value={pw} onChange={e => { setPw(e.target.value); setError(null) }} autoComplete="current-password" placeholder="Kata sandi atau sandi sementara" aria-invalid={!!error && /sandi/i.test(error)} autoFocus={!!prefill} />
              </Field>
              {error && !/HP|terdaftar|sandi/i.test(error) && <p role="alert" className="rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-[13px] text-danger">{error}</p>}
              <Button type="submit" size="xl" className="w-full">
                Masuk
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Button>
              <div className="text-center">
                <button type="button" onClick={() => { setMode('reset'); setError(null) }} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-teal-700 transition-colors hover:bg-teal-50">
                  <KeyRound className="h-4 w-4" strokeWidth={1.6} /> Lupa kata sandi?
                </button>
              </div>
            </form>
          </Reveal>
        </>
      ) : (
        <ResetForm initialPhone={phone} onBack={() => setMode('login')} onSent={p => setPhone(displayPhone(p))} />
      )}
    </Narrow>
  )
}

function ResetForm({ initialPhone, onBack, onSent }: { initialPhone: string; onBack: () => void; onSent: (phone: string) => void }) {
  const [phone, setPhone] = React.useState(initialPhone)
  const [error, setError] = React.useState<string | null>(null)
  const [sentTo, setSentTo] = React.useState<string | null>(null)
  const phoneNorm = normalizePhone(phone)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNorm) { setError('Nomor HP tidak valid'); return }
    const acc = useAccounts.getState().byPhone(phoneNorm)
    const res = useAccounts.getState().requestReset(phoneNorm)
    if (!res.ok || !acc) { setError('Nomor HP belum terdaftar'); toast.error('Nomor HP belum terdaftar'); return }
    setError(null)
    setSentTo(acc.email)
    onSent(phoneNorm)
    toast.success('Kata sandi sementara dikirim ke email')
  }

  return (
    <>
      <Reveal delay={40}>
        <button type="button" onClick={onBack} className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 rounded-full pr-3 text-[13px] font-semibold text-ink-3 transition-colors hover:text-teal-700"><ArrowLeft className="h-4 w-4" strokeWidth={1.6} /> Kembali ke masuk</button>
        <h1 className="t-h1 mt-2 text-ink">Lupa kata sandi</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-3 sm:text-base">Masukkan nomor HP terdaftar. Kata sandi sementara dikirim ke email akunmu. Berlaku sekali masuk, lalu buat yang baru.</p>
      </Reveal>
      <Reveal delay={80}>
        <form onSubmit={submit} noValidate className="mt-8 space-y-6">
          <Field label="No. HP" required htmlFor="reset-phone" error={error || undefined} hint={phoneNorm ? phoneNorm : undefined}>
            <Input id="reset-phone" type="tel" spellCheck={false} inputMode="tel" autoComplete="username" placeholder="0812 3456 7890" value={phone} onChange={e => { setPhone(e.target.value); setError(null) }} aria-invalid={!!error} autoFocus />
          </Field>
          <Button type="submit" size="xl" className="w-full" variant={sentTo ? 'outline' : 'default'}>{sentTo ? 'Kirim ulang' : 'Kirim kata sandi sementara'}</Button>
        </form>
      </Reveal>
      {sentTo && (
        <Reveal delay={40} className="mt-8 space-y-4">
          <MockInboxCard email={sentTo} limit={2} />
          <Button size="xl" className="w-full" onClick={onBack}>
            Masuk dengan kata sandi sementara
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Button>
        </Reveal>
      )}
    </>
  )
}
