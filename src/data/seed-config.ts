import type { Config, Tier, Benefit, HeroPrize, Prize } from '@/model/types'
import { SEED_ITEMS } from './seed-products'

/* Tiers per "Kebijakan Program RMC" RSQ-RMC-001 v2.0 (Drive 1g2OJQFKHG5zp1E4JKNfvllhaL3YSZ1tQ) — the canonical source.
   Gratis ongkir: belanja ≥ Rp500.000 (Starter–Intermediate) / ≥ Rp350.000 (Winner–Ultimate). Konsultasi = sesi per BULAN,
   1 sesi = 1 jam bersama trainer Apique Academy (Winner ke atas). NOT the crm-apique prototype seed (it drifted). */
export const SEED_TIERS: Tier[] = [
  { key: 'starter',      name: 'Starter',      sw: '#9ca3af', min: 0,           max: 9_000_000,   perMonth: '< Rp1,5 jt', discount: 0, freeDelivMin: 500_000, consult: 0, benefitCopy: 'Belum ada diskon. Gratis ongkir untuk belanja min. Rp500 rb. Poin tetap dapat: Rp1.000 = 1 poin.' },
  { key: 'beginner',     name: 'Beginner',     sw: '#5fb4a2', min: 9_000_000,   max: 18_000_000,  perMonth: 'Rp1,5–3 jt', discount: 1, freeDelivMin: 500_000, consult: 0, benefitCopy: 'Diskon 1% langsung saat transaksi. Gratis ongkir untuk belanja min. Rp500 rb.' },
  { key: 'intermediate', name: 'Intermediate', sw: '#2e8577', min: 18_000_000,  max: 30_000_000,  perMonth: 'Rp3–5 jt',   discount: 2, freeDelivMin: 500_000, consult: 0, benefitCopy: 'Diskon 2% langsung saat transaksi. Gratis ongkir untuk belanja min. Rp500 rb.' },
  { key: 'winner',       name: 'Winner',       sw: '#2c5282', min: 30_000_000,  max: 60_000_000,  perMonth: 'Rp5–10 jt',  discount: 3, freeDelivMin: 350_000, consult: 1, benefitCopy: 'Diskon 3%, gratis ongkir min. Rp350 rb, konsultasi bisnis 1 sesi per bulan.' },
  { key: 'champion',     name: 'Champion',     sw: '#7c6ae8', min: 60_000_000,  max: 120_000_000, perMonth: 'Rp10–20 jt', discount: 4, freeDelivMin: 350_000, consult: 1, benefitCopy: 'Diskon 4%, gratis ongkir min. Rp350 rb, konsultasi bisnis 1 sesi per bulan.' },
  { key: 'ultimate',     name: 'Ultimate',     sw: '#d4a04e', min: 120_000_000, max: null,        perMonth: '> Rp20 jt',  discount: 5, freeDelivMin: 350_000, consult: 2, benefitCopy: 'Diskon 5%, gratis ongkir min. Rp350 rb, konsultasi bisnis 2 sesi per bulan.' },
]

/* Five RMC privileges (Lurd, 4 Sep) — wording per RSQ-RMC-001 v2.0 §3–§6. Golden Privilege prizes are campaign-specific
   (admin-defined, BR-4.11); the RMC policy itself redeems poin as voucher belanja. */
export const SEED_BENEFITS: Benefit[] = [
  { id: 'b-diskon',     icon: 'Percent',        figure: 'Hingga 5%', figureNote: 'diskon belanja', title: 'Diskon belanja',                  desc: 'Diskon 1–5% sesuai level, langsung dipotong saat transaksi — tidak perlu klaim. Mitra Apique Management minimal 3%.' },
  { id: 'b-ongkir',     icon: 'Truck',          figure: 'Gratis',    figureNote: 'ongkir',         title: 'Gratis ongkir',                   desc: 'Semua level, tiap transaksi yang memenuhi minimum: belanja Rp500 rb (Starter–Intermediate) atau Rp350 rb (Winner ke atas).' },
  { id: 'b-konsultasi', icon: 'MessagesSquare', figure: '1–2 sesi',  figureNote: 'per bulan',      title: 'Gratis konsultasi bisnis',        desc: '1 sesi = 1 jam bersama trainer Apique Academy. Winner & Champion 1 sesi per bulan, Ultimate 2 sesi per bulan.' },
  { id: 'b-poin',       icon: 'Gift',           figure: 'Rp1.000',   figureNote: '= 1 poin',       title: 'Redeem poin',                     desc: 'Tiap Rp1.000 belanja jadi 1 poin (mesin cuci tidak dihitung). Tukar mulai 500 poin jadi voucher belanja atau hadiah Golden Privilege. Poin hangus 20 Des.' },
  { id: 'b-event',      icon: 'PartyPopper',    figure: 'Des',       figureNote: 'tiap tahun',     title: 'Event tahunan eksklusif Resique', desc: 'Undangan untuk member dengan belanja tertinggi periode Juli–Desember, RMC biasa maupun Mitra. Ada undian grandprize untuk tamu undangan.' },
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
    hook: 'Resique Turun Harga!',
    hookSub: 'Harga chemical & perlengkapan turun. Setiap Rp1.000 belanja tetap dapat 1 poin RMC.',
    tagline: 'Tingkatkan transaksi, dapatkan hadiahnya!',
    taglineSub: 'Rp1.000 belanja = 1 poin RMC. Poin bisa ditukar voucher, parfum, sampai laptop.',
    benefitTitle: 'Yang didapat member RMC',
    benefitSub: 'Diskon hingga 5%, gratis ongkir, konsultasi bisnis, tukar poin, dan event tahunan eksklusif Resique.',
    tierTitle: 'Diskon tier hingga 5%',
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
