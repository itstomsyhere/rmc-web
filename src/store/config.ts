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
