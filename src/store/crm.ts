import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuditRow, Claim, CrmCustomer, Lead } from '@/model/types'
import { SEED_CUSTOMERS } from '@/data/seed-customers'
import { persistOpts, syncAcrossTabs } from './persist'
import { nowISO } from '@/lib/format'
import { uid } from '@/lib/id'

/* Mocked CRM Resique side: customer master, auto-created leads, Klaim Akun queue, audit trail.
   Production: crm-rsq-service endpoints (see PRD Fitur 9). */
interface CrmState {
  customers: CrmCustomer[]
  leads: Lead[]
  claims: Claim[]
  audit: AuditRow[]
  log: (event: string, meta: string) => void
  backfillPhone: (customerId: string, phone: string, email?: string) => void
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'source'>) => Lead
  addClaim: (accountId: string, candidateCustomerId: string, score: number) => Claim
  decideClaim: (claimId: string, status: 'approved' | 'rejected') => Claim | undefined
  reset: () => void
}

export const useCrm = create<CrmState>()(
  persist(
    (set, get) => ({
      customers: SEED_CUSTOMERS,
      leads: [],
      claims: [],
      audit: [],
      log: (event, meta) => set({ audit: [{ id: uid(), t: nowISO(), event, meta }, ...get().audit].slice(0, 500) }),
      backfillPhone: (customerId, phone, email) => {
        set({ customers: get().customers.map(c => c.id === customerId ? { ...c, hp: phone, email: c.email || email } : c) })
        get().log('Nomor HP dilengkapi dari pendaftaran mandiri', `${customerId} ← ${phone}`)
      },
      addLead: lead => {
        const n = get().leads.length + 1
        const row: Lead = { ...lead, id: `LD-GP-${String(n).padStart(4, '0')}`, createdAt: nowISO(), source: 'Golden Privilege Web' }
        set({ leads: [row, ...get().leads] })
        get().log('Lead baru dari Golden Privilege Web', `${row.id} · ${row.outlet} · ${row.pic}`)
        return row
      },
      addClaim: (accountId, candidateCustomerId, score) => {
        const n = get().claims.length + 1
        const row: Claim = { id: `CLM-${String(n).padStart(4, '0')}`, accountId, candidateCustomerId, score, status: 'open', createdAt: nowISO() }
        set({ claims: [row, ...get().claims] })
        get().log('Klaim akun menunggu verifikasi sales', `${row.id} → ${candidateCustomerId} (skor ${(score * 100).toFixed(0)}%)`)
        return row
      },
      decideClaim: (claimId, status) => {
        const c = get().claims.find(x => x.id === claimId)
        if (!c) return undefined
        const row = { ...c, status, decidedAt: nowISO() }
        set({ claims: get().claims.map(x => x.id === claimId ? row : x) })
        get().log(status === 'approved' ? 'Klaim akun disetujui' : 'Klaim akun ditolak', claimId)
        return row
      },
      reset: () => set({ customers: SEED_CUSTOMERS, leads: [], claims: [], audit: [] }),
    }),
    persistOpts<CrmState>('crm'),
  ),
)
syncAcrossTabs(useCrm)
