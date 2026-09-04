/* ---------------------------------------------------------------------------
   Domain types — mirrors PRD §5C (Skema Field per Entitas).
   --------------------------------------------------------------------------- */

export type Kota = 'Jakarta' | 'Palembang' | 'Jambi' | 'Bandung' | 'Palu' | 'Pontianak'
export const KOTA_LIST: Kota[] = ['Jakarta', 'Palembang', 'Jambi', 'Bandung', 'Palu', 'Pontianak']
/** RSL digit after the prefix: 0 = Mitra Apique Management, 1..6 = home outlet. */
export const KOTA_DIGIT: Record<Kota, number> = { Jakarta: 1, Palembang: 2, Jambi: 3, Bandung: 4, Palu: 5, Pontianak: 6 }

export interface Tier {
  key: string
  name: string
  sw: string
  /** 6-month spend band (Rp), min inclusive; max null = no ceiling */
  min: number
  max: number | null
  perMonth: string
  discount: number
  freeDelivMin: number | null
  consult: number
  benefitCopy: string
}

export interface Benefit { id: string; icon: string; title: string; desc: string }
export interface HeroPrize { id: string; image: string; label: string }

export interface GoldenSaleItem {
  id: string
  code: string
  name: string
  cat: string
  unit: string
  realPrice: number
  promoPrice: number
  image: string
  /** 0 = unlimited */
  quota: number
  /** 0 = unlimited */
  maxPerCustomer: number
  active: boolean
}

export interface Prize { id: string; name: string; image: string; pointCost: number; stock: number; active: boolean; desc?: string }

export interface Config {
  copy: {
    hook: string
    hookSub: string
    tagline: string
    taglineSub: string
    benefitTitle: string
    benefitSub: string
    tierTitle: string
    tierSub: string
    ctaPoints: string
    ctaPointsSub: string
    saleTitle: string
    saleSub: string
    klasemenTitle: string
    klasemenSub: string
    snapDesktop: boolean
  }
  assets: { heroPrizes: HeroPrize[]; logo: string; qrisImage: string }
  benefits: Benefit[]
  tiers: Tier[]
  mitraFloorDiscount: number
  rules: { earnPerRp: number; poinToRp: number; minRedeem: number; expiry: string }
  campaign: { start: string; end: string; label: string }
  items: GoldenSaleItem[]
  prizes: Prize[]
  payment: {
    qrisMerchant: string
    qrisNmid: string
    qrTimeoutSec: number
    uploadDelaySec: number
    vaEnabled: boolean
    ewalletEnabled: boolean
    ewallets: string[]
    vaBanks: string[]
  }
  klasemen: { topN: number; showPic: boolean }
  admin: { passcode: string }
  outlets: Kota[]
  matching: { fuzzyThreshold: number }
  password: { minLength: number }
}

export type LinkStatus = 'LINKED' | 'PENDING' | 'LEAD'
export type MatchPath = 1 | 2 | 3 | 4

export interface Account {
  id: string
  phone: string
  email: string
  laundry: string
  pic: string
  kota: Kota
  isMitra: boolean
  hasCard: boolean
  rsl?: string
  referral?: string
  consentAt: string
  /** prototype: plain sha-ish hash, never real security */
  passwordHash: string
  mustChangePassword: boolean
  link: LinkStatus
  crmCustomerId?: string
  matchPath: MatchPath
  matchScore?: number
  createdAt: string
}

export interface CrmCustomer {
  id: string
  rsl?: string
  outlet: string
  pic: string
  hp?: string
  email?: string
  kota: Kota
  mitra: boolean
  member: boolean
  /** seeded 6-month spend so tiers look realistic before Golden Sale orders exist */
  priorSpend6: number
  priorPointsEarned: number
  /** seeded monthly spend (yyyy-mm → Rp) for the progression chart */
  monthly: Record<string, number>
}

export interface Lead {
  id: string
  outlet: string
  pic: string
  hp: string
  email: string
  kota: Kota
  source: 'Golden Privilege Web'
  referral?: string
  createdAt: string
  accountId: string
}

export interface Claim {
  id: string
  accountId: string
  candidateCustomerId: string
  score: number
  status: 'open' | 'approved' | 'rejected'
  createdAt: string
  decidedAt?: string
}

export interface AuditRow { id: string; t: string; event: string; meta: string }

export interface Redemption { id: string; accountId: string; prizeId: string; prizeName: string; points: number; at: string }

export type OrderStatus = 'Menunggu Pembayaran' | 'Bukti Diunggah' | 'Lunas' | 'Ditolak' | 'Kedaluwarsa'
export const ORDER_STATUSES: OrderStatus[] = ['Menunggu Pembayaran', 'Bukti Diunggah', 'Lunas', 'Ditolak', 'Kedaluwarsa']

export interface OrderLine { itemId: string; code: string; name: string; qty: number; promoPrice: number; realPrice: number }

export interface Order {
  id: string
  createdAt: string
  expiresAt: string
  status: OrderStatus
  buyer: { name: string; laundry: string; phone: string }
  accountId?: string
  crmCustomerId?: string
  fulfil: { mode: 'ambil' | 'kirim'; outlet?: Kota; address?: string }
  payment: { method: 'QRIS' | 'VA' | 'EWALLET'; proofName?: string; proofDataUrl?: string; proofType?: string; uploadedAt?: string }
  lines: OrderLine[]
  total: number
  savings: number
  verifiedAt?: string
  rejectReason?: string
  note?: string
}

export interface InboxMail { id: string; to: string; subject: string; body: string; at: string; read: boolean }
