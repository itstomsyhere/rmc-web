import * as React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useConfig } from '@/store/config'
import { useCurrentAccount, useSession } from '@/store/session'
import { Button } from '@/components/ui/button'

const NAV = [
  { to: '/#benefit', label: 'Benefit RMC' },
  { to: '/#tier', label: 'Tier' },
  { to: '/#golden-sale', label: 'Golden Sale' },
  { to: '/#klasemen', label: 'Klasemen' },
]

/* Plain sticky header: flat bar, hairline border, 44px targets. Mobile menu = solid white panel, single fade. */
export function SiteHeader() {
  const cfg = useConfig(s => s.config)
  const acc = useCurrentAccount()
  const signOut = useSession(s => s.signOut)
  const nav = useNavigate()
  const loc = useLocation()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => { setOpen(false) }, [loc.pathname, loc.hash])
  React.useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [open])

  const go = (to: string) => (e: React.MouseEvent) => {
    if (to.startsWith('/#')) {
      e.preventDefault()
      const id = to.slice(2)
      if (loc.pathname !== '/') { nav('/'); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80) }
      else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      setOpen(false)
    }
  }

  return (
    <>
      <header data-site-header className="sticky top-0 z-40 h-14 border-b border-line bg-bg">
        <div className="container flex h-full items-center justify-between gap-3">
          <Link to="/" className="flex min-h-11 items-center gap-2.5 transition-opacity duration-base hover:opacity-80" aria-label="Resique Golden Privilege, beranda">
            <img src={cfg.assets.logo} alt="" width={32} height={32} className="h-8 w-8 rounded-md" />
            <span className="text-[15px] font-extrabold tracking-tight text-teal-700"><span className="sm:hidden">Golden Privilege</span><span className="hidden sm:inline">Resique Golden Privilege</span></span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
            {NAV.map(n => (
              <a key={n.to} href={n.to} onClick={go(n.to)} className="u-slide rounded-md px-3 py-2 text-[15px] font-medium text-ink-2 transition-colors duration-base hover:text-teal-700 [--u-bottom:4px] [--u-inset:0.75rem]">{n.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {acc ? (
              <>
                <Button asChild variant="secondary"><Link to="/profile">Profil RMC</Link></Button>
                <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => { signOut(); nav('/') }}>Keluar</Button>
              </>
            ) : (
              <Button asChild><Link to="/login">Cek poin</Link></Button>
            )}
            <button type="button" aria-label={open ? 'Tutup menu' : 'Buka menu'} aria-expanded={open} onClick={() => setOpen(o => !o)} className="relative grid h-11 w-11 place-items-center rounded-md text-ink transition-colors duration-fast hover:bg-surface-2 md:hidden">
              <span className={cn('absolute h-[2px] w-5 rounded-full bg-current transition-transform duration-base ease-out', open ? 'rotate-45' : '-translate-y-[4px]')} />
              <span className={cn('absolute h-[2px] w-5 rounded-full bg-current transition-transform duration-base ease-out', open ? '-rotate-45' : 'translate-y-[4px]')} />
            </button>
          </div>
        </div>
      </header>

      <div aria-hidden={!open} className={cn('fixed inset-x-0 bottom-0 top-14 z-[35] bg-white px-5 py-6 transition-opacity duration-base ease-out md:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')}>
        <nav className="flex flex-col divide-y divide-line-2 border-y border-line" aria-label="Navigasi seluler">
          {NAV.map(n => (
            <a key={n.to} href={n.to} onClick={go(n.to)} className="slide flex min-h-[52px] items-center rounded-md text-[17px] font-semibold text-ink">{n.label}</a>
          ))}
        </nav>
        <div className="mt-6 flex gap-3">
          {acc ? (
            <>
              <Button asChild size="lg" className="flex-1"><Link to="/profile">Profil RMC</Link></Button>
              <Button variant="outline" size="lg" onClick={() => { signOut(); nav('/') }}>Keluar</Button>
            </>
          ) : (
            <>
              <Button asChild size="lg" className="flex-1"><Link to="/login">Masuk</Link></Button>
              <Button asChild variant="outline" size="lg" className="flex-1"><Link to="/register">Daftar</Link></Button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
