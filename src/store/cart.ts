import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GoldenSaleItem, OrderLine } from '@/model/types'
import { persistOpts } from './persist'

interface CartState {
  qty: Record<string, number>
  set: (itemId: string, qty: number) => void
  inc: (itemId: string, max?: number) => void
  dec: (itemId: string) => void
  clear: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      qty: {},
      set: (id, q) => { const qty = { ...get().qty }; if (q <= 0) delete qty[id]; else qty[id] = q; set({ qty }) },
      inc: (id, max) => { const cur = get().qty[id] || 0; if (max && max > 0 && cur >= max) return; get().set(id, cur + 1) },
      dec: id => get().set(id, (get().qty[id] || 0) - 1),
      clear: () => set({ qty: {} }),
    }),
    persistOpts<CartState>('cart'),
  ),
)

export function cartLines(qty: Record<string, number>, items: GoldenSaleItem[]): OrderLine[] {
  return Object.entries(qty)
    .map(([id, q]) => { const it = items.find(i => i.id === id); return it && q > 0 ? { itemId: it.id, code: it.code, name: it.name, qty: q, promoPrice: it.promoPrice, realPrice: it.realPrice } : null })
    .filter((x): x is OrderLine => !!x)
}
export const cartTotal = (lines: OrderLine[]) => lines.reduce((s, l) => s + l.qty * l.promoPrice, 0)
export const cartCount = (lines: OrderLine[]) => lines.reduce((s, l) => s + l.qty, 0)
export const cartSavings = (lines: OrderLine[]) => lines.reduce((s, l) => s + l.qty * (l.realPrice - l.promoPrice), 0)

/** Units of an item already bought (Lunas / Bukti Diunggah / Menunggu) by this phone — for maxPerCustomer. */
export function boughtQty(orders: { status: string; buyer: { phone: string }; lines: OrderLine[] }[], phone: string | null, itemId: string) {
  if (!phone) return 0
  return orders.filter(o => o.buyer.phone === phone && o.status !== 'Ditolak' && o.status !== 'Kedaluwarsa')
    .reduce((s, o) => s + o.lines.filter(l => l.itemId === itemId).reduce((t, l) => t + l.qty, 0), 0)
}
/** Units sold (not rejected/expired) across everyone — for quota. */
export function soldQty(orders: { status: string; lines: OrderLine[] }[], itemId: string) {
  return orders.filter(o => o.status !== 'Ditolak' && o.status !== 'Kedaluwarsa')
    .reduce((s, o) => s + o.lines.filter(l => l.itemId === itemId).reduce((t, l) => t + l.qty, 0), 0)
}
