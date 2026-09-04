import type { GoldenSaleItem } from '@/model/types'

/* Subset of crm-apique RESIQUE_PRODUCTS (data.jsx:482+) — chemical & shoes-care lines.
   Promo ≈ 85% of list price rounded to Rp500. Quota/limit 🟣 configurable (0 = unlimited). */
const promo = (p: number) => Math.round((p * 0.85) / 500) * 500

const raw: Omit<GoldenSaleItem, 'id' | 'promoPrice' | 'image' | 'quota' | 'maxPerCustomer' | 'active'>[] = [
  { code: '000004', name: 'Duta Deterjen 5L',                          cat: 'Perlengkapan Pakaian', unit: 'L',   realPrice: 70_000 },
  { code: '000031', name: 'Molto Parfum Laundry Purple Delight 5L',    cat: 'Perlengkapan Pakaian', unit: 'L',   realPrice: 165_000 },
  { code: '000122', name: 'So Klin Detergent Matic Professional 5L',   cat: 'Perlengkapan Pakaian', unit: 'L',   realPrice: 68_000 },
  { code: '000148', name: 'Whiff Fresh Parfum Finishing Elegant 5L',   cat: 'Perlengkapan Pakaian', unit: 'L',   realPrice: 255_000 },
  { code: '000244', name: 'Greendome Parfum Downy Black 5L',           cat: 'Perlengkapan Pakaian', unit: 'L',   realPrice: 210_000 },
  { code: '000305', name: 'Rinso Matic Profesional 1.65L',             cat: 'Perlengkapan Pakaian', unit: 'L',   realPrice: 28_500 },
  { code: '000553', name: 'Xtra Bersih Detergent Cair 5L',             cat: 'Perlengkapan Pakaian', unit: 'L',   realPrice: 80_000 },
  { code: '000202', name: 'BARA Premium Apparel Cleaner 250ML',        cat: 'Shoes',                unit: 'pcs', realPrice: 125_000 },
  { code: '000401', name: 'KAME Natural Shoes & Apparel Cleaner 250ML', cat: 'Shoes',               unit: 'pcs', realPrice: 99_000 },
  { code: '000226', name: 'Glad Cleaner & Conditioner 1000ML',         cat: 'Shoes',                unit: 'pcs', realPrice: 140_000 },
  { code: '000448', name: 'KAME Paket Sepatu',                         cat: 'Shoes',                unit: 'set', realPrice: 750_000 },
  { code: '000216', name: 'Daijin Timbangan Digital 30KG',             cat: 'HouseHold',            unit: 'pcs', realPrice: 470_000 },
]

export const SEED_ITEMS: GoldenSaleItem[] = raw.map((r, i) => ({
  id: `gs-${r.code}`,
  ...r,
  promoPrice: promo(r.realPrice),
  image: `/img/product-${(i % 6) + 1}.svg`,
  quota: 0,
  maxPerCustomer: 0,
  active: true,
}))
