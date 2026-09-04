import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Account } from '@/model/types'
import { useAccounts } from './accounts'

interface SessionState {
  accountId: string | null
  adminUnlocked: boolean
  signIn: (id: string) => void
  signOut: () => void
  unlockAdmin: () => void
  lockAdmin: () => void
}

/** Session lives in sessionStorage — a closed tab = signed out (production: httpOnly cookie). */
export const useSession = create<SessionState>()(
  persist(
    set => ({
      accountId: null,
      adminUnlocked: false,
      signIn: id => set({ accountId: id }),
      signOut: () => set({ accountId: null }),
      unlockAdmin: () => set({ adminUnlocked: true }),
      lockAdmin: () => set({ adminUnlocked: false }),
    }),
    { name: 'rmcweb_session', storage: createJSONStorage(() => sessionStorage) },
  ),
)

export function useCurrentAccount(): Account | null {
  const id = useSession(s => s.accountId)
  const accounts = useAccounts(s => s.accounts)
  return id ? accounts.find(a => a.id === id) || null : null
}
