import * as React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
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

/** Floating "island" nav — detached glass pill, morphing hamburger, staggered overlay on mobile. */
export function SiteHeader() {
  const cfg = useConfig(s => s.config)
  const acc = useCurrentAccount()
  const signOut = useSession(s => s.signOut)
  const nav = useNavigate()
  const loc = useLocation()
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => { setOpen(false) }, [loc.pathname, loc.hash])
  React.useEffect(() => {
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting), { threshold: 0 })
    const sentinel = document.getElementById('top-sentinel')
    if (sentinel) io.observe(sentinel)
    return () => io.disconnect()
  }, [])
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
      <div id="top-sentinel" aria-hidden className="absolute top-0 h-px w-px" />
      <header data-site-header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3 sm:pt-5">
        <div className={cn('pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-full border border-white/40 bg-white/75 py-2 pl-3 pr-2 shadow-2 backdrop-blur-xl transition-[box-shadow,background-color] duration-slow ease-out', scrolled && 'bg-white/90 shadow-3')}>
          <Link to="/" className="flex items-center gap-2.5 rounded-full pr-2" aria-label="Resique Golden Privilege — beranda">
            <img src={cfg.assets.logo} alt="" className="h-8 w-8 rounded-[9px]" />
            <span className="hidden text-[14px] font-extrabold tracking-tight text-teal-700 sm:inline">Resique <span className="gold-text">Golden Privilege</span></span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
            {NAV.map(n => (
              <a key={n.to} href={n.to} onClick={go(n.to)} className="rounded-full px-3.5 py-2 text-[13px] font-semibold text-ink-2 transition-colors hover:bg-teal-50 hover:text-teal-700">{n.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            {acc ? (
              <>
                <Button asChild variant="secondary" size="sm" className="rounded-full"><Link to="/profile">Profil RMC</Link></Button>
                <Button variant="ghost" size="sm" className="hidden rounded-full sm:inline-flex" onClick={() => { signOut(); nav('/') }}>Keluar</Button>
              </>
            ) : (
              <Button asChild size="sm" className="group rounded-full pr-1.5">
                <Link to="/login">
                  Cek poin
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15 transition-transform duration-base ease-out group-hover:translate-x-0.5 group-hover:-translate-y-px"><ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.2} /></span>
                </Link>
              </Button>
            )}
            <button type="button" aria-label={open ? 'Tutup menu' : 'Buka menu'} aria-expanded={open} onClick={() => setOpen(o => !o)} className="relative grid h-10 w-10 place-items-center rounded-full text-ink md:hidden">
              <span className={cn('absolute h-[2px] w-5 rounded-full bg-current transition-transform duration-slow ease-out', open ? 'rotate-45' : '-translate-y-[4px]')} />
              <span className={cn('absolute h-[2px] w-5 rounded-full bg-current transition-transform duration-slow ease-out', open ? '-rotate-45' : 'translate-y-[4px]')} />
              <span className="sr-only">{open ? <X /> : <Menu />}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div aria-hidden={!open} className={cn('fixed inset-0 z-[35] flex flex-col justify-center bg-white/90 px-6 backdrop-blur-2xl transition-opacity duration-slow ease-out md:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')}>
        <nav className="flex flex-col gap-1" aria-label="Navigasi seluler">
          {NAV.map((n, i) => (
            <a key={n.to} href={n.to} onClick={go(n.to)} style={{ transitionDelay: open ? `${80 + i * 50}ms` : '0ms' }} className={cn('flex min-h-[48px] items-center justify-between rounded-xl border-b border-line-2 px-2 text-[18px] font-bold tracking-tight text-ink transition-[opacity,transform] duration-500 ease-out', open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0')}>{n.label}<ArrowUpRight className="h-4 w-4 text-ink-4" strokeWidth={1.8} /></a>
          ))}
          <div style={{ transitionDelay: open ? '320ms' : '0ms' }} className={cn('mt-6 flex gap-2 transition-[opacity,transform] duration-500 ease-out', open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0')}>
            {acc ? (
              <>
                <Button asChild size="lg" className="flex-1 rounded-full"><Link to="/profile">Profil RMC</Link></Button>
                <Button variant="outline" size="lg" className="rounded-full" onClick={() => { signOut(); nav('/') }}>Keluar</Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="flex-1 rounded-full"><Link to="/login">Masuk</Link></Button>
                <Button asChild variant="outline" size="lg" className="flex-1 rounded-full"><Link to="/register">Daftar</Link></Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  )
}
