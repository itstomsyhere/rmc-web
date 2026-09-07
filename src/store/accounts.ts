import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Account, Kota, Redemption } from '@/model/types'
import { persistOpts, syncAcrossTabs } from './persist'
import { matchRegistration, type MatchResult } from '@/model/match'
import { normalizePhone } from '@/model/phone'
import { genTempPassword, hashPassword, verifyPassword } from '@/model/password'
import { nowISO } from '@/lib/format'
import { uid } from '@/lib/id'
import { useCrm } from './crm'
import { useInbox } from './inbox'
import { cfg } from './config'
import { SEED_ACCOUNTS } from '@/data/seed-accounts'

export interface RegisterForm {
  isMitra: boolean
  hasCard: boolean
  laundry: string
  pic: string
  phone: string
  email: string
  kota?: Kota
  rsl?: string
  referral?: string
  password?: string
}

export interface RegisterOutcome { account: Account; match: MatchResult; tempPassword?: string }

interface AccountsState {
  accounts: Account[]
  redemptions: Redemption[]
  register: (form: RegisterForm) => RegisterOutcome
  login: (phone: string, password: string) => { ok: true; account: Account } | { ok: false; reason: string }
  changePassword: (accountId: string, newPassword: string) => void
  requestReset: (phone: string) => { ok: boolean; tempPassword?: string }
  linkAccount: (accountId: string, crmCustomerId: string) => void
  unlinkToLead: (accountId: string) => void
  redeem: (accountId: string, prizeId: string, prizeName: string, points: number) => Redemption
  byPhone: (phone: string) => Account | undefined
  reset: () => void
}

export const useAccounts = create<AccountsState>()(
  persist(
    (set, get) => ({
      accounts: SEED_ACCOUNTS,
      redemptions: [],
      byPhone: phone => { const p = normalizePhone(phone); return p ? get().accounts.find(a => a.phone === p) : undefined },

      register: form => {
        const phone = normalizePhone(form.phone)
        if (!phone) throw new Error('Nomor HP tidak valid')
        if (get().accounts.some(a => a.phone === phone)) throw new Error('Nomor HP sudah terdaftar, silakan masuk')
        const crm = useCrm.getState()
        const match = matchRegistration({ phone, laundry: form.laundry, pic: form.pic, rsl: form.rsl }, crm.customers, cfg().matching.fuzzyThreshold)

        let tempPassword: string | undefined
        let passwordHash: string
        let mustChange = false
        if (match.link === 'LINKED') {
          tempPassword = genTempPassword()
          passwordHash = hashPassword(tempPassword)
          mustChange = true
        } else {
          passwordHash = hashPassword(form.password || genTempPassword())
        }

        const account: Account = {
          id: `ACC-${uid()}`,
          phone, email: form.email.trim().toLowerCase(),
          laundry: form.laundry.trim(), pic: form.pic.trim(), kota: form.kota,
          isMitra: form.isMitra, hasCard: form.hasCard,
          rsl: form.rsl?.trim().toUpperCase() || undefined, referral: form.referral?.trim() || undefined,
          consentAt: nowISO(), passwordHash, mustChangePassword: mustChange,
          link: match.link, crmCustomerId: match.customer?.id, matchPath: match.path, matchScore: match.score,
          createdAt: nowISO(),
        }
        set({ accounts: [account, ...get().accounts] })

        // side effects, mirrored in PRD Fitur 2 / Fitur 9
        if (match.link === 'LINKED' && match.customer) {
          if (match.backfillPhone) crm.backfillPhone(match.customer.id, phone, account.email)
          crm.log('Akun RMC Web terhubung ke pelanggan', `${account.id} → ${match.customer.id} (jalur ${match.path})`)
          useInbox.getState().send(
            account.email,
            'Kata sandi sementara Resique Golden Privilege',
            `Halo ${account.pic},\n\nAkun RMC-mu untuk ${match.customer.outlet} sudah aktif.\n\nMasuk dengan nomor HP ${phone} dan kata sandi sementara:\n\n${tempPassword}\n\nKamu akan diminta membuat kata sandi baru saat pertama kali masuk.\n\nSalam,\nTim Resique`,
          )
        } else if (match.link === 'PENDING' && match.customer) {
          crm.addClaim(account.id, match.customer.id, match.score)
        } else {
          crm.addLead({ outlet: account.laundry, pic: account.pic, hp: phone, email: account.email, kota: account.kota, referral: account.referral, accountId: account.id })
        }
        return { account, match, tempPassword }
      },

      login: (phone, password) => {
        const a = get().byPhone(phone)
        if (!a) return { ok: false, reason: 'Nomor HP belum terdaftar' }
        if (!verifyPassword(password, a.passwordHash)) return { ok: false, reason: 'Kata sandi salah' }
        return { ok: true, account: a }
      },

      changePassword: (accountId, newPassword) => set({
        accounts: get().accounts.map(a => a.id === accountId ? { ...a, passwordHash: hashPassword(newPassword), mustChangePassword: false } : a),
      }),

      requestReset: phone => {
        const a = get().byPhone(phone)
        if (!a) return { ok: false }
        const tempPassword = genTempPassword()
        set({ accounts: get().accounts.map(x => x.id === a.id ? { ...x, passwordHash: hashPassword(tempPassword), mustChangePassword: true } : x) })
        useInbox.getState().send(a.email, 'Reset kata sandi Resique Golden Privilege', `Halo ${a.pic},\n\nKata sandi sementara baru:\n\n${tempPassword}\n\nMasuk lalu buat kata sandi baru.`)
        return { ok: true, tempPassword }
      },

      linkAccount: (accountId, crmCustomerId) => {
        const a = get().accounts.find(x => x.id === accountId)
        if (!a) return
        const crm = useCrm.getState()
        const c = crm.customers.find(x => x.id === crmCustomerId)
        if (c && !normalizePhone(c.hp)) crm.backfillPhone(c.id, a.phone, a.email)
        set({ accounts: get().accounts.map(x => x.id === accountId ? { ...x, link: 'LINKED', crmCustomerId } : x) })
        crm.log('Akun RMC Web terhubung ke pelanggan (verifikasi sales)', `${accountId} → ${crmCustomerId}`)
        useInbox.getState().send(a.email, 'Akun RMC-mu sudah terverifikasi', `Halo ${a.pic},\n\nSales Resique sudah memverifikasi akunmu. Poin RMC kini tampil di profil.\n\nSalam,\nTim Resique`)
      },

      unlinkToLead: accountId => {
        const a = get().accounts.find(x => x.id === accountId)
        if (!a) return
        set({ accounts: get().accounts.map(x => x.id === accountId ? { ...x, link: 'LEAD', crmCustomerId: undefined } : x) })
        useCrm.getState().addLead({ outlet: a.laundry, pic: a.pic, hp: a.phone, email: a.email, kota: a.kota, referral: a.referral, accountId: a.id })
      },

      redeem: (accountId, prizeId, prizeName, points) => {
        const n = get().redemptions.length + 1
        const r: Redemption = { id: `RDM-${String(n).padStart(4, '0')}`, accountId, prizeId, prizeName, points, at: nowISO() }
        set({ redemptions: [r, ...get().redemptions] })
        useCrm.getState().log('Penukaran poin', `${accountId} · ${prizeName} · ${points} poin`)
        return r
      },

      reset: () => set({ accounts: SEED_ACCOUNTS, redemptions: [] }),
    }),
    {
      ...persistOpts<AccountsState>('accounts'),
      // browsers that persisted an account list before the demo account existed still get it
      merge: (persisted, current) => {
        const p = (persisted as Partial<AccountsState> | undefined) || {}
        const accounts = p.accounts || []
        const withDemo = SEED_ACCOUNTS.filter(d => !accounts.some(a => a.phone === d.phone)).concat(accounts)
        return { ...current, ...p, accounts: withDemo } as AccountsState
      },
    },
  ),
)
syncAcrossTabs(useAccounts)
