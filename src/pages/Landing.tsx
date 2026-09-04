import * as React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, ShoppingBag, Sparkles, Trophy, UserPlus, Coins, Gift, Crown, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { rupiah, poin } from '@/lib/format'
import { Reveal } from '@/lib/reveal'
import { useConfig } from '@/store/config'
import { useOrders, klasemen } from '@/store/orders'
import { useCart, cartLines, cartTotal, cartCount, cartSavings, soldQty } from '@/store/cart'
import { useCurrentAccount } from '@/store/session'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SectionHead, EmptyState } from '@/components/ui/misc'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Price } from '@/components/shop/Price'
import { QtyStepper } from '@/components/shop/QtyStepper'
import type { GoldenSaleItem, Tier } from '@/model/types'

const ICONS: Record<string, LucideIcon> = { UserPlus, Coins, Gift, Crown, Sparkles, Trophy }

export function LandingPage() {
  const cfg = useConfig(s => s.config)
  const hasCart = useCart(s => Object.keys(s.qty).length > 0)
  return (
    <div className={cn(cfg.copy.snapDesktop && 'lg:snap-y lg:snap-mandatory', hasCart && 'pb-24')}>
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

/* 1 — Hook: the campaign title. One line, huge. */
function HookSection() {
  const { copy, campaign } = useConfig(s => s.config)
  return (
    <section id="hook" className="section section-deck relative overflow-hidden pt-36 sm:pt-40">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-100/70 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-teal-50 blur-3xl" />
      <div className="container relative">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-200 bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-700 backdrop-blur">
            <Sparkles className="h-3 w-3" strokeWidth={2} /> {campaign.label}
          </span>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="t-display mt-5 max-w-4xl text-ink">
            {copy.hook.split(' ').map((w, i, a) => <span key={i} className={cn(i === a.length - 1 && 'gold-text')}>{w}{i < a.length - 1 ? ' ' : ''}</span>)}
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-2 sm:text-lg">{copy.hookSub}</p>
        </Reveal>
        <Reveal delay={180} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="xl" variant="gold" className="group rounded-full pr-2">
            <a href="#golden-sale" onClick={e => { e.preventDefault(); document.getElementById('golden-sale')?.scrollIntoView({ behavior: 'smooth' }) }}>
              Lihat Golden Sale
              <span className="grid h-8 w-8 place-items-center rounded-full bg-black/10 transition-transform duration-base ease-out group-hover:translate-x-0.5 group-hover:-translate-y-px"><ArrowRight className="h-4 w-4" strokeWidth={2.2} /></span>
            </a>
          </Button>
          <Button asChild size="xl" variant="outline" className="rounded-full"><Link to="/login">{copy.ctaPoints}</Link></Button>
        </Reveal>
      </div>
    </section>
  )
}

/* 2 — Hero: tagline + running prize strip */
function HeroSection() {
  const { copy, assets } = useConfig(s => s.config)
  const strip = [...assets.heroPrizes, ...assets.heroPrizes]
  return (
    <section id="hero" className="section section-deck teal-gradient relative overflow-hidden text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
      <div className="container relative grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <Reveal><p className="t-eyebrow text-gold-200">Resique Member Card</p></Reveal>
          <Reveal delay={60}><h2 className="t-h1 mt-3 text-white">{copy.tagline}</h2></Reveal>
          <Reveal delay={120}><p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75 sm:text-base">{copy.taglineSub}</p></Reveal>
          <Reveal delay={180} className="mt-7">
            <Button asChild size="lg" variant="inverse" className="group rounded-full pr-1.5">
              <Link to="/register">Daftar RMC sekarang<span className="grid h-7 w-7 place-items-center rounded-full bg-teal-50 transition-transform duration-base ease-out group-hover:translate-x-0.5 group-hover:-translate-y-px"><ArrowUpRight className="h-4 w-4" strokeWidth={2} /></span></Link>
            </Button>
          </Reveal>
        </div>
        <div className="lg:col-span-7">
          <Reveal delay={100}>
            <div className="marquee -mx-5 overflow-hidden py-2 lg:mx-0" aria-label="Hadiah yang bisa ditukar" role="region">
              <ul className="marquee-track px-5 lg:px-0" style={{ animationDuration: `${Math.max(24, assets.heroPrizes.length * 6)}s` }}>
                {strip.map((p, i) => (
                  <li key={p.id + i} aria-hidden={i >= assets.heroPrizes.length} className="w-[210px] shrink-0 sm:w-[250px]">
                    <div className="rounded-[22px] bg-white/10 p-1.5 ring-1 ring-white/15 backdrop-blur-sm">
                      <div className="overflow-hidden rounded-[16px] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,.6)]">
                        <img src={p.image} alt={p.label} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                      </div>
                      <p className="px-3 pb-1.5 pt-2 text-[13px] font-bold text-white/90">{p.label}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* 3 — Benefit RMC */
function BenefitSection() {
  const { copy, benefits } = useConfig(s => s.config)
  return (
    <section id="benefit" className="section section-deck">
      <div className="container">
        <Reveal><SectionHead eyebrow="Benefit RMC" title={copy.benefitTitle} sub={copy.benefitSub} /></Reveal>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-6">
          {benefits.map((b, i) => {
            const Icon = ICONS[b.icon] || Sparkles
            return (
              <Reveal key={b.id} delay={i * 60} as="li">
                <div className="group h-full rounded-2xl border border-line bg-white p-6 shadow-1 transition-[transform,box-shadow] duration-slow ease-out hover:-translate-y-0.5 hover:shadow-2">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700 transition-colors duration-base group-hover:bg-gold-100 group-hover:text-gold-ink"><Icon className="h-6 w-6" strokeWidth={1.6} /></span>
                  <h3 className="mt-5 text-[17px] font-bold text-ink">{b.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-3">{b.desc}</p>
                </div>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* 4 — Benefit per tier */
function TierSection() {
  const cfg = useConfig(s => s.config)
  return (
    <section id="tier" className="section section-deck bg-white">
      <div className="container">
        <Reveal><SectionHead eyebrow="Benefit Tier RMC" title={cfg.copy.tierTitle} sub={cfg.copy.tierSub} /></Reveal>
        <div className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 lg:mx-0 lg:mt-14 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
          {cfg.tiers.map((t, i) => <TierCard key={t.key} tier={t} idx={i} top={i === cfg.tiers.length - 1} />)}
        </div>
        <Reveal delay={120}>
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-gold-200 bg-gold-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[15px] font-bold text-gold-ink">Mitra Apique Management</p>
              <p className="mt-0.5 text-[13px] text-ink-2">Diskon dasar <strong className="t-num">{cfg.mitraFloorDiscount}%</strong> sejak Starter. Naik mengikuti tier bila diskon tier lebih besar.</p>
            </div>
            <Badge variant="gold" className="w-max">Floor {cfg.mitraFloorDiscount}%</Badge>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
function TierCard({ tier, idx, top }: { tier: Tier; idx: number; top: boolean }) {
  return (
    <Reveal delay={idx * 50} className="w-[240px] shrink-0 snap-start lg:w-auto">
      <div className={cn('flex h-full flex-col rounded-2xl border p-5 shadow-1 transition-[transform,box-shadow] duration-slow ease-out hover:-translate-y-0.5 hover:shadow-2', top ? 'gold-gradient border-transparent text-gold-ink' : 'border-line bg-white')}>
        <div className="flex items-center justify-between">
          <span className="h-3 w-3 rounded-full ring-2 ring-white" style={{ background: tier.sw }} aria-hidden />
          <span className={cn('text-micro uppercase', top ? 'text-gold-ink/70' : 'text-ink-4')}>Tier {idx + 1}</span>
        </div>
        <h3 className="mt-4 text-[20px] font-extrabold tracking-tight">{tier.name}</h3>
        <p className={cn('t-num mt-1 text-[12px] font-semibold', top ? 'text-gold-ink/80' : 'text-ink-3')}>{tier.perMonth} / bulan</p>
        <p className={cn('t-num mt-4 text-[34px] font-extrabold leading-none tracking-tight', top ? 'text-gold-ink' : 'text-teal-700')}>{tier.discount}%<span className="ml-1 text-[12px] font-bold">diskon</span></p>
        <p className={cn('mt-4 text-[13px] leading-relaxed', top ? 'text-gold-ink/85' : 'text-ink-2')}>{tier.benefitCopy}</p>
      </div>
    </Reveal>
  )
}

/* 5 — CTA: check your points */
function CtaSection() {
  const { copy } = useConfig(s => s.config)
  const acc = useCurrentAccount()
  return (
    <section id="cek-poin" className="section">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] teal-gradient p-8 text-white sm:p-12 lg:p-16">
            <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/25 blur-3xl" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="t-eyebrow text-gold-200">Poin RMC</p>
                <h2 className="t-h1 mt-3 text-white">{copy.ctaPoints} <span aria-hidden>&raquo;</span></h2>
                <p className="mt-3 text-[15px] leading-relaxed text-white/75 sm:text-base">{copy.ctaPointsSub}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button asChild size="xl" variant="gold" className="group rounded-full pr-2">
                  <Link to={acc ? '/profile' : '/login'}>{acc ? 'Buka profil RMC' : 'Masuk & cek poin'}<span className="grid h-8 w-8 place-items-center rounded-full bg-black/10 transition-transform duration-base ease-out group-hover:translate-x-0.5 group-hover:-translate-y-px"><ArrowUpRight className="h-4 w-4" strokeWidth={2.2} /></span></Link>
                </Button>
                {!acc && <Button asChild size="xl" variant="inverse" className="rounded-full"><Link to="/register">Daftar akun</Link></Button>}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
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
    <section id="golden-sale" className="section section-deck bg-white">
      <div className="container">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHead eyebrow="Harga spesial" title={cfg.copy.saleTitle} sub={cfg.copy.saleSub} />
            <Badge variant="gold" className="w-max"><ShoppingBag className="h-3 w-3" strokeWidth={2} /> {cfg.campaign.label}</Badge>
          </div>
        </Reveal>
        {items.length === 0 ? (
          <EmptyState className="mt-10" title="Belum ada item Golden Sale" desc="Admin belum mengaktifkan item untuk periode ini." />
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:mt-14 lg:grid-cols-4">
            {items.map((it, i) => {
              const sold = soldQty(orders, it.id)
              const left = it.quota > 0 ? Math.max(0, it.quota - sold) : Infinity
              const q = qty[it.id] || 0
              const max = Math.min(it.maxPerCustomer > 0 ? it.maxPerCustomer : Infinity, left)
              return (
                <Reveal key={it.id} delay={(i % 4) * 50} as="li">
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
    <article className={cn('flex h-full flex-col rounded-2xl border border-line bg-white p-3 shadow-1 transition-[transform,box-shadow] duration-slow ease-out sm:p-4', qty > 0 ? 'border-teal-200 ring-1 ring-teal-200' : 'hover:-translate-y-0.5 hover:shadow-2', soldOut && 'opacity-70')}>
      <div className="relative overflow-hidden rounded-xl bg-surface-2">
        <img src={item.image} alt={item.name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
        {soldOut ? <Badge variant="muted" className="absolute left-2 top-2">Habis</Badge>
          : Number.isFinite(left) && left <= 10 ? <Badge variant="warn" className="absolute left-2 top-2">Sisa {left}</Badge> : null}
      </div>
      <h3 className="mt-3 line-clamp-2 min-h-[2.6em] text-[13px] font-bold leading-snug text-ink sm:text-[14px]">{item.name}</h3>
      <p className="mt-0.5 text-[11px] text-ink-4">{item.cat} · per {item.unit}</p>
      <Price real={item.realPrice} promo={item.promoPrice} size="sm" className="mt-2" />
      <div className="mt-3 flex items-center justify-between gap-2">
        <QtyStepper qty={qty} onInc={onInc} onDec={onDec} max={max} disabled={soldOut} label={item.name} className="w-full justify-center sm:w-auto" />
      </div>
    </article>
  )
}

/* Sticky basket bar + basket sheet */
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
        <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-full bg-ink p-2 pl-5 text-white shadow-3">
          <button type="button" onClick={() => setOpen(true)} className="flex min-h-11 min-w-0 flex-1 flex-col justify-center text-left" aria-label="Lihat keranjang">
            <span className="text-[11px] font-semibold text-white/60"><span className="t-num">{count}</span> item · hemat <span className="t-num">{rupiah(savings)}</span></span>
            <span className="t-num truncate text-[17px] font-extrabold leading-tight">{rupiah(total)}</span>
          </button>
          <Button asChild variant="gold" size="lg" className="group rounded-full pr-1.5">
            <Link to="/checkout">Checkout<span className="grid h-8 w-8 place-items-center rounded-full bg-black/10 transition-transform duration-base ease-out group-hover:translate-x-0.5"><ArrowRight className="h-4 w-4" strokeWidth={2.2} /></span></Link>
          </Button>
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="sm:mx-auto sm:max-w-lg sm:rounded-2xl sm:bottom-4">
          <SheetHeader><SheetTitle>Keranjang</SheetTitle><SheetDescription>{count} item · total {rupiah(total)}</SheetDescription></SheetHeader>
          <ul className="mt-4 divide-y divide-line-2">
            {lines.map(l => (
              <li key={l.itemId} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-ink">{l.name}</p>
                  <p className="t-num text-[12px] text-ink-3">{rupiah(l.promoPrice)} × {l.qty}</p>
                </div>
                <QtyStepper qty={l.qty} onInc={() => setQty(l.itemId, l.qty + 1)} onDec={() => setQty(l.itemId, l.qty - 1)} label={l.name} />
              </li>
            ))}
          </ul>
          <Button asChild size="xl" variant="gold" className="mt-4 w-full rounded-full"><Link to="/checkout">Lanjut ke pembayaran · {rupiah(total)}</Link></Button>
        </SheetContent>
      </Sheet>
    </>
  )
}

/* 7 — Klasemen */
function KlasemenSection() {
  const cfg = useConfig(s => s.config)
  const orders = useOrders(s => s.orders)
  const acc = useCurrentAccount()
  const rows = React.useMemo(() => klasemen(orders, cfg.campaign.start, cfg.campaign.end), [orders, cfg.campaign.start, cfg.campaign.end])
  const top = rows.slice(0, cfg.klasemen.topN)
  const mine = acc ? rows.find(r => r.accountId === acc.id || (acc.crmCustomerId && r.crmCustomerId === acc.crmCustomerId) || r.phone === acc.phone) : undefined
  const medal = ['🥇', '🥈', '🥉']
  return (
    <section id="klasemen" className="section section-deck">
      <div className="container">
        <Reveal><SectionHead eyebrow="Klasemen" title={cfg.copy.klasemenTitle} sub={cfg.copy.klasemenSub} /></Reveal>
        <Reveal delay={80}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-line bg-white shadow-1 lg:mt-14">
            {top.length === 0 ? <EmptyState className="m-4" title="Belum ada transaksi terverifikasi" desc="Jadilah yang pertama di klasemen Golden Privilege." /> : (
              <ol className="divide-y divide-line-2" aria-label="Peringkat belanja Golden Sale">
                {top.map(r => {
                  const me = !!mine && r.key === mine.key
                  return (
                    <li key={r.key} data-rank={r.rank} className={cn('flex items-center gap-3 px-4 py-3.5 sm:px-6', me && 'bg-teal-50/70', r.rank <= 3 && 'bg-gradient-to-r from-gold-50/80 to-transparent')}>
                      <span className={cn('t-num grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-extrabold', r.rank <= 3 ? 'gold-gradient text-gold-ink' : 'bg-surface-2 text-ink-2')}>{r.rank <= 3 ? medal[r.rank - 1] : r.rank}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-bold text-ink">{r.laundry}{me && <Badge className="ml-2 align-middle">Kamu</Badge>}</p>
                        {cfg.klasemen.showPic && <p className="truncate text-[12px] text-ink-3">{r.pic} · {r.orders} transaksi</p>}
                      </div>
                      <p className="t-num shrink-0 text-[15px] font-extrabold text-teal-700 sm:text-[17px]">{rupiah(r.spend)}</p>
                    </li>
                  )
                })}
              </ol>
            )}
            {mine && mine.rank > cfg.klasemen.topN && (
              <div className="flex items-center gap-3 border-t border-teal-100 bg-teal-50/70 px-4 py-3.5 sm:px-6">
                <span className="t-num grid h-9 w-9 place-items-center rounded-full bg-teal-500 text-[13px] font-extrabold text-white">{mine.rank}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-[15px] font-bold text-ink">{mine.laundry} <Badge className="ml-1 align-middle">Kamu</Badge></p><p className="text-[12px] text-ink-3">Peringkatmu saat ini</p></div>
                <p className="t-num text-[15px] font-extrabold text-teal-700">{rupiah(mine.spend)}</p>
              </div>
            )}
          </div>
        </Reveal>
        <Reveal delay={140}><p className="mt-4 text-[12px] text-ink-4">Hanya pesanan berstatus Lunas (bukti pembayaran terverifikasi) dalam periode {cfg.campaign.label} yang dihitung. Poin RMC: {poin(cfg.rules.earnPerRp)} rupiah = 1 poin.</p></Reveal>
      </div>
    </section>
  )
}
