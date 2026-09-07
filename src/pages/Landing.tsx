import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, ChevronsRight, Crown, Gift, Medal, ShoppingBag, Sparkles, Trophy, X } from 'lucide-react'
import { BENEFIT_ICONS } from '@/lib/benefit-icons'
import { Reveal, useCountUp, useInView } from '@/lib/reveal'
import { poin } from '@/lib/format'
import { srcSet2x } from '@/lib/logo'
import { Doodle } from '@/components/Doodle'
import { rmcFor } from '@/model/rmc'
import { useCrm } from '@/store/crm'
import { SEED_ACCOUNTS } from '@/data/seed-accounts'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { rupiah, fmtDate } from '@/lib/format'
import { useConfig } from '@/store/config'
import { useOrders, klasemen } from '@/store/orders'
import { useCart, cartLines, cartTotal, cartCount, cartSavings, soldQty } from '@/store/cart'
import { useCurrentAccount } from '@/store/session'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/misc'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Price } from '@/components/shop/Price'
import { QtyStepper } from '@/components/shop/QtyStepper'
import type { Config, GoldenSaleItem, Tier } from '@/model/types'

/* Landing, 7 sections, two colour blocks (hero + "Cek poin-mu!" band) in Resique navy, green for action, gold
   reserved for reward/rank. Rhythm: hook (paper + grain) → hero (navy, prize deck + ticker) → 5 privilege blocks
   (paper) → tier cards (white, dot field) → CTA band (navy) → Golden Sale (paper, gold band) → Klasemen (white, plus
   marks). No eyebrows, no gradient text, no orbs, no glass, cards ≤ 10px radius. Motion (R.017): one hero moment (the
   deck deals in), scroll-in pop on card lists, hover + press on every control, idle float on the deck and the
   Ultimate badge, reduced-motion respected (index.css). */

export function LandingPage() {
  const hasCart = useCart(s => Object.keys(s.qty).length > 0)
  return (
    <div className={cn(hasCart && 'pb-24')}>
      <HookSection />
      <HeroSection />
      <BenefitSection />
      <TierSection />
      <CtaSection />
      <GoldenSaleSection />
      <KlasemenSection />
      <BasketBar />
    </div>
  )
}

/* Last word of a title carries the highlighter mark (draws in when the title scrolls into view, .mark in index.css). */
function Marked({ text, className }: { text: string; className?: string }) {
  const words = text.trim().split(' ')
  return <>{words.slice(0, -1).join(' ')}{words.length > 1 ? ' ' : ''}<span className={cn('mark', className)}>{words.slice(-1)[0]}</span></>
}

/* Concentric ring outlines, a recurring background motif (paper sections). Decorative, thin, brand tints. */
function Rings({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={cn('pointer-events-none absolute hidden opacity-70 md:block', className)} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth={1.2}>
      <circle cx="100" cy="100" r="98" /><circle cx="100" cy="100" r="74" /><circle cx="100" cy="100" r="50" /><circle cx="100" cy="100" r="26" />
    </svg>
  )
}

/* Gold scalloped seal for the biggest cut ("HEMAT 16%"): 24-point starburst, navy text, drop shadow. */
function Seal({ pct, className }: { pct: number; className?: string }) {
  const pts = Array.from({ length: 48 }, (_, i) => { const r = i % 2 ? 46 : 50; const a = (i / 48) * Math.PI * 2; return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}` }).join(' ')
  return (
    <svg aria-hidden viewBox="0 0 100 100" className={cn('drop-shadow-[0_8px_16px_rgba(33,26,90,.22)]', className)}>
      <polygon points={pts} fill="#D4A04E" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#211A5A" strokeOpacity=".35" strokeWidth="1.2" strokeDasharray="2 2.5" />
      <text x="50" y="41" textAnchor="middle" fontFamily="'Plus Jakarta Sans', Helvetica, sans-serif" fontWeight="800" fontSize="11" letterSpacing="1.5" fill="#211A5A">HEMAT</text>
      <text x="50" y="68" textAnchor="middle" fontFamily="'Plus Jakarta Sans', Helvetica, sans-serif" fontWeight="800" fontSize="28" letterSpacing="-1" fill="#211A5A">{pct}%</text>
    </svg>
  )
}

/* Hook headline: each word rises in on load (stagger), the last word keeps the highlighter mark for the gate. */
function StaggerWords({ text }: { text: string }) {
  const words = text.trim().split(' ')
  return (
    <>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <span className="hook-word inline-block" style={{ '--i': `${i * 90}ms` } as React.CSSProperties}>
            {i === words.length - 1 ? <span className="mark mark-green text-navy-700">{w}</span> : w}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </>
  )
}

function SectionTitle({ title, sub, tone = 'ink' }: { title: string; sub?: string; tone?: 'ink' | 'white' }) {
  return (
    <Reveal className="max-w-2xl">
      <h2 className={cn('t-h2 text-balance', tone === 'white' ? 'text-white' : 'text-ink')}><Marked text={title} className={tone === 'white' ? 'mark-light' : undefined} /></h2>
      {sub && <p className={cn('mt-3 text-[15px] leading-relaxed text-pretty sm:text-[17px]', tone === 'white' ? 'text-white/80' : 'text-ink-2')}>{sub}</p>}
    </Reveal>
  )
}

/* 1, Hook: headline left, proof right, the three biggest real price drops from Golden Sale.
   Content is the visual; no decoration. Animates once on load. */
function HookSection() {
  const { copy, items } = useConfig(s => s.config)
  const drops = items.filter(i => i.active && i.realPrice > i.promoPrice)
    .map(i => ({ ...i, pct: Math.round((1 - i.promoPrice / i.realPrice) * 100), save: i.realPrice - i.promoPrice }))
    .sort((a, b) => b.save - a.save).slice(0, 3)
  const maxPct = Math.max(...items.filter(i => i.realPrice > i.promoPrice).map(i => Math.round((1 - i.promoPrice / i.realPrice) * 100)), 0)
  return (
    <section id="hook" className="tex tex-grain scroll-mt-20 overflow-hidden pb-12 pt-20 lg:pb-20 lg:pt-24">
      {/* one solid green band behind the price card (desktop), the only colour on the paper */}
      <span aria-hidden className="band hidden bg-green-50 lg:block" style={{ top: '-10%', right: '-14%', width: '44%', height: '120%' }} />
      <Rings className="left-[-160px] top-[-140px] h-[460px] w-[460px] text-green-200" />
      <span aria-hidden className="pointer-events-none absolute bottom-[-40px] left-[38%] hidden h-[180px] w-[180px] rounded-full border-[10px] border-gold-100 lg:block" />
      <div className="container grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="min-w-0 lg:col-span-7">
          <Reveal>
            <h1 className="t-display max-w-4xl text-balance text-ink"><StaggerWords text={copy.hook} /></h1>
          </Reveal>
          <p className="hook-in mt-5 max-w-xl text-[17px] leading-relaxed text-pretty text-ink-2" style={{ '--i': '260ms' } as React.CSSProperties}>{copy.hookSub}</p>
          <div className="hook-in mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5" style={{ '--i': '360ms' } as React.CSSProperties}>
            <Button asChild size="lg" className="arrow-nudge hover:-translate-y-0.5">
              <a href="#golden-sale" onClick={e => { e.preventDefault(); document.getElementById('golden-sale')?.scrollIntoView({ behavior: 'smooth' }) }}>
                Lihat Golden Sale <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </a>
            </Button>
            <Link to="/login" className="u-slide arrow-nudge inline-flex min-h-[44px] items-center gap-1 text-[15px] font-semibold text-navy-700 transition-colors duration-base hover:text-navy-800 [--u-bottom:8px]">{copy.ctaPoints} <ChevronsRight className="h-4 w-4" strokeWidth={2} /></Link>
          </div>
        </div>
        {drops.length > 0 && (
          <Reveal delay={120} className="hook-card-wrap relative min-w-0 lg:col-span-5">
            {/* three biggest drops (Rp saved) among active Golden Sale items, same config the grid below reads.
                Photo-led: the biggest drop is the featured tile, the other two sit compact beneath it. The card rests
                slightly tilted and floats; a gold sticker with the biggest cut sits on its corner. */}
            <Seal pct={maxPct} className="sticker absolute -right-2 top-8 z-10 h-[92px] w-[92px] sm:-right-5 sm:top-6 sm:h-[112px] sm:w-[112px]" />
            <div className="hook-card overflow-hidden rounded-xl bg-white shadow-3">
              <div className="flex items-baseline justify-between px-5 pb-3 pt-4">
                <p className="text-[15px] font-bold text-ink">Harga turun paling besar</p>
                <p className="t-num text-[13px] font-semibold text-ink-3">{drops.length} produk</p>
              </div>
              {drops.slice(0, 1).map(d => (
                <a key={d.id} href="#golden-sale" onClick={e => { e.preventDefault(); document.getElementById('golden-sale')?.scrollIntoView({ behavior: 'smooth' }) }} className="group relative block overflow-hidden" data-no-press>
                  <img src={d.image} alt={d.name} width={800} height={600} className="zoom-img aspect-[16/9] w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" aria-hidden />
                  <span className="absolute left-4 top-4 rounded-md bg-gold px-2.5 py-1 t-code text-[13px] font-extrabold text-gold-ink shadow-1">-{d.pct}%</span>
                  <span className="absolute inset-x-4 bottom-4 flex flex-col text-white">
                    <span className="block truncate text-[15px] font-bold">{d.name}</span>
                    <span className="mt-1 flex items-baseline gap-2">
                      <span className="t-fig text-[24px] leading-none">{rupiah(d.promoPrice)}</span>
                      <span className="t-num text-[13px] font-semibold text-white/75"><span className="strike">{rupiah(d.realPrice)}</span></span>
                    </span>
                  </span>
                </a>
              ))}
              <ul className="grid grid-cols-2 gap-px bg-line-2">
                {drops.slice(1, 3).map(d => (
                  <li key={d.id} className="bg-white">
                    <a href="#golden-sale" onClick={e => { e.preventDefault(); document.getElementById('golden-sale')?.scrollIntoView({ behavior: 'smooth' }) }} className="group flex h-full items-center gap-3 px-4 py-3 transition-colors duration-base hover:bg-surface-2" data-no-press>
                      <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-md bg-surface-2"><img src={d.image} alt="" width={800} height={600} className="zoom-img h-full w-full object-cover" /></span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold text-ink">{d.name}</span>
                        <span className="t-fig mt-0.5 block text-[16px] leading-tight text-green-700">{rupiah(d.promoPrice)}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1"><span className="t-num strike text-[12px] font-semibold text-ink-3">{rupiah(d.realPrice)}</span><span className="t-num inline-block rounded-md bg-gold-100 px-1.5 py-0.5 text-[11px] font-extrabold text-gold-ink">-{d.pct}%</span></span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <a href="#golden-sale" onClick={e => { e.preventDefault(); document.getElementById('golden-sale')?.scrollIntoView({ behavior: 'smooth' }) }} className="arrow-nudge flex min-h-[48px] items-center justify-between border-t border-line-2 px-5 text-[14px] font-semibold text-navy-700 transition-colors duration-base hover:bg-green-50">
                Semua {items.filter(i => i.active).length} produk promo <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </a>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}

/* 2, Hero: the single colour block. Tagline + the prize deck (4 fanned photo cards that deal in once, then float)
   + a running ticker of every prize (keeps the marquee idiom). */
function HeroSection() {
  const { copy, assets, rules } = useConfig(s => s.config)
  const acc = useCurrentAccount()
  const strip = [...assets.heroPrizes, ...assets.heroPrizes]
  return (
    <section id="hero" className="relative isolate scroll-mt-20 overflow-hidden bg-navy-700 py-14 text-white lg:py-20">
      <Doodle variant="hero" />
      {/* one solid darker band behind the deck for depth, no gradient, no blur */}
      <span aria-hidden className="band bg-navy-800" style={{ right: '-10%', bottom: '-30%', width: '60%', height: '70%' }} />
      <div className="container relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
        <Reveal className="min-w-0 lg:col-span-5">
          <h2 className="t-h1 text-balance text-white"><Marked text={copy.tagline} className="mark-light" /></h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-pretty text-white/80 sm:text-[17px]">{copy.taglineSub}</p>
          <p className="t-code mt-5 inline-flex items-center gap-2 rounded-md bg-gold px-2.5 py-1 text-[13px] font-bold text-gold-ink"><Gift className="h-4 w-4" strokeWidth={2} aria-hidden />Rp{rules.earnPerRp.toLocaleString('id-ID')} = 1 poin</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Button asChild size="lg" variant="inverse" className="arrow-nudge hover:-translate-y-0.5">
              <Link to={acc ? '/profile' : '/login'}>Lihat hadiah <ArrowRight className="h-4 w-4" strokeWidth={2} /></Link>
            </Button>
            <a href="#cek-poin" onClick={e => { e.preventDefault(); document.getElementById('cek-poin')?.scrollIntoView({ behavior: 'smooth' }) }} className="u-slide arrow-nudge inline-flex min-h-[44px] items-center gap-1 text-[15px] font-semibold text-white [--u-bottom:8px]">Cara tukar poin <ChevronsRight className="h-4 w-4" strokeWidth={2} /></a>
          </div>
        </Reveal>
        <div className="min-w-0 lg:col-span-7">
          <PrizeDeck prizes={assets.heroPrizes.slice(0, 4)} />
        </div>
      </div>
      {assets.heroPrizes.length > 0 && (
        <div className="container relative z-10 mt-12 hidden lg:block">
          {/* desktop: a still rail of every prize (the running strip looked awkward at full width) */}
          <ul className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-5" aria-label="Semua hadiah yang bisa ditukar">
            {assets.heroPrizes.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 50} className="inline-flex items-center gap-2.5 rounded-lg bg-white/10 py-1.5 pl-1.5 pr-3.5 text-[13px] font-semibold text-white transition-[transform,background-color] duration-base ease-out hover:-translate-y-0.5 hover:bg-white/15">
                <img src={p.image} alt="" width={800} height={600} className="h-9 w-9 rounded-md object-cover" loading="eager" decoding="async" />
                {p.label}
              </Reveal>
            ))}
          </ul>
        </div>
      )}
      {assets.heroPrizes.length > 0 && (
        <div className="marquee relative z-10 mt-10 border-t border-white/10 pt-4 lg:hidden" role="region" aria-label="Hadiah yang bisa ditukar">
          <ul className="marquee-track px-5" style={{ animationDuration: `${Math.max(30, assets.heroPrizes.length * 6)}s` }}>
            {strip.map((p, i) => (
              <li key={p.id + i} aria-hidden={i >= assets.heroPrizes.length} className="inline-flex shrink-0 items-center gap-2 rounded-md bg-white/10 py-1.5 pl-1.5 pr-3 text-[13px] font-semibold text-white transition-transform duration-base ease-out hover:-translate-y-0.5">
                <img src={p.image} alt="" width={800} height={600} className="h-6 w-6 rounded-[4px] object-cover" loading="eager" decoding="async" />
                {p.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

/* The deck: front card straight-ish, three behind it fanned; the slot floats, the card holds the pose (index.css). */
const DECK_POSES = [
  { dx: '4%', dy: '0%', dr: '-4deg', ds: 1, dd: '0s' },
  { dx: '74%', dy: '-6%', dr: '5deg', ds: 1, dd: '1.5s' },
  { dx: '32%', dy: '-26%', dr: '-9deg', ds: 0.94, dd: '3s' },
  { dx: '88%', dy: '-34%', dr: '11deg', ds: 0.9, dd: '4.5s' },
]
function PrizeDeck({ prizes }: { prizes: Config['assets']['heroPrizes'] }) {
  const { ref, inView } = useInView<HTMLUListElement>({ margin: '0px 0px -12% 0px' })
  const [dealt, setDealt] = React.useState(false)
  React.useEffect(() => { if (!inView) return; const t = setTimeout(() => setDealt(true), 900); return () => clearTimeout(t) }, [inView])
  if (prizes.length === 0) return null
  return (
    <ul ref={ref} data-deal={inView ? 'in' : 'out'} className="deck mx-auto h-[250px] w-full max-w-[560px] sm:h-[320px] lg:h-[380px] lg:max-w-none" aria-label="Hadiah utama Golden Privilege">
      {prizes.map((p, i) => ({ p, i })).reverse().map(({ p, i }) => {
        const pose = DECK_POSES[i]
        return (
          <li key={p.id} className="deck-slot" style={{ '--dd': pose.dd, zIndex: 4 - i } as React.CSSProperties}>
            <div data-front={i === 0 || undefined} className="deck-card overflow-hidden rounded-lg bg-white shadow-3" style={{ '--dx': pose.dx, '--dy': pose.dy, '--dr': pose.dr, '--ds': pose.ds, transitionDelay: dealt ? '0ms' : `${(prizes.length - 1 - i) * 90}ms` } as React.CSSProperties}>
              <div className="relative">
                <img src={p.image} alt={p.label} width={800} height={600} className="aspect-[4/3] w-full object-cover" loading="eager" decoding="async" fetchPriority={i === 0 ? 'high' : undefined} />
                {i > 0 && <span className="absolute inset-0 bg-ink/10" aria-hidden />}
                {i === 0 && <span className="t-code absolute left-3 top-3 rounded-md bg-gold px-2 py-0.5 text-[12px] font-extrabold text-gold-ink shadow-1">Hadiah utama</span>}
              </div>
              <p className="truncate px-3 py-2 text-[13px] font-bold text-ink">{p.label}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/* 3, Privilege member RMC: five blocks (diskon belanja · gratis ongkir · konsultasi bisnis · redeem poin · event
   tahunan), each led by its icon + figure. Desktop reads [½ ½] / [⅓ ⅓ ⅓]; content from config (admin-defined). */
function BenefitSection() {
  const { copy, benefits } = useConfig(s => s.config)
  /* ticket heads: navy · gold · green · navy · gold (solid brand colours); the body is always white */
  const heads = ['bg-navy-700 text-white', 'bg-gold text-gold-ink', 'bg-green-700 text-white', 'bg-navy-700 text-white', 'bg-gold text-gold-ink']
  const chips = ['bg-green text-navy-900', 'bg-white text-gold-700', 'bg-white text-green-700', 'bg-green text-navy-900', 'bg-white text-gold-700']
  const five = benefits.length === 5
  return (
    <section id="benefit" className="tex tex-grain scroll-mt-20 overflow-hidden py-14 lg:py-24">
      {/* navy band low-left + two ring outlines top-right: the paper is worked, not blank */}
      <span aria-hidden className="band bg-navy-50" style={{ left: '-14%', bottom: '-30%', width: '46%', height: '60%' }} />
      <Rings className="right-[-120px] top-[-80px] h-[420px] w-[420px] text-green-200" />
      <div className="container">
        <SectionTitle title={copy.benefitTitle} sub={copy.benefitSub} />
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
          {benefits.map((b, i) => {
            const dark = i === 0
            const Icon = BENEFIT_ICONS[b.icon] || Sparkles
            const span = five ? (i < 2 ? 'lg:col-span-3' : 'lg:col-span-2') : 'lg:col-span-2'
            const lastOdd = i === benefits.length - 1 && benefits.length % 2 === 1 ? 'sm:col-span-2' : ''
            return (
              <Reveal as="li" key={b.id} delay={i * 70} className={cn('reveal-pop min-w-0', span, lastOdd, five && i >= 2 && 'sm:col-span-1')}>
                <div className={cn('ticket lift-lg card-fx flex h-full min-h-[240px] flex-col rounded-lg bg-white', dark && 'sweep')} style={{ '--tint': '#F1F9EA' } as React.CSSProperties}>
                  {/* ticket head: solid brand colour, icon chip + the big figure */}
                  <div className={cn('ticket-head relative flex h-[112px] items-start justify-between gap-4 overflow-hidden px-5 pt-5', heads[i % heads.length])}>
                    <div className="fig">
                      {b.figure && <p className="t-fig t-fig-sans text-[38px] leading-none">{b.figure}</p>}
                      {b.figureNote && <p className="t-num mt-1 text-[13px] font-bold opacity-85">{b.figureNote}</p>}
                    </div>
                    <span className={cn('chip grid h-12 w-12 shrink-0 place-items-center rounded-full shadow-1', chips[i % chips.length])} aria-hidden>
                      <Icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
                    </span>
                    <Icon aria-hidden className="ticket-mark pointer-events-none absolute -bottom-4 right-16 h-24 w-24 opacity-[0.14]" strokeWidth={1} />
                  </div>
                  {/* perforation between head and body */}
                  <span aria-hidden className="ticket-cut" />
                  <div className="px-5 pb-5 pt-4">
                    <h3 className="text-[17px] font-bold text-balance text-ink">{b.title}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-pretty text-ink-2">{b.desc}</p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* 4, Tier ladder: one markup for every width. */
function TierSection() {
  const cfg = useConfig(s => s.config)
  const rail = React.useRef<HTMLOListElement>(null)
  const [active, setActive] = React.useState(0)
  // small screens: the card crossing the centre of the rail is the active one (scale + dot); once on reveal, nudge
  // the rail so the slider affordance is obvious
  React.useEffect(() => {
    const el = rail.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const mq = window.matchMedia('(max-width: 1023px)')
    if (!mq.matches) return
    const items = [...el.querySelectorAll<HTMLElement>(':scope > li')]
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting && e.intersectionRatio >= 0.6) setActive(items.indexOf(e.target as HTMLElement)) })
    }, { root: el, threshold: [0.6] })
    items.forEach(li => io.observe(li))
    let nudged = false
    const hint = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || nudged) return
      nudged = true
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      setTimeout(() => { el.scrollTo({ left: 40, behavior: 'smooth' }); setTimeout(() => el.scrollTo({ left: 0, behavior: 'smooth' }), 520) }, 700)
    }, { threshold: 0.4 })
    hint.observe(el)
    return () => { io.disconnect(); hint.disconnect() }
  }, [cfg.tiers.length])
  const goTo = (i: number) => { const li = rail.current?.querySelectorAll<HTMLElement>(':scope > li')[i]; li?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }) }
  return (
    <section id="tier" className="tex tex-dots scroll-mt-20 overflow-hidden border-t border-line bg-white py-14 lg:py-24">
      {/* a gold band leans behind the Ultimate column, a navy one behind the title */}
      <span aria-hidden className="band bg-gold-50" style={{ right: '-10%', top: '18%', width: '30%', height: '70%' }} />
      <span aria-hidden className="band bg-navy-50" style={{ left: '-12%', top: '-10%', width: '38%', height: '42%' }} />
      <div className="container">
        <SectionTitle title={cfg.copy.tierTitle} sub={cfg.copy.tierSub} />
        <ol ref={rail} className="tier-rail no-scrollbar -mx-5 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-3 lg:overflow-visible lg:px-0 lg:pb-0" aria-label="Daftar tier RMC">
          {cfg.tiers.map((t, i) => <TierCardV key={t.key} tier={t} idx={i} top={i === cfg.tiers.length - 1} active={i === active} />)}
        </ol>
        <div className="mt-2 flex items-center justify-center gap-1.5 lg:hidden" role="tablist" aria-label="Geser tier">
          {cfg.tiers.map((t, i) => (
            <button key={t.key} type="button" role="tab" aria-selected={i === active} aria-label={t.name} onClick={() => goTo(i)} className={cn('tier-dot h-2 rounded-full', i === active ? 'w-6' : 'w-2 bg-line')} style={i === active ? { background: t.sw } : undefined} />
          ))}
        </div>
        <div className="mt-6 flex max-w-2xl items-start gap-3 rounded-lg bg-green-50 p-4">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white text-[13px] font-extrabold text-green-700">M</span>
          <p className="text-[15px] leading-relaxed text-ink-2">
            <strong className="text-ink">Mitra Apique Management</strong> punya diskon minimal <strong className="t-num text-ink">{cfg.mitraFloorDiscount}%</strong> sejak Starter. Kalau diskon tier lebih besar, itu yang dipakai.
          </p>
        </div>
      </div>
    </section>
  )
}
/* Tier column (the RGP mock's six coloured columns, tightened): a full-colour card in the tier colour, emblem on top
   (crown on Ultimate), name + per-month, then four rows — diskon (big %), gratis ongkir, konsultasi, belanja 6 bulan —
   each with a check / cross mark and a hairline divider. A big faint tier number sits in the corner. Hover: lift,
   white tint, emblem springs, the bottom bar draws in; the % counts up on scroll-in. */
function TierCardV({ tier, idx, top, active }: { tier: Tier; idx: number; top: boolean; active?: boolean }) {
  const rows: { label: string; value: React.ReactNode; on: boolean }[] = [
    { label: 'Gratis ongkir', value: tier.freeDelivMin === null ? '-' : tier.freeDelivMin === 0 ? 'Tanpa min.' : `min. ${rupiah(tier.freeDelivMin, { short: true })}`, on: tier.freeDelivMin !== null },
    { label: 'Konsultasi bisnis', value: tier.consult ? `${tier.consult} sesi/bln` : '-', on: tier.consult > 0 },
  ]
  return (
    <Reveal as="li" delay={idx * 60} data-active={active ? 'true' : 'false'} className={cn('lift tier-card card-fx reveal-pop group relative flex w-[76%] shrink-0 snap-center flex-col overflow-hidden rounded-xl p-4 text-white sm:w-[44%] lg:w-auto', top && 'sweep ring-2 ring-gold ring-offset-2 ring-offset-white hover:shadow-gold')}
      style={{ '--tier': tier.sw, '--tint': 'rgba(255,255,255,.10)', background: tier.sw } as React.CSSProperties}>
      <span aria-hidden className="t-fig t-fig-black pointer-events-none absolute -bottom-3 -right-1 select-none text-[96px] leading-none text-white/10">{idx + 1}</span>
      <div className="tier-head relative flex items-start justify-between gap-2">
        <span className={cn('badge grid h-11 w-11 shrink-0 place-items-center rounded-full', top ? 'bg-gold text-gold-ink' : 'bg-white/15 text-white')} aria-hidden>
          {top ? <Crown className="h-6 w-6" strokeWidth={1.6} fill="currentColor" /> : <span className="t-fig text-[15px]">{idx + 1}</span>}
        </span>
        {top && <span className="t-code rounded-md bg-gold px-2 py-0.5 text-[11px] font-bold text-gold-ink">Ultimate</span>}
      </div>
      <h3 className="mt-3 text-[18px] font-extrabold leading-tight">{tier.name}</h3>
      <p className="t-num text-[12px] text-white/75">{tier.perMonth} / bulan</p>
      <div className="mt-3 border-t border-white/20 pt-3">
        <p className="text-[11px] font-semibold text-white/75">Diskon tiap transaksi</p>
        <CountPct value={tier.discount} className={cn('t-fig-sans', top ? 'text-gold' : 'text-white')} />
      </div>
      {rows.map(r => (
        <div key={r.label} className="mt-3 border-t border-white/20 pt-3">
          <p className="text-[11px] font-semibold text-white/75">{r.label}</p>
          <p className={cn('t-num mt-0.5 flex items-center gap-1.5 text-[13px] font-bold', !r.on && 'text-white/55')}>
            {r.on ? <Check className="h-3.5 w-3.5 shrink-0 text-green-200" strokeWidth={3} aria-hidden /> : <X className="h-3.5 w-3.5 shrink-0 text-white/45" strokeWidth={2.5} aria-hidden />}
            <span>{r.on ? r.value : 'Belum termasuk'}</span>
          </p>
        </div>
      ))}
      {/* bands are inclusive both ends (0–8.999.999, next tier starts sharp at 9.000.000), show the exact rupiah */}
      <div className="mt-3 border-t border-white/20 pt-3">
        <p className="text-[11px] font-semibold text-white/75">Belanja 6 bln (Rp)</p>
        <p className="t-num text-[13px] font-bold">{tier.max !== null ? <>{tier.min.toLocaleString('id-ID')} –<br />{tier.max.toLocaleString('id-ID')}</> : `≥ ${tier.min.toLocaleString('id-ID')}`}</p>
      </div>
      <span className="bar" aria-hidden />
    </Reveal>
  )
}
/* a rupiah figure that counts up once in view (podium spend) */
function CountRupiah({ value, className }: { value: number; className?: string }) {
  const { ref, inView } = useInView<HTMLParagraphElement>()
  const v = useCountUp(value, inView, 1100)
  return <p ref={ref} className={cn('t-fig', className)} data-spend={value}>{rupiah(v)}</p>
}
/* the discount figure counts up from 0 once the card is in view (final value under reduced motion) */
function CountPct({ value, className }: { value: number; className?: string }) {
  const { ref, inView } = useInView<HTMLParagraphElement>()
  const v = useCountUp(value, inView)
  return <p ref={ref} className={cn('t-fig t-fig-black origin-left text-[36px] leading-none transition-transform duration-slow ease-out group-hover:scale-110', className)} data-pct={value}>{v}%</p>
}

/* 5, CTA band: second colour block (navy), the conversion point. Left: ask + 3 step chips + buttons.
   Right: a real RMC card preview (demo member's live numbers), tilted; straightens on hover. */
function CtaSection() {
  const cfg = useConfig(s => s.config)
  const { copy, rules } = cfg
  const acc = useCurrentAccount()
  const steps = ['Masuk pakai nomor HP', 'Lihat poin, tier & diskon', 'Tukar poin jadi hadiah']
  return (
    <section id="cek-poin" className="relative isolate scroll-mt-20 overflow-hidden bg-navy-700 py-16 text-white lg:py-24">
      <Doodle variant="cta" />
      <span aria-hidden className="band bg-navy-800" style={{ left: '-12%', bottom: '-40%', width: '52%', height: '80%' }} />
      <div className="container relative z-10 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="min-w-0 lg:col-span-7">
          <Reveal>
            <h2 className="t-h1 text-balance text-white"><Marked text={copy.ctaPoints} className="mark-light" /></h2>
            <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-pretty text-white/85 sm:text-[17px]">{copy.ctaPointsSub}</p>
          </Reveal>
          <Reveal delay={90}>
            <ol className="mt-7 flex flex-wrap items-center gap-y-3" aria-label="Cara cek poin">
              {steps.map((s, i) => (
                <li key={s} className="flex items-center">
                  <span className="step-chip inline-flex min-h-[44px] items-center gap-2.5 rounded-full border border-white/25 py-2 pl-2 pr-4 text-[14px] font-semibold text-white sm:text-[15px]">
                    <span className="t-fig grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-[13px] text-navy-700" aria-hidden>{i + 1}</span>
                    {s}
                  </span>
                  {i < steps.length - 1 && <ChevronsRight className="mx-1.5 h-4 w-4 shrink-0 text-white/50 sm:mx-2" strokeWidth={2} aria-hidden />}
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={160} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Button asChild size="lg" className="arrow-nudge bg-green text-navy-900 shadow-2 hover:-translate-y-0.5 hover:bg-green-200">
              <Link to={acc ? '/profile' : '/login'}>{acc ? 'Buka profil RMC' : 'Masuk & cek poin'} <ArrowRight className="h-4 w-4" strokeWidth={2} /></Link>
            </Button>
            {!acc && (
              <Button asChild size="lg" variant="inverse" className="arrow-nudge hover:-translate-y-0.5">
                <Link to="/register">Belum punya akun? <strong className="font-extrabold">Daftar</strong> <ArrowRight className="h-4 w-4" strokeWidth={2} /></Link>
              </Button>
            )}
          </Reveal>
        </div>
        <Reveal delay={120} className="min-w-0 lg:col-span-5">
          <RmcCardPreview rules={rules} />
        </Reveal>
      </div>
    </section>
  )
}

/* The demo member's card, computed with the same rmcFor() the profile uses, real tier, real points, real months. */
function RmcCardPreview({ rules }: { rules: Config['rules'] }) {
  const cfg = useConfig(s => s.config)
  const orders = useOrders(s => s.orders)
  const demo = SEED_ACCOUNTS[0]
  const customer = useCrm(s => s.customers.find(c => c.id === demo.crmCustomerId)) || null
  const rmc = React.useMemo(() => rmcFor(cfg, customer, orders, [], demo.id, demo.isMitra), [cfg, customer, orders, demo.id, demo.isMitra])
  if (!customer) return null
  const months = rmc.monthly.slice(-6)
  const maxPts = Math.max(1, ...months.map(m => m.points))
  return (
    <div className="tilt-wrap relative mx-auto max-w-[400px] pt-3 pr-3 lg:ml-auto lg:mr-0">
      <p className="mb-4 text-[13px] font-semibold text-white/70">Contoh profil member: {demo.laundry}</p>
      <div className="relative">
        <div className="tilt-back absolute inset-0 rounded-xl bg-gold" aria-hidden />
        <div data-rmc-card className="tilt relative rounded-xl bg-white p-5 text-ink shadow-3 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img src={cfg.assets.mark} srcSet={srcSet2x(cfg.assets.mark)} alt="" width={28} height={28} className="h-7 w-7" />
              <p className="text-[13px] font-bold text-ink">Resique Member Card</p>
            </div>
            <span className="rounded-md px-2.5 py-1 text-[12px] font-extrabold text-white" style={{ background: rmc.tier.sw }}>{rmc.tier.name}</span>
          </div>
          <p className="mt-6 text-[13px] font-semibold text-ink-3">Poin RMC</p>
          <p className="t-fig t-fig-black mt-1 text-[40px] leading-none text-navy-700 sm:text-[44px]">{poin(rmc.points)}</p>
          <p className="t-code mt-1.5 text-[13px] text-ink-2">Diskon {rmc.discount}% · poin berlaku sampai {rules.expiry}</p>
          <div className="mt-5 flex items-end justify-between gap-4 border-t border-line-2 pt-4">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold text-ink">{demo.laundry}</p>
              <p className="truncate text-[13px] text-ink-2">{demo.pic} · {demo.rsl}</p>
            </div>
            <div className="flex h-9 shrink-0 items-end gap-1" aria-label="Poin 6 bulan terakhir">
              {months.map((m, i) => (
                <span key={m.ym} className={cn('w-2 rounded-sm', i === months.length - 1 ? 'bg-gold' : 'bg-green-200')} style={{ height: `${Math.max(12, Math.round((m.points / maxPts) * 100))}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* 6, Golden Sale */
function GoldenSaleSection() {
  const cfg = useConfig(s => s.config)
  const orders = useOrders(s => s.orders)
  const qty = useCart(s => s.qty)
  const inc = useCart(s => s.inc)
  const dec = useCart(s => s.dec)
  const items = cfg.items.filter(i => i.active)
  return (
    <section id="golden-sale" className="tex tex-grain scroll-mt-20 overflow-hidden py-14 lg:py-24">
      <span aria-hidden className="band bg-gold-50" style={{ top: '-6%', right: '-14%', width: '44%', height: '48%' }} />
      <span aria-hidden className="band bg-green-50" style={{ left: '-12%', bottom: '-20%', width: '36%', height: '50%' }} />
      <Rings className="right-[6%] top-[40px] h-[260px] w-[260px] text-gold-200" />
      <div className="container">
        <SectionTitle title={cfg.copy.saleTitle} sub={cfg.copy.saleSub} />
        <p className="t-num mt-3 text-[15px] text-ink-2">{items.length} produk · sampai {fmtDate(cfg.campaign.end)} · selama stok ada</p>
        {items.length === 0 ? (
          <EmptyState className="mt-8" title="Belum ada item Golden Sale" desc="Item promo belum dibuka. Cek lagi nanti." />
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
            {items.map((it, idx) => {
              const sold = soldQty(orders, it.id)
              const left = it.quota > 0 ? Math.max(0, it.quota - sold) : Infinity
              const q = qty[it.id] || 0
              const max = Math.min(it.maxPerCustomer > 0 ? it.maxPerCustomer : Infinity, left)
              return (
                <Reveal as="li" key={it.id} delay={Math.min(idx, 11) * 40}>
                  <ProductCard item={it} qty={q} left={left} max={Number.isFinite(max) ? max : undefined}
                    onInc={() => { if (left <= 0) return toast.error('Stok habis'); if (Number.isFinite(max) && q >= max) return toast.warning(`Maksimal ${max} per pelanggan`); inc(it.id) }}
                    onDec={() => dec(it.id)} />
                </Reveal>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
function ProductCard({ item, qty, left, max, onInc, onDec }: { item: GoldenSaleItem; qty: number; left: number; max?: number; onInc: () => void; onDec: () => void }) {
  const soldOut = left <= 0
  return (
    <article className={cn('lift group flex h-full flex-col rounded-lg border bg-white p-3 sm:p-4', qty > 0 ? 'border-green-200 ring-1 ring-green-200' : 'border-line hover:border-green-200', soldOut && 'opacity-70')}>
      <div className="relative overflow-hidden rounded-md bg-surface-2">
        <img src={item.image} alt={item.name} width={800} height={600} className="zoom-img aspect-[4/3] w-full object-cover" loading="lazy" />
        {soldOut ? <Badge variant="muted" className="absolute left-2 top-2">Habis</Badge>
          : Number.isFinite(left) && left <= 10 ? <Badge variant="warn" className="absolute left-2 top-2">Sisa {left}</Badge> : null}
      </div>
      <h3 className="mt-3 line-clamp-2 min-h-[2.6em] text-[13px] font-bold leading-snug text-ink sm:text-[14px]">{item.name}</h3>
      <p className="mt-0.5 text-[13px] text-ink-3">{item.cat} · per {item.unit}</p>
      <Price real={item.realPrice} promo={item.promoPrice} size="sm" className="mt-2" />
      <div className="mt-3">
        <QtyStepper qty={qty} onInc={onInc} onDec={onDec} max={max} disabled={soldOut} label={item.name} className="w-full justify-center sm:w-auto" />
      </div>
    </article>
  )
}

/* Basket bar + sheet (floating → shadow, no border) */
function BasketBar() {
  const cfg = useConfig(s => s.config)
  const qty = useCart(s => s.qty)
  const setQty = useCart(s => s.set)
  const [open, setOpen] = React.useState(false)
  const lines = cartLines(qty, cfg.items)
  const count = cartCount(lines), total = cartTotal(lines), savings = cartSavings(lines)
  const show = count > 0
  return (
    <>
      <div data-basket-bar aria-hidden={!show} className={cn('fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(12px,env(safe-area-inset-bottom))]', show ? 'bar-in' : 'pointer-events-none translate-y-6 opacity-0')}>
        <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-xl bg-ink p-2 pl-4 text-white shadow-3">
          <button type="button" onClick={() => setOpen(true)} className="slide flex min-h-11 min-w-0 flex-1 flex-col justify-center rounded-md text-left" aria-label="Lihat keranjang">
            <span className="t-code text-[13px] text-white/80">{count} item · hemat {rupiah(savings)}</span>
            <span className="t-fig truncate text-[17px] leading-tight">{rupiah(total)}</span>
          </button>
          <Button asChild variant="gold" size="lg" className="bar-pop rounded-lg"><Link to="/checkout">Checkout <ArrowRight className="h-4 w-4" strokeWidth={2} /></Link></Button>
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="sm:bottom-4 sm:mx-auto sm:max-w-lg sm:rounded-xl">
          <SheetHeader><SheetTitle>Keranjang</SheetTitle><SheetDescription>{count} item · total {rupiah(total)}</SheetDescription></SheetHeader>
          <ul className="mt-4 divide-y divide-line-2">
            {lines.map(l => (
              <li key={l.itemId} className="py-3">
                <p className="text-[15px] font-semibold text-ink">{l.name}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <QtyStepper qty={l.qty} onInc={() => setQty(l.itemId, l.qty + 1)} onDec={() => setQty(l.itemId, l.qty - 1)} label={l.name} />
                  <p className="t-code text-[15px] font-bold text-ink">{rupiah(l.qty * l.promoPrice)}</p>
                </div>
              </li>
            ))}
          </ul>
          <Button asChild size="xl" variant="gold" className="mt-4 w-full rounded-lg"><Link to="/checkout">Bayar {rupiah(total)}</Link></Button>
        </SheetContent>
      </Sheet>
    </>
  )
}

/* 7, Klasemen: a podium for the top three (rank 1 in navy with the trophy, the grand-prize chip and a gold ring;
   2 and 3 flank it in silver / bronze), then rows 4–10 with a spend bar that fills on reveal. One <ol> so the ranking
   stays a single ordered list; the podium is laid out with CSS `order` so DOM order = rank order. */
function KlasemenSection() {
  const cfg = useConfig(s => s.config)
  const orders = useOrders(s => s.orders)
  const acc = useCurrentAccount()
  const rows = React.useMemo(() => klasemen(orders, cfg.campaign.start, cfg.campaign.end), [orders, cfg.campaign.start, cfg.campaign.end])
  const top = rows.slice(0, cfg.klasemen.topN)
  const mine = acc ? rows.find(r => r.accountId === acc.id || (acc.crmCustomerId && r.crmCustomerId === acc.crmCustomerId) || r.phone === acc.phone) : undefined
  const leadSpend = top[0]?.spend || 1
  const grand = cfg.assets.heroPrizes[0]
  const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <section id="klasemen" className="tex tex-plus scroll-mt-20 overflow-hidden border-t border-line bg-white py-14 lg:py-24">
      <span aria-hidden className="band bg-gold-50" style={{ left: '-10%', bottom: '-30%', width: '40%', height: '60%' }} />
      <span aria-hidden className="band bg-navy-50" style={{ right: '-12%', top: '-8%', width: '34%', height: '44%' }} />
      <div className="container">
        <SectionTitle title={cfg.copy.klasemenTitle} sub={cfg.copy.klasemenSub} />
        {top.length === 0 ? <EmptyState className="mt-8" title="Belum ada pesanan Lunas" desc="Pesanan yang sudah Lunas akan tampil di sini." /> : (
          <ol className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3 sm:items-end sm:gap-4" aria-label="Peringkat belanja Golden Sale">
            {top.map((r, i) => {
              const me = !!mine && r.key === mine.key
              const share = Math.max(4, Math.round((r.spend / leadSpend) * 100))
              if (i < 3) {
                const first = i === 0
                const medal = ['Emas', 'Perak', 'Perunggu'][i]
                return (
                  <Reveal as="li" key={r.key} data-rank={r.rank} delay={first ? 320 : i === 1 ? 160 : 0}
                    className={cn('lift podium-rise relative flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 rounded-xl p-4 text-left sm:flex-col sm:flex-nowrap sm:items-center sm:justify-start sm:gap-0 sm:px-4 sm:pb-4 sm:pt-5 sm:text-center', ['podium-1', 'podium-2', 'podium-3'][i],
                      first ? 'ring-pulse bg-navy-700 text-white ring-2 ring-gold ring-offset-2 ring-offset-white sm:order-2 sm:min-h-[340px] sm:pb-6 sm:pt-7' : 'border sm:order-1',
                      i === 1 && 'border-[#C0C6CE] bg-[#F3F5F8] sm:min-h-[292px]',
                      i === 2 && 'border-[#E3C3A8] bg-[#FBF3EC] sm:order-3 sm:min-h-[256px]')}>
                    {/* big faint rank number, like the tier columns */}
                    <span aria-hidden className={cn('t-fig pointer-events-none absolute -bottom-3 right-2 select-none text-[88px] leading-none', first ? 'text-white/10' : 'text-navy-900/[.06]')}>{r.rank}</span>
                    {/* medal: trophy for rank 1 (the only svg in that li, the gate counts it); a medal icon in silver / bronze for 2 and 3 */}
                    <span className={cn('medal grid shrink-0 place-items-center rounded-full', first ? 'h-14 w-14 bg-gold text-gold-ink sm:h-16 sm:w-16' : 'h-12 w-12 text-white sm:h-14 sm:w-14')} style={first ? undefined : { background: 'var(--pod)' }} aria-hidden>
                      {first ? <Trophy className="h-7 w-7" strokeWidth={1.6} /> : <Medal className="h-6 w-6" strokeWidth={1.7} />}
                    </span>
                    <span className={cn('hidden h-11 w-11 place-items-center rounded-full text-[14px] font-extrabold sm:mt-3 sm:grid', first ? 'bg-white/15 text-white' : 'bg-white text-navy-700 shadow-1')} aria-hidden>{initials(r.laundry)}</span>
                    <div className="relative min-w-0 flex-1 sm:w-full sm:flex-none">
                      <p className={cn('t-num text-[11px] font-bold sm:mt-2', first ? 'text-gold' : i === 1 ? 'text-[#6B7480]' : 'text-[#9A5F33]')}>Peringkat {r.rank} · {medal}{first && <span> · kandidat hadiah utama</span>}</p>
                      <p className={cn('mt-0.5 break-words text-[16px] font-extrabold leading-tight sm:mt-1 sm:line-clamp-2 sm:text-balance', first ? 'text-white' : 'text-ink')}>{r.laundry}{me && <Badge className="ml-1 align-middle">Kamu</Badge>}</p>
                      {cfg.klasemen.showPic && <p className={cn('t-num mt-0.5 truncate text-[12px]', first ? 'text-white/75' : 'text-ink-2')}>{r.pic} · {r.orders} transaksi</p>}
                    </div>
                    <CountRupiah value={r.spend} className={cn('relative shrink-0 text-[17px] leading-none sm:mt-2 sm:w-full sm:truncate sm:text-[22px]', first ? 'text-gold' : 'text-navy-700')} />
                    {first && grand && (
                      <span className="relative inline-flex min-w-full shrink-0 items-center gap-2 self-start rounded-md bg-white/10 py-1 pl-1 pr-2.5 text-[12px] font-semibold text-white sm:mt-3 sm:min-w-0">
                        <img src={grand.image} alt="" width={800} height={600} className="h-6 w-6 shrink-0 rounded-[4px] object-cover" loading="lazy" />
                        <span className="truncate">Hadiah utama: {grand.label}</span>
                      </span>
                    )}
                    {/* spend relative to the leader */}
                    <div className={cn('relative h-1.5 min-w-full shrink-0 overflow-hidden rounded-full sm:mt-4', first ? 'bg-white/15' : 'bg-navy-900/10')} aria-hidden>
                      <div className="bar-fill h-full rounded-full" style={{ width: `${share}%`, background: first ? '#D4A04E' : 'var(--pod)' }} />
                    </div>
                  </Reveal>
                )
              }
              return (
                <Reveal as="li" key={r.key} data-rank={r.rank} delay={Math.min(i, 9) * 40} className={cn('slide -mx-3 rounded-md px-3 py-3 hover:bg-surface-2 sm:order-4 sm:col-span-3 sm:-mx-4 sm:px-4', i === 3 && 'mt-2 sm:mt-4', me && 'bg-green-50 hover:bg-green-50')}>
                  <div className="flex items-center gap-4">
                    <span className="t-fig grid h-9 w-9 shrink-0 place-items-center rounded-md bg-surface-2 text-[15px] text-ink-3">{r.rank}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold text-ink">{r.laundry}{me && <Badge className="ml-2 align-middle">Kamu</Badge>}</p>
                      {cfg.klasemen.showPic && <p className="t-num truncate text-[13px] text-ink-2">{r.pic} · {r.orders} transaksi</p>}
                    </div>
                    <p className="t-fig shrink-0 text-[15px] text-navy-700 sm:text-[17px]">{rupiah(r.spend)}</p>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-line-2" style={{ marginLeft: 52 }} aria-hidden>
                    <div className="bar-fill h-full rounded-full bg-green-200" style={{ width: `${share}%` }} />
                  </div>
                </Reveal>
              )
            })}
            {mine && mine.rank > cfg.klasemen.topN && (
              <li className="-mx-3 mt-2 flex items-center gap-4 rounded-md bg-green-50 px-3 py-3.5 sm:order-5 sm:col-span-3 sm:-mx-4 sm:px-4">
                <span className="t-fig grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white text-[15px] text-navy-700">{mine.rank}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-[15px] font-bold text-ink">{mine.laundry} <Badge className="ml-1 align-middle">Kamu</Badge></p><p className="text-[13px] text-ink-2">Peringkatmu saat ini</p></div>
                <p className="t-fig text-[15px] text-navy-700">{rupiah(mine.spend)}</p>
              </li>
            )}
          </ol>
        )}
        <p className="t-num mt-6 max-w-2xl text-[13px] leading-relaxed text-ink-2">Yang dihitung: pesanan Lunas (bukti bayar sudah diverifikasi) dalam periode {cfg.campaign.label}. Rp{cfg.rules.earnPerRp.toLocaleString('id-ID')} belanja = 1 poin.</p>
        <span className="hidden"><ShoppingBag /></span>
      </div>
    </section>
  )
}
