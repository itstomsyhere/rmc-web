import type { Config, Tier, Benefit, HeroPrize, Prize } from '@/model/types'
import { SEED_ITEMS } from './seed-products'

/* Tiers ported verbatim from crm-apique src/rmc.jsx DEFAULT_TIERS (Kebijakan RMC v2.0 / RSQ-RMC-001). */
export const SEED_TIERS: Tier[] = [
  { key: 'starter',      name: 'Starter',      sw: '#9ca3af', min: 0,           max: 9_000_000,   perMonth: '< Rp1,5 jt', discount: 0, freeDelivMin: null,    consult: 0, benefitCopy: 'Belum ada diskon. Poin tetap dapat: Rp1.000 = 1 poin.' },
  { key: 'beginner',     name: 'Beginner',     sw: '#5fb4a2', min: 9_000_000,   max: 18_000_000,  perMonth: 'Rp1,5–3 jt', discount: 1, freeDelivMin: 500_000, consult: 0, benefitCopy: 'Diskon 1%. Gratis ongkir untuk belanja min. Rp500 rb.' },
  { key: 'intermediate', name: 'Intermediate', sw: '#2e8577', min: 18_000_000,  max: 30_000_000,  perMonth: 'Rp3–5 jt',   discount: 2, freeDelivMin: 300_000, consult: 0, benefitCopy: 'Diskon 2%. Gratis ongkir untuk belanja min. Rp300 rb.' },
  { key: 'winner',       name: 'Winner',       sw: '#2c5282', min: 30_000_000,  max: 60_000_000,  perMonth: 'Rp5–10 jt',  discount: 3, freeDelivMin: 150_000, consult: 1, benefitCopy: 'Diskon 3%, gratis ongkir min. Rp150 rb, 1 sesi konsultasi laundry.' },
  { key: 'champion',     name: 'Champion',     sw: '#7c6ae8', min: 60_000_000,  max: 120_000_000, perMonth: 'Rp10–20 jt', discount: 4, freeDelivMin: 75_000,  consult: 2, benefitCopy: 'Diskon 4%, gratis ongkir min. Rp75 rb, 2 sesi konsultasi, Gala Dinner.' },
  { key: 'ultimate',     name: 'Ultimate',     sw: '#d4a04e', min: 120_000_000, max: null,        perMonth: '> Rp20 jt',  discount: 5, freeDelivMin: 0,       consult: 3, benefitCopy: 'Diskon 5%, gratis ongkir tanpa minimum, 3 sesi konsultasi, produk baru lebih dulu.' },
]

export const SEED_BENEFITS: Benefit[] = [
  { id: 'b1', icon: 'UserPlus',  title: 'Daftar pakai nomor HP', desc: 'Isi data sekali. Kalau nomor HP sudah ada di data Resique, poin langsung tersambung.' },
  { id: 'b2', icon: 'Coins',     title: 'Rp1.000 = 1 poin', desc: 'Berlaku untuk semua belanja chemical & perlengkapan yang Lunas. Poin berlaku sampai 20 Des.' },
  { id: 'b3', icon: 'Gift',      title: 'Tukar poin jadi hadiah', desc: 'Voucher belanja, parfum 5L, tablet, sampai laptop. Minimal tukar 500 poin.' },
  { id: 'b4', icon: 'Crown',     title: 'Diskon & gratis ongkir', desc: 'Diskon 1–5% sesuai tier, gratis ongkir, konsultasi laundry, undangan Gala Dinner.' },
]

export const SEED_HERO: HeroPrize[] = [
  { id: 'h1', image: '/img/prize-phone.svg',    label: 'Smartphone' },
  { id: 'h2', image: '/img/prize-laptop.svg',   label: 'Laptop' },
  { id: 'h3', image: '/img/prize-voucher.svg',  label: 'Voucher Belanja' },
  { id: 'h4', image: '/img/prize-parfum.svg',   label: 'Parfum Laundry 5L' },
  { id: 'h5', image: '/img/prize-tablet.svg',   label: 'Tablet' },
  { id: 'h6', image: '/img/prize-dinner.svg',   label: 'Gala Dinner' },
]

export const SEED_PRIZE_TYPES = ['Voucher', 'Produk Resique', 'Elektronik', 'Layanan', 'Lainnya']

/* Demo catalog only — production starts empty; name/type/point cost/stock are all admin-defined (🟣). */
export const SEED_PRIZES: Prize[] = [
  { id: 'p1', name: 'Voucher Belanja Resique Rp100.000', type: 'Voucher', image: '/img/prize-voucher.svg', pointCost: 5_000,   stock: 100, active: true, desc: 'Potongan Rp100.000 di belanja berikutnya.' },
  { id: 'p2', name: 'Parfum Laundry Premium 5L',         type: 'Produk Resique', image: '/img/prize-parfum.svg',  pointCost: 9_000,   stock: 40,  active: true, desc: 'Whiff Fresh Elegant / Greendome Downy Black.' },
  { id: 'p3', name: 'Paket Chemical 1 Bulan',            type: 'Produk Resique', image: '/img/prize-chemical.svg', pointCost: 25_000, stock: 20,  active: true, desc: 'Deterjen matic 5L ×4 + parfum 5L ×2.' },
  { id: 'p4', name: 'Tablet 10"',                        type: 'Elektronik', image: '/img/prize-tablet.svg',  pointCost: 60_000,  stock: 5,   active: true, desc: 'Untuk kasir & pencatatan outlet.' },
  { id: 'p5', name: 'Smartphone Flagship',               type: 'Elektronik', image: '/img/prize-phone.svg',   pointCost: 150_000, stock: 3,   active: true, desc: 'Samsung Galaxy S-series / setara.' },
  { id: 'p6', name: 'Laptop Bisnis',                     type: 'Elektronik', image: '/img/prize-laptop.svg',  pointCost: 250_000, stock: 2,   active: true, desc: 'Apple MacBook Air M-series / setara.' },
]

export const DEFAULT_CONFIG: Config = {
  copy: {
    hook: 'Resique Turun Harga',
    hookSub: 'Harga chemical & perlengkapan turun. Setiap Rp1.000 belanja tetap dapat 1 poin RMC.',
    tagline: 'Tingkatkan transaksi, dapatkan hadiahnya!',
    taglineSub: 'Rp1.000 belanja = 1 poin RMC. Poin bisa ditukar voucher, parfum, sampai laptop.',
    benefitTitle: 'Yang didapat member RMC',
    benefitSub: 'Poin dari setiap belanja, diskon tier sampai 5%, dan hadiah yang bisa ditukar.',
    tierTitle: 'Diskon tier 0% sampai 5%',
    tierSub: 'Tier dihitung dari total belanja 6 bulan (Jan–Jun / Jul–Des).',
    ctaPoints: 'Cek poin-mu!',
    ctaPointsSub: 'Masuk pakai nomor HP yang terdaftar di Resique. Lihat poin, tier, dan diskon aktif.',
    saleTitle: 'Golden Sale',
    saleSub: 'Harga promo selama periode Golden Privilege, selama stok ada.',
    klasemenTitle: 'Klasemen Golden Privilege',
    klasemenSub: 'Urutan total belanja dari pesanan Lunas. Belanja terbanyak dapat hadiah utama.',
    snapDesktop: false,
  },
  assets: { heroPrizes: SEED_HERO, logo: '/img/resique-logo.svg', qrisImage: '/img/qris-resique.png' },
  benefits: SEED_BENEFITS,
  tiers: SEED_TIERS,
  mitraFloorDiscount: 3,
  rules: { earnPerRp: 1000, poinToRp: 20, minRedeem: 500, expiry: '20 Des' },
  campaign: { start: '2026-09-01', end: '2026-10-31', label: 'Golden Privilege Sep–Okt 2026' },
  items: SEED_ITEMS,
  prizes: SEED_PRIZES,
  prizeTypes: SEED_PRIZE_TYPES,
  payment: {
    qrisMerchant: 'Resique Jakarta',
    qrisNmid: 'ID2023263339905',
    qrTimeoutSec: 300,
    uploadDelaySec: 30,
    vaEnabled: false,
    ewalletEnabled: false,
    ewallets: ['GoPay', 'ShopeePay', 'OVO', 'DANA'],
    vaBanks: ['BCA', 'BNI', 'Mandiri', 'BRI'],
  },
  klasemen: { topN: 10, showPic: true },
  admin: { passcode: 'resique2026' },
  outlets: ['Jakarta', 'Palembang', 'Jambi', 'Bandung', 'Palu', 'Pontianak'],
  matching: { fuzzyThreshold: 0.8 },
  password: { minLength: 8 },
}
