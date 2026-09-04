import * as React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { useOrders } from '@/store/orders'
import { useCurrentAccount } from '@/store/session'

/** Consumer shell: floating nav + page + footer. Admin route renders outside this shell. */
export function Shell() {
  const loc = useLocation()
  const nav = useNavigate()
  const acc = useCurrentAccount()
  const expire = useOrders(s => s.expireStale)
  // BR-3.3 — a temp password must be replaced before any other page opens.
  React.useEffect(() => {
    if (acc?.mustChangePassword && loc.pathname !== '/change-password') nav('/change-password', { replace: true })
  }, [acc?.mustChangePassword, loc.pathname, nav])
  React.useEffect(() => { expire() ; const t = setInterval(expire, 15_000); return () => clearInterval(t) }, [expire])
  React.useEffect(() => {
    if (loc.hash) { const el = document.getElementById(loc.hash.slice(1)); if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 60) }
    else window.scrollTo({ top: 0 })
  }, [loc.pathname, loc.hash])
  return (
    <div className="relative flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1"><Outlet /></main>
      <SiteFooter />
    </div>
  )
}

/** Narrow page container for auth/checkout flows. */
export function Narrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`container max-w-xl pb-16 pt-24 sm:pt-32 ${className}`}>{children}</div>
}
