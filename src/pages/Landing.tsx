import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronsRight, ShoppingBag, Sparkles, Trophy } from 'lucide-react'
import { BENEFIT_ICONS } from '@/lib/benefit-icons'
import { Reveal } from '@/lib/reveal'
import { poin } from '@/lib/format'
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

/* Landing — 7 sections, two colour blocks (hero + "Cek poin-mu!" band), gold reserved for reward/rank.
   Rhythm: hook (paper) → hero (teal) → 5 privilege blocks (paper) → tier cards (white) → CTA band (teal)
   → Golden Sale (paper) → Klasemen (white, gold leader card). No eyebrows, no gradient text, no orbs, no glass,
   cards ≤ 10px radius. Motion: hook fade-up on load, marquee, basket bar slide, and pointer-only hover
   (.lift / .slide / .u-slide / .arrow-nudge in index.css) — Lurd round 5, 4 Sep 2026. */

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

/* Last word of a title carries the highlighter mark (draws in when the title scrolls into view — .mark in index.css). */
function Marked({ text, className }: { text: string; className?: string }) {
  const words = text.trim().split(' ')
  return <>{words.slice(0, -1).join(' ')}{words.length > 1 ? ' ' : ''}<span className={cn('mark', className)}>{words.slice(-1)[0]}</span></>
}

function SectionTitle({ title, sub, tone = 'ink' }: { title: string; sub?: string; tone?: 'ink' | 'white' }) {
  return (
    <Reveal className="max-w-2xl">
      <h2 className={cn('t-h2 text-balance', tone === 'white' ? 'text-white' : 'text-ink')}><Marked text={title} className={tone === 'white' ? 'mark-light' : undefined} /></h2>
      {sub && <p className={cn('mt-3 text-[15px] leading-relaxed text-pretty sm:text-[17px]', tone === 'white' ? 'text-white/80' : 'text-ink-2')}>{sub}</p>}
    </Reveal>
  )
}

/* 1 — Hook: headline left, proof right — the three biggest real price drops from Golden Sale.
   Content is the visual; no decoration. Animates once on load. */
function HookSection() {
  const { copy, campaign, items } = useConfig(s => s.config)
  const drops = items.filter(i => i.active && i.realPrice > i.promoPrice)
    .map(i => ({ ...i, pct: Math.round((1 - i.promoPrice / i.realPrice) * 100), save: i.realPrice - i.promoPrice }))
    .sort((a, b) => b.save - a.save).slice(0, 3)
  const maxPct = Math.max(...items.filter(i => i.realPrice > i.promoPrice).map(i => Math.round((1 - i.promoPrice / i.realPrice) * 100)), 0)
  return (
    <section id="hook" className="scroll-mt-20 pb-12 pt-20 lg:pb-20 lg:pt-24">
      <div className="container grid grid-cols-1 items-center gap-10 animate-fade-up lg:grid-cols-12 lg:gap-14">
        <div className="min-w-0 lg:col-span-7">
          <p className="t-num inline-flex items-center gap-2 rounded-md bg-gold-100 px-2.5 py-1 text-[13px] font-bold text-gold-ink">{fmtDate(campaign.start)} – {fmtDate(campaign.end)}</p>
          <Reveal>
            <h1 className="t-display mt-5 max-w-4xl text-balance text-ink"><Marked text={copy.hook} className="text-teal-700" /></h1>
          </Reveal>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-pretty text-ink-2">{copy.hookSub}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Button asChild size="lg" className="arrow-nudge hover:-translate-y-0.5">
              <a href="#golden-sale" onClick={e => { e.preventDefault(); document.getElementById('golden-sale')?.scrollIntoView({ behavior: 'smooth' }) }}>
                Lihat Golden Sale <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </a>
            </Button>
            <Link to="/login" className="u-slide arrow-nudge inline-flex min-h-[44px] items-center gap-1 text-[15px] font-semibold text-teal-700 transition-colors duration-base hover:text-teal-800 [--u-bottom:8px]">{copy.ctaPoints} <ChevronsRight className="h-4 w-4" strokeWidth={2} /></Link>
          </div>
        </div>
        {drops.length > 0 && (
          <div className="min-w-0 lg:col-span-5">
            {/* three biggest drops (Rp saved) among active Golden Sale items — same config the grid below reads */}
            <div className="rounded-lg border border-line bg-white">
              <div className="flex items-baseline justify-between border-b border-line px-5 py-4">
                <p className="text-[15px] font-bold text-ink">Harga turun paling besar</p>
                <p className="t-num text-[13px] font-semibold text-gold-700">sampai -{maxPct}%</p>
              </div>
              <ul className="divide-y divide-line-2">
                {drops.map(d => (
                  <li key={d.id} className="slide flex items-center gap-4 px-5 py-4 hover:bg-surface-2">
                    <img src={d.image} alt="" width={64} height={48} className="h-12 w-16 shrink-0 rounded-md bg-surface-2 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-ink">{d.name}</p>
                      <p className="t-num text-[13px] text-ink-2"><span className="strike text-ink-3">{rupiah(d.realPrice)}</span> → <strong className="text-teal-700">{rupiah(d.promoPrice)}</strong></p>
                    </div>
                    <span className="t-num shrink-0 rounded-md bg-gold-100 px-2 py-1 text-[13px] font-extrabold text-gold-ink">-{d.pct}%</span>
                  </li>
                ))}
              </ul>
              <a href="#golden-sale" onClick={e => { e.preventDefault(); document.getElementById('golden-sale')?.scrollIntoView({ behavior: 'smooth' }) }} className="arrow-nudge flex min-h-[48px] items-center justify-between border-t border-line px-5 text-[14px] font-semibold text-teal-700 transition-colors duration-base hover:bg-teal-50">
                Semua {items.filter(i => i.active).length} produk promo <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* 2 — Hero: the single colour block; tagline + running prize strip. */
function HeroSection() {
  const { copy, assets } = useConfig(s => s.config)
  const strip = [...assets.heroPrizes, ...assets.heroPrizes]
  return (
    <section id="hero" className="scroll-mt-20 bg-teal-700 py-14 text-white lg:py-20">
      <div className="container grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        <div className="min-w-0 lg:col-span-4">
          <p className="text-[22px] font-extrabold leading-tight tracking-[-0.01em] text-balance text-white sm:text-[26px]">{copy.tagline}</p>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-pretty text-white/80">{copy.taglineSub}</p>
        </div>
        <div className="min-w-0 lg:col-span-8">
          {assets.heroPrizes.length > 0 && (
            <div className="marquee -mx-5 max-w-[100vw] overflow-hidden lg:mx-0 lg:max-w-none" role="region" aria-label="Hadiah yang bisa ditukar">
              <ul className="marquee-track px-5 lg:px-0" style={{ animationDuration: `${Math.max(24, assets.heroPrizes.length * 6)}s` }}>
                {strip.map((p, i) => (
                  <li key={p.id + i} aria-hidden={i >= assets.heroPrizes.length} className="w-[200px] shrink-0 sm:w-[240px]">
                    <img src={p.image} alt={p.label} width={320} height={240} className="aspect-[4/3] w-full rounded-lg bg-white object-cover" loading="lazy" />
                    <p className="mt-2 text-[13px] font-semibold text-white">{p.label}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* 3 — Privilege member RMC: five blocks (diskon belanja · gratis ongkir · konsultasi bisnis · redeem poin · event
   tahunan), each led by its icon + figure. Desktop reads [½ ½] / [⅓ ⅓ ⅓]; content from config (admin-defined). */
function BenefitSection() {
  const { copy, benefits } = useConfig(s => s.config)
  const tones = ['bg-teal-700 text-white', 'bg-gold-50', 'bg-white', 'bg-teal-50', 'bg-white']
  const five = benefits.length === 5
  return (
    <section id="benefit" className="scroll-mt-20 py-14 lg:py-24">
      <div className="container">
        <SectionTitle title={copy.benefitTitle} sub={copy.benefitSub} />
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
          {benefits.map((b, i) => {
            const dark = i === 0
            const Icon = BENEFIT_ICONS[b.icon] || Sparkles
            const span = five ? (i < 2 ? 'lg:col-span-3' : 'lg:col-span-2') : 'lg:col-span-2'
            const lastOdd = i === benefits.length - 1 && benefits.length % 2 === 1 ? 'sm:col-span-2' : ''
            return (
              <Reveal as="li" key={b.id} delay={i * 70} className={cn('min-w-0', span, lastOdd, five && i >= 2 && 'sm:col-span-1')}>
                <div className={cn('lift-lg flex h-full min-h-[220px] flex-col justify-between rounded-lg border border-line p-5', tones[i % tones.length], dark && 'border-teal-700')}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="fig">
                      {b.figure && <p className={cn('t-num text-[40px] font-extrabold leading-none tracking-tight', dark ? 'text-white' : 'text-teal-700')}>{b.figure}</p>}
                      {b.figureNote && <p className={cn('t-num mt-1 text-[13px] font-semibold', dark ? 'text-white/80' : 'text-ink-2')}>{b.figureNote}</p>}
                    </div>
                    <span className={cn('chip grid h-11 w-11 shrink-0 place-items-center rounded-md', dark ? 'bg-white/15 text-white' : 'bg-white text-teal-700 shadow-1')} aria-hidden>
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                  </div>
                  <div className="mt-6">
                    <h3 className={cn('text-[17px] font-bold text-balance', dark ? 'text-white' : 'text-ink')}>{b.title}</h3>
                    <p className={cn('mt-1 text-[14px] leading-relaxed text-pretty', dark ? 'text-white/85' : 'text-ink-2')}>{b.desc}</p>
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

/* 4 — Tier ladder: one markup for every width. */
function TierSection() {
  const cfg = useConfig(s => s.config)
  return (
    <section id="tier" className="scroll-mt-20 border-t border-line bg-white py-14 lg:py-24">
      <div className="container">
        <SectionTitle title={cfg.copy.tierTitle} sub={cfg.copy.tierSub} />
        <ol className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4" aria-label="Daftar tier RMC">
          {cfg.tiers.map((t, i) => <TierCardV key={t.key} tier={t} idx={i} top={i === cfg.tiers.length - 1} />)}
        </ol>
        <div className="mt-6 flex max-w-2xl items-start gap-3 rounded-lg bg-teal-50 p-4">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white text-[13px] font-extrabold text-teal-700">M</span>
          <p className="text-[15px] leading-relaxed text-ink-2">
            <strong className="text-ink">Mitra Apique Management</strong> punya diskon minimal <strong className="t-num text-ink">{cfg.mitraFloorDiscount}%</strong> sejak Starter. Kalau diskon tier lebih besar, itu yang dipakai.
          </p>
        </div>
      </div>
    </section>
  )
}
/* Tier card: colour identity from the tier swatch (badge + discount), gold surface for the top tier. */
function TierCardV({ tier, idx, top }: { tier: Tier; idx: number; top: boolean }) {
  return (
    <li className={cn('lift group flex flex-col rounded-lg border p-5', top ? 'border-gold-200 bg-gold-50 hover:border-gold' : 'border-line bg-white hover:border-teal-200')}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="t-num grid h-9 w-9 shrink-0 place-items-center rounded-md text-[13px] font-extrabold text-white" style={{ background: tier.sw }} aria-hidden>{idx + 1}</span>
          <div>
            <h3 className="text-[17px] font-extrabold leading-tight text-ink">{tier.name}</h3>
            <p className="t-num text-[13px] text-ink-2">{tier.perMonth} / bulan</p>
          </div>
        </div>
        <p className="t-num origin-right text-[34px] font-extrabold leading-none tracking-tight transition-transform duration-slow ease-out group-hover:scale-110" style={{ color: top ? '#8A6A00' : tier.sw }}>{tier.discount}%</p>
      </div>
      <p className="mt-4 text-[14px] leading-relaxed text-pretty text-ink-2">{tier.benefitCopy}</p>
      <dl className="t-num mt-4 grid grid-cols-3 gap-2 border-t border-line-2 pt-3 text-[12px]">
        <div><dt className="text-ink-3">Belanja 6 bln</dt><dd className="font-semibold text-ink">{tier.max ? `${rupiah(tier.min, { short: true }).replace('Rp', '')}–${rupiah(tier.max, { short: true })}` : `≥ ${rupiah(tier.min, { short: true })}`}</dd></div>
        <div><dt className="text-ink-3">Gratis ongkir</dt><dd className="font-semibold text-ink">{tier.freeDelivMin === null ? '—' : tier.freeDelivMin === 0 ? 'Tanpa min.' : `min. ${rupiah(tier.freeDelivMin, { short: true })}`}</dd></div>
        <div><dt className="text-ink-3">Konsultasi</dt><dd className="font-semibold text-ink">{tier.consult ? `${tier.consult} sesi` : '—'}</dd></div>
      </dl>
    </li>
  )
}

/* 5 — CTA band: second colour block (teal) — the conversion point. Left: ask + 3 step chips + buttons.
   Right: a real RMC card preview (demo member's live numbers), tilted; straightens on hover. */
function CtaSection() {
  const cfg = useConfig(s => s.config)
  const { copy, rules } = cfg
  const acc = useCurrentAccount()
  const steps = ['Masuk pakai nomor HP', 'Lihat poin, tier & diskon', 'Tukar poin jadi hadiah']
  return (
    <section id="cek-poin" className="scroll-mt-20 overflow-hidden bg-teal-700 py-16 text-white lg:py-24">
      <div className="container grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
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
                    <span className="t-num grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-[13px] font-extrabold text-teal-700" aria-hidden>{i + 1}</span>
                    {s}
                  </span>
                  {i < steps.length - 1 && <ChevronsRight className="mx-1.5 h-4 w-4 shrink-0 text-white/50 sm:mx-2" strokeWidth={2} aria-hidden />}
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={160} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Button asChild size="lg" variant="inverse" className="arrow-nudge hover:-translate-y-0.5">
              <Link to={acc ? '/profile' : '/login'}>{acc ? 'Buka profil RMC' : 'Masuk & cek poin'} <ArrowRight className="h-4 w-4" strokeWidth={2} /></Link>
            </Button>
            {!acc && <Link to="/register" className="u-slide inline-flex min-h-[44px] items-center text-[15px] font-semibold text-white [--u-bottom:8px]">Belum punya akun? Daftar</Link>}
          </Reveal>
        </div>
        <Reveal delay={120} className="min-w-0 lg:col-span-5">
          <RmcCardPreview rules={rules} />
        </Reveal>
      </div>
    </section>
  )
}

/* The demo member's card, computed with the same rmcFor() the profile uses — real tier, real points, real months. */
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
      <p className="mb-4 text-[13px] font-semibold text-white/70">Contoh profil member — {demo.laundry}</p>
      <div className="relative">
        <div className="tilt-back absolute inset-0 rounded-xl bg-gold" aria-hidden />
        <div data-rmc-card className="tilt relative rounded-xl bg-white p-5 text-ink shadow-3 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img src={cfg.assets.logo} alt="" width={28} height={28} className="h-7 w-7 rounded-md" />
              <p className="text-[13px] font-bold text-ink">Resique Member Card</p>
            </div>
            <span className="rounded-md px-2.5 py-1 text-[12px] font-extrabold text-white" style={{ background: rmc.tier.sw }}>{rmc.tier.name}</span>
          </div>
          <p className="mt-6 text-[13px] font-semibold text-ink-3">Poin RMC</p>
          <p className="t-num mt-1 text-[40px] font-extrabold leading-none tracking-[-0.02em] text-teal-700 sm:text-[44px]">{poin(rmc.points)}</p>
          <p className="t-num mt-1.5 text-[13px] text-ink-2">Diskon {rmc.discount}% · poin berlaku sampai {rules.expiry}</p>
          <div className="mt-5 flex items-end justify-between gap-4 border-t border-line-2 pt-4">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold text-ink">{demo.laundry}</p>
              <p className="truncate text-[13px] text-ink-2">{demo.pic} · {demo.rsl}</p>
            </div>
            <div className="flex h-9 shrink-0 items-end gap-1" aria-label="Poin 6 bulan terakhir">
              {months.map((m, i) => (
                <span key={m.ym} className={cn('w-2 rounded-sm', i === months.length - 1 ? 'bg-gold' : 'bg-teal-200')} style={{ height: `${Math.max(12, Math.round((m.points / maxPts) * 100))}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* 6 — Golden Sale */
function GoldenSaleSection() {
  const cfg = useConfig(s => s.config)
  const orders = useOrders(s => s.orders)
  const qty = useCart(s => s.qty)
  const inc = useCart(s => s.inc)
  const dec = useCart(s => s.dec)
  const items = cfg.items.filter(i => i.active)
  return (
    <section id="golden-sale" className="scroll-mt-20 py-14 lg:py-24">
      <div className="container">
        <SectionTitle title={cfg.copy.saleTitle} sub={cfg.copy.saleSub} />
        <p className="t-num mt-3 text-[15px] text-ink-2">{items.length} produk · sampai {fmtDate(cfg.campaign.end)} · selama stok ada</p>
        {items.length === 0 ? (
          <EmptyState className="mt-8" title="Belum ada item Golden Sale" desc="Item promo belum dibuka. Cek lagi nanti." />
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
            {items.map(it => {
              const sold = soldQty(orders, it.id)
              const left = it.quota > 0 ? Math.max(0, it.quota - sold) : Infinity
              const q = qty[it.id] || 0
              const max = Math.min(it.maxPerCustomer > 0 ? it.maxPerCustomer : Infinity, left)
              return (
                <li key={it.id}>
                  <ProductCard item={it} qty={q} left={left} max={Number.isFinite(max) ? max : undefined}
                    onInc={() => { if (left <= 0) return toast.error('Stok habis'); if (Number.isFinite(max) && q >= max) return toast.warning(`Maksimal ${max} per pelanggan`); inc(it.id) }}
                    onDec={() => dec(it.id)} />
                </li>
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
    <article className={cn('flex h-full flex-col rounded-lg border bg-white p-3 sm:p-4', qty > 0 ? 'border-teal-200 ring-1 ring-teal-200' : 'border-line', soldOut && 'opacity-70')}>
      <div className="relative overflow-hidden rounded-md bg-surface-2">
        <img src={item.image} alt={item.name} width={320} height={240} className="aspect-[4/3] w-full object-cover" loading="lazy" />
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
      <div data-basket-bar aria-hidden={!show} className={cn('fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-[transform,opacity] duration-slow ease-out', show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0')}>
        <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-xl bg-ink p-2 pl-4 text-white shadow-3">
          <button type="button" onClick={() => setOpen(true)} className="flex min-h-11 min-w-0 flex-1 flex-col justify-center text-left" aria-label="Lihat keranjang">
            <span className="t-num text-[13px] text-white/80">{count} item · hemat {rupiah(savings)}</span>
            <span className="t-num truncate text-[17px] font-extrabold leading-tight">{rupiah(total)}</span>
          </button>
          <Button asChild variant="gold" size="lg" className="rounded-lg"><Link to="/checkout">Checkout <ArrowRight className="h-4 w-4" strokeWidth={2} /></Link></Button>
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
                  <p className="t-num text-[15px] font-bold text-ink">{rupiah(l.qty * l.promoPrice)}</p>
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

/* 7 — Klasemen: leader gets a gold card (rank 1 = hadiah utama), the rest a list with a spend bar relative to the
   leader. One <ol> so the ranking stays a single ordered list. Rows slide on hover (pointer devices). */
function KlasemenSection() {
  const cfg = useConfig(s => s.config)
  const orders = useOrders(s => s.orders)
  const acc = useCurrentAccount()
  const rows = React.useMemo(() => klasemen(orders, cfg.campaign.start, cfg.campaign.end), [orders, cfg.campaign.start, cfg.campaign.end])
  const top = rows.slice(0, cfg.klasemen.topN)
  const mine = acc ? rows.find(r => r.accountId === acc.id || (acc.crmCustomerId && r.crmCustomerId === acc.crmCustomerId) || r.phone === acc.phone) : undefined
  const leadSpend = top[0]?.spend || 1
  return (
    <section id="klasemen" className="scroll-mt-20 border-t border-line bg-white py-14 lg:py-24">
      <div className="container">
        <SectionTitle title={cfg.copy.klasemenTitle} sub={cfg.copy.klasemenSub} />
        {top.length === 0 ? <EmptyState className="mt-8" title="Belum ada pesanan Lunas" desc="Pesanan yang sudah Lunas akan tampil di sini." /> : (
          <ol className="mt-8" aria-label="Peringkat belanja Golden Sale">
            {top.map((r, i) => {
              const me = !!mine && r.key === mine.key
              if (i === 0) return (
                <li key={r.key} data-rank={r.rank} className="lift mb-4 grid grid-cols-[auto_1fr] items-center gap-4 rounded-lg border border-gold-200 bg-gold-50 p-5 sm:grid-cols-[auto_1fr_auto] sm:gap-6 sm:p-6">
                  <span className="grid h-14 w-14 place-items-center rounded-md bg-gold text-gold-ink sm:h-16 sm:w-16" aria-hidden><Trophy className="h-7 w-7" strokeWidth={1.6} /></span>
                  <div className="min-w-0">
                    <p className="t-num text-[13px] font-bold text-gold-700">Peringkat 1 · kandidat hadiah utama</p>
                    <p className="mt-1 break-words text-[20px] font-extrabold leading-tight text-balance text-ink sm:text-[24px]">{r.laundry}{me && <Badge className="ml-2 align-middle">Kamu</Badge>}</p>
                    {cfg.klasemen.showPic && <p className="t-num mt-0.5 truncate text-[14px] text-ink-2">{r.pic} · {r.orders} transaksi</p>}
                  </div>
                  <p className="t-num col-start-2 text-[24px] font-extrabold leading-none tracking-tight text-teal-700 sm:col-start-3 sm:text-right sm:text-[30px]">{rupiah(r.spend)}</p>
                </li>
              )
              return (
                <li key={r.key} data-rank={r.rank} className={cn('slide -mx-3 rounded-md px-3 py-3 hover:bg-surface-2 sm:-mx-4 sm:px-4', me && 'bg-teal-50 hover:bg-teal-50')}>
                  <div className="flex items-center gap-4">
                    <span className={cn('t-num grid h-9 w-9 shrink-0 place-items-center rounded-md text-[15px] font-extrabold', r.rank <= 3 ? 'bg-gold-100 text-gold-ink' : 'bg-surface-2 text-ink-3')}>{r.rank}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold text-ink">{r.laundry}{me && <Badge className="ml-2 align-middle">Kamu</Badge>}</p>
                      {cfg.klasemen.showPic && <p className="t-num truncate text-[13px] text-ink-2">{r.pic} · {r.orders} transaksi</p>}
                    </div>
                    <p className="t-num shrink-0 text-[15px] font-extrabold text-teal-700 sm:text-[17px]">{rupiah(r.spend)}</p>
                  </div>
                  {/* spend relative to the leader — the gap to rank 1 at a glance */}
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-line-2" style={{ marginLeft: 52 }} aria-hidden>
                    <div className="h-full rounded-full bg-teal-200 transition-[width] duration-slow ease-out" style={{ width: `${Math.max(4, Math.round((r.spend / leadSpend) * 100))}%` }} />
                  </div>
                </li>
              )
            })}
            {mine && mine.rank > cfg.klasemen.topN && (
              <li className="-mx-3 mt-2 flex items-center gap-4 rounded-md bg-teal-50 px-3 py-3.5 sm:-mx-4 sm:px-4">
                <span className="t-num grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white text-[15px] font-extrabold text-teal-700">{mine.rank}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-[15px] font-bold text-ink">{mine.laundry} <Badge className="ml-1 align-middle">Kamu</Badge></p><p className="text-[13px] text-ink-2">Peringkatmu saat ini</p></div>
                <p className="t-num text-[15px] font-extrabold text-teal-700">{rupiah(mine.spend)}</p>
              </li>
            )}
          </ol>
        )}
        <p className="t-num mt-4 max-w-2xl text-[13px] leading-relaxed text-ink-2">Yang dihitung: pesanan Lunas (bukti bayar sudah diverifikasi) dalam periode {cfg.campaign.label}. Rp{cfg.rules.earnPerRp.toLocaleString('id-ID')} belanja = 1 poin.</p>
        <span className="hidden"><ShoppingBag /></span>
      </div>
    </section>
  )
}
