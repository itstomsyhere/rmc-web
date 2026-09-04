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
  ;(['copy', 'assets', 'rules', 'campaign', 'payment', 'klasemen', 'admin', 'matching', 'password'] as const).forEach(k => {
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
  // R.010: "0–5%" → "Hingga 5%" on the seed diskon block (only if the admin has not changed it)
  out.benefits = out.benefits.map(b => { const seed = DEFAULT_CONFIG.benefits.find(d => d.id === b.id); return seed && b.figure === '0–5%' ? { ...b, figure: seed.figure } : b })
  ;(Object.keys(COPY_UPGRADES) as (keyof Config['copy'])[]).forEach(k => {
    if (COPY_UPGRADES[k]!.includes(String(out.copy[k]))) (out.copy as Record<string, unknown>)[k] = DEFAULT_CONFIG.copy[k]
  })
  if (!Array.isArray(out.tiers) || !out.tiers.length) out.tiers = DEFAULT_CONFIG.tiers
  if (!Array.isArray(out.prizeTypes) || !out.prizeTypes.length) out.prizeTypes = DEFAULT_CONFIG.prizeTypes
  out.prizes = (out.prizes || []).map(p => ({ ...p, type: p.type || out.prizeTypes[out.prizeTypes.length - 1] }))
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
