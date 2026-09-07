import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Config } from '@/model/types'
import { DEFAULT_CONFIG } from '@/data/seed-config'
import { persistOpts, syncAcrossTabs } from './persist'

interface ConfigState {
  config: Config
  setConfig: (patch: Partial<Config> | ((c: Config) => Partial<Config>)) => void
  setSection: <K extends keyof Config>(key: K, value: Config[K]) => void
  reset: () => void
}

/** deep-ish merge so a stored config from an older seed still gets new default keys. */
function mergeConfig(stored: Partial<Config> | undefined): Config {
  if (!stored) return DEFAULT_CONFIG
  const out: Config = { ...DEFAULT_CONFIG, ...stored }
  ;(['copy', 'assets', 'rules', 'campaign', 'payment', 'klasemen', 'matching', 'password'] as const).forEach(k => {
    // @ts-expect-error — generic section merge
    out[k] = { ...DEFAULT_CONFIG[k], ...(stored[k] || {}) }
  })
  // seed upgrades: a browser that stored an older default (untouched by admin) follows the new default
  const OLD_BENEFIT_IDS = ['b1', 'b2', 'b3', 'b4']
  if (!Array.isArray(out.benefits) || !out.benefits.length || out.benefits.every(b => OLD_BENEFIT_IDS.includes(b.id))) out.benefits = DEFAULT_CONFIG.benefits
  const COPY_UPGRADES: Partial<Record<keyof Config['copy'], string[]>> = {
    hook: ['Resique Turun Harga'],
    benefitSub: ['Poin dari setiap belanja, diskon tier sampai 5%, dan hadiah yang bisa ditukar.', 'Diskon belanja, gratis ongkir, konsultasi bisnis, tukar poin, dan event tahunan eksklusif Resique.'],
    tierTitle: ['Diskon tier 0% sampai 5%'],
  }
  // R.011: tiers/benefits that still carry the drifted crm-prototype values follow the RSQ-RMC-001 v2.0 seed
  const OLD_TIER_SIG: Record<string, [number | null, number]> = { starter: [null, 0], beginner: [500_000, 0], intermediate: [300_000, 0], winner: [150_000, 1], champion: [75_000, 2], ultimate: [0, 3] }
  if (out.tiers.every(t => { const o = OLD_TIER_SIG[t.key]; return o && t.freeDelivMin === o[0] && t.consult === o[1] })) out.tiers = DEFAULT_CONFIG.tiers
  // R.012: bands became inclusive (x.999.999) — a stored max that still equals the next tier's min moves down by 1
  out.tiers = out.tiers.map(t => { const seed = DEFAULT_CONFIG.tiers.find(d => d.key === t.key); return seed && seed.max !== null && t.max === seed.max + 1 ? { ...t, max: seed.max } : t })
  const OLD_BENEFIT_DESC: Record<string, string[]> = {
    'b-diskon': ['Diskon 1–5% sesuai tier, langsung dipotong dari tiap belanja chemical & perlengkapan. Mitra Apique Management minimal 3%.', 'Diskon 1–5% sesuai level, langsung dipotong saat transaksi — tidak perlu klaim. Mitra Apique Management minimal 3%.'],
    'b-ongkir': ['Mulai tier Beginner untuk belanja di atas minimum tier. Tier Ultimate gratis ongkir tanpa minimum.', 'Semua level, tiap transaksi yang memenuhi minimum: belanja Rp500 rb (Starter–Intermediate) atau Rp350 rb (Winner ke atas).'],
    'b-konsultasi': ['Sesi konsultasi operasional laundry bersama tim Resique, mulai tier Winner.', '1 sesi = 1 jam bersama trainer Apique Academy. Winner & Champion 1 sesi per bulan, Ultimate 2 sesi per bulan.'],
    'b-poin': ['Tiap Rp1.000 belanja Lunas jadi 1 poin. Tukar mulai 500 poin: voucher, parfum 5L, tablet, sampai laptop. Poin berlaku sampai 20 Des.', 'Tiap Rp1.000 belanja jadi 1 poin (mesin cuci tidak dihitung). Tukar mulai 500 poin jadi voucher belanja atau hadiah Golden Privilege. Poin hangus 20 Des.'],
    'b-event': ['Undangan Gala Dinner dan gathering member Resique, mulai tier Champion.', 'Undangan untuk member dengan belanja tertinggi periode Juli–Desember, RMC biasa maupun Mitra. Ada undian grandprize untuk tamu undangan.'],
  }
  out.benefits = out.benefits.map(b => { const seed = DEFAULT_CONFIG.benefits.find(d => d.id === b.id); return seed && (OLD_BENEFIT_DESC[b.id] || []).includes(b.desc) ? seed : b })
  // R.010: "0–5%" → "Hingga 5%" on the seed diskon block (only if the admin has not changed it)
  out.benefits = out.benefits.map(b => { const seed = DEFAULT_CONFIG.benefits.find(d => d.id === b.id); return seed && b.figure === '0–5%' ? { ...b, figure: seed.figure } : b })
  ;(Object.keys(COPY_UPGRADES) as (keyof Config['copy'])[]).forEach(k => {
    if (COPY_UPGRADES[k]!.includes(String(out.copy[k]))) (out.copy as Record<string, unknown>)[k] = DEFAULT_CONFIG.copy[k]
  })
  if (!Array.isArray(out.tiers) || !out.tiers.length) out.tiers = DEFAULT_CONFIG.tiers
  if (!Array.isArray(out.prizeTypes) || !out.prizeTypes.length) out.prizeTypes = DEFAULT_CONFIG.prizeTypes
  out.prizes = (out.prizes || []).map(p => ({ ...p, type: p.type || out.prizeTypes[out.prizeTypes.length - 1] }))
  // R.015: the gradient-card SVG placeholders became real photos — stored seed paths follow; uploads (data:) untouched
  const isSeedSvg = (v?: string) => !!v && /^\/img\/(prize|product)-[\w-]+\.svg$/.test(v)
  const jpg = (v: string) => v.replace(/\.svg$/, '.jpg')
  out.assets = { ...out.assets, heroPrizes: (out.assets.heroPrizes || []).map(h => isSeedSvg(h.image) ? { ...h, image: jpg(h.image) } : h) }
  out.prizes = out.prizes.map(p => isSeedSvg(p.image) ? { ...p, image: jpg(p.image) } : p)
  out.items = (out.items || []).map(it => { if (!isSeedSvg(it.image)) return it; const seed = DEFAULT_CONFIG.items.find(d => d.id === it.id); return { ...it, image: seed ? seed.image : jpg(it.image) } })
  // R.017: the placeholder "R" monogram became the real Resique lockup (colour / white / mark); uploads (data:) untouched
  const OLD_LOGO = '/img/resique-logo.svg'
  if (!out.assets.logo || out.assets.logo === OLD_LOGO) out.assets = { ...out.assets, logo: DEFAULT_CONFIG.assets.logo }
  if (!out.assets.logoWhite) out.assets = { ...out.assets, logoWhite: DEFAULT_CONFIG.assets.logoWhite }
  if (!out.assets.mark) out.assets = { ...out.assets, mark: DEFAULT_CONFIG.assets.mark }
  // R.017: tier swatches left the teal ramp; a stored seed swatch follows, and every tier gets its text-safe `fg`
  const OLD_SW: Record<string, string> = { beginner: '#5fb4a2', intermediate: '#2e8577' }
  out.tiers = out.tiers.map(t => { const seed = DEFAULT_CONFIG.tiers.find(d => d.key === t.key); const sw = seed && OLD_SW[t.key] === t.sw ? seed.sw : t.sw; return { ...t, sw, fg: t.fg || (seed && sw === seed.sw ? seed.fg : undefined) } })
  return out
}

export const useConfig = create<ConfigState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      setConfig: patch => set({ config: { ...get().config, ...(typeof patch === 'function' ? patch(get().config) : patch) } }),
      setSection: (key, value) => set({ config: { ...get().config, [key]: value } }),
      reset: () => set({ config: DEFAULT_CONFIG }),
    }),
    {
      ...persistOpts<ConfigState>('config'),
      partialize: s => ({ config: s.config }) as ConfigState,
      merge: (persisted, current) => ({ ...current, config: mergeConfig((persisted as Partial<ConfigState> | undefined)?.config) }),
    },
  ),
)
syncAcrossTabs(useConfig)

export const cfg = () => useConfig.getState().config
