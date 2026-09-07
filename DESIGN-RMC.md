# DESIGN-RMC — Resique Golden Privilege (rmc-web)

Consumer surface of Resique (Apique Group). Mobile-first (390 base), desktop doubles as a pitch deck.
Sibling docs: `DESIGN-CRM.md` / `DESIGN-UM.md` in `crm-apique` (internal tools). Same token lineage, different audience.

## 1. Identity
- **Voice:** warm, direct, Bahasa Indonesia. Headlines short; one idea per section.
- **Palette (R.017, 7 Sep 2026, Lurd's call):** the Resique brand, sampled from the official lockup. **Navy** `#211A5A` (`navy-700`) carries the colour bands, headings and links; **green** `#71BD41` (`green`, the logo green) is the accent for marks, chips, icons, doodles — decorative only, it is 2.3:1 on white — and `green-700 #3E8A1E` (4.6:1 with white) is the action colour for primary buttons and green text; **gold** (`#D4A04E` / `#B08800`) strictly for prize / promo / rank emphasis. Ink ramp for text. Surfaces white / `bg #F8F9FA`. Footer `navy-900 #0D0A29`, never pure black. Tier figures use each tier's `fg` (text-safe ≥ 3:1 at 36px bold), not its swatch. The teal ramp is gone; there is no `teal` token.
- **Logo:** the real Resique lockup (`public/img/resique-logo.png` colour, `resique-logo-white.png` on navy, `resique-mark.png` the cart alone, each with an `@2x`), transparent PNG cut from the files Resique shared on Drive. Exception to "logos stay SVG": no vector was supplied and auto-tracing a raster mark with a face would distort it. `srcSet2x()` in `lib/logo.ts` adds the 2x candidate; uploads (data URLs) get none.
- **Type:** **Plus Jakarta Sans** (400–800). Divergence from CRM (Inter) is deliberate — this is a brand-facing surface and the PRD font. Codes / ids / numerals: Satoshi with tabular figures (`.t-code`), never a monospace (Lurd rule, 7 Sep 2026).
- **Icons:** lucide-react at `strokeWidth 1.5–1.75` (thin, precise) — never 2+ except inside filled buttons.

## 2. Foundations (tailwind.config.ts ← crm styles.css :root)
- Radius: 4 / 6 / 10 / 16 / 22. Cards `rounded-xl`, hero & sheets `rounded-2xl`, pills `rounded-full`.
- Shadow: `shadow-1` (rest), `shadow-2` (hover/float), `shadow-3` (modal/nav), `shadow-gold` (prize CTA). No harsh dark shadows.
- Motion: `ease-out cubic-bezier(.23,1,.32,1)` for enter/exit, `ease-drawer` for sheets, `linear` only for marquee/countdown. Durations 140/180/220/260. Press feedback `active:scale-[.97–.985]`. Entry reveal via `Reveal` (IntersectionObserver, fade-up + 3px blur, 700ms). Reduced-motion respected globally.
- Spacing: sections `py-14 sm:py-20 lg:py-24`; cards `p-5 sm:p-6`; grid gaps 4–6.
- Tap targets ≥ 44px. Safe-area bottom on fixed bars.

## 3. Layout archetypes
- **Nav (R.017):** two-tier sticky header from the RGP UI mock: a utility row (Customer Services · Jam Buka · Lokasi · Hubungi Kami, real contacts in `data/contacts.ts`) above the main row (lockup · Home / RMC / Golden Sale / Klasemen with a scroll-spy dot · socials Instagram / YouTube / Facebook · Cek poin). The utility row slides away on scroll (transform only, lg). Mobile: single row + drawer with staggered links, the contact block and the socials. TikTok / X / LinkedIn have no verified official account and are not rendered.
- **Landing:** Editorial split hero on desktop (copy left / prize deck right: four fanned photo cards that deal in once, then float; a chip ticker below keeps the marquee idiom), single column on mobile. Section textures (`.tex-grain` / `.tex-dots` / `.tex-plus` + one solid skewed `.band`) keep the paper from reading flat without adding gradients or blur. Green-tinted line-art doodles (`Doodle`) sit behind both navy bands, opacity .18–.22. Every section = `SectionHead` (eyebrow → h1 → sub) + content. Desktop pitch-deck = `.section-deck` (min-h 92vh, vertically centred).
- **One hero per view** (memory: restraint over variety). Typography carries hierarchy; no cards-within-cards; no decorative callouts.
- **Double-bezel** only on the two premium objects: the points hero card (Profile) and the QRIS sheet.

## 4. Components
- `components/ui/*` — shadcn-style primitives on brand HSL vars (button variants: default green-700, `gold`, `secondary` green-50, `outline`, `ghost`, `inverse` white-on-navy).
- `RadioCard` — big tappable option rows (registration yes/no, delivery mode, payment method).
- `QtyStepper` — collapses to a "Tambah" pill at 0 (marketplace idiom).
- `Price` — promo bold navy (`.t-fig`) + struck list price + gold `-NN%`.
- Numerals: `.t-fig` (Satoshi 700/900, tabular + lining) for display figures ≥ 20px, `.t-code` (Satoshi 500/700) for codes / ids / small numbers in data rows, `.t-num` (PJS tabular) only for numbers inside prose.
- `Reveal` / `useInView` / `useIsMobile` / `useFinePointer` in `lib/reveal.tsx`.
- `SectionHead`, `EmptyState`, `Table*`, `Progress`, `Separator` in `ui/misc.tsx`.

## 5. Patterns
- Gold = reward. Green-700 = action, navy = structure. Red only for danger/strike.
- Status badges: `statusVariant()` in `ui/badge.tsx` — single mapping for admin + order page.
- Forms: `Field` (label + control + hint/error), zod + react-hook-form, errors inline under the control, `aria-invalid`.
- Sheets (bottom) for basket, QR payment, mock inbox; dialogs for confirmations only.
- Money: `rupiah()`; points: `poin()`; phone display `displayPhone()`.
- Copy is config-driven (`useConfig().config.copy.*`) — never hardcode headline strings on the landing page.

## 6. Prototype-only mechanics (never in PRD Flow/BR/AC)
- Mock inbox (`store/inbox.ts`) instead of real email.
- Config-surface rights come from the CRM embed URL (`actor` · `level` · `caps`, R.014) instead of the UM `/me/permissions` call.
- QRIS image is a static demo SVG; upload proof stored as dataURL in localStorage (≤ 300 KB).
