# DESIGN-RMC — Resique Golden Privilege (rmc-web)

Consumer surface of Resique (Apique Group). Mobile-first (390 base), desktop doubles as a pitch deck.
Sibling docs: `DESIGN-CRM.md` / `DESIGN-UM.md` in `crm-apique` (internal tools). Same token lineage, different audience.

## 1. Identity
- **Voice:** warm, direct, Bahasa Indonesia. Headlines short; one idea per section.
- **Palette:** Resique teal (`teal-500 #14695E` primary, `teal-700 #0E5249` deep, `teal-50 #EAF6F3` tint) + **gold** (`#D4A04E` / `#B08800`) strictly for prize / promo / rank emphasis. Ink ramp for text. Surfaces white / `bg #F8F9FA`. Never pure black.
- **Type:** **Plus Jakarta Sans** (400–800). Divergence from CRM (Inter) is deliberate — this is a brand-facing surface and the PRD font. Codes / ids / numerals: Satoshi with tabular figures (`.t-code`), never a monospace (Lurd rule, 7 Sep 2026).
- **Icons:** lucide-react at `strokeWidth 1.5–1.75` (thin, precise) — never 2+ except inside filled buttons.

## 2. Foundations (tailwind.config.ts ← crm styles.css :root)
- Radius: 4 / 6 / 10 / 16 / 22. Cards `rounded-xl`, hero & sheets `rounded-2xl`, pills `rounded-full`.
- Shadow: `shadow-1` (rest), `shadow-2` (hover/float), `shadow-3` (modal/nav), `shadow-gold` (prize CTA). No harsh dark shadows.
- Motion: `ease-out cubic-bezier(.23,1,.32,1)` for enter/exit, `ease-drawer` for sheets, `linear` only for marquee/countdown. Durations 140/180/220/260. Press feedback `active:scale-[.97–.985]`. Entry reveal via `Reveal` (IntersectionObserver, fade-up + 3px blur, 700ms). Reduced-motion respected globally.
- Spacing: sections `py-14 sm:py-20 lg:py-24`; cards `p-5 sm:p-6`; grid gaps 4–6.
- Tap targets ≥ 44px. Safe-area bottom on fixed bars.

## 3. Layout archetypes
- **Nav:** floating glass island pill (`SiteHeader`), detached from top; hamburger morphs to X; mobile overlay with staggered link reveal.
- **Landing:** Editorial split hero on desktop (copy left / prize marquee right), single column on mobile. Every section = `SectionHead` (eyebrow → h1 → sub) + content. Desktop pitch-deck = `.section-deck` (min-h 92vh, vertically centred).
- **One hero per view** (memory: restraint over variety). Typography carries hierarchy; no cards-within-cards; no decorative callouts.
- **Double-bezel** only on the two premium objects: the points hero card (Profile) and the QRIS sheet.

## 4. Components
- `components/ui/*` — shadcn-style primitives on brand HSL vars (button variants: default teal, `gold`, `secondary`, `outline`, `ghost`, `inverse`).
- `RadioCard` — big tappable option rows (registration yes/no, delivery mode, payment method).
- `QtyStepper` — collapses to a "Tambah" pill at 0 (marketplace idiom).
- `Price` — promo bold teal + struck list price + gold `-NN%`.
- `Reveal` / `useInView` / `useIsMobile` / `useFinePointer` in `lib/reveal.tsx`.
- `SectionHead`, `EmptyState`, `Table*`, `Progress`, `Separator` in `ui/misc.tsx`.

## 5. Patterns
- Gold = reward. Teal = action. Red only for danger/strike.
- Status badges: `statusVariant()` in `ui/badge.tsx` — single mapping for admin + order page.
- Forms: `Field` (label + control + hint/error), zod + react-hook-form, errors inline under the control, `aria-invalid`.
- Sheets (bottom) for basket, QR payment, mock inbox; dialogs for confirmations only.
- Money: `rupiah()`; points: `poin()`; phone display `displayPhone()`.
- Copy is config-driven (`useConfig().config.copy.*`) — never hardcode headline strings on the landing page.

## 6. Prototype-only mechanics (never in PRD Flow/BR/AC)
- Mock inbox (`store/inbox.ts`) instead of real email.
- Admin passcode gate (`config.admin.passcode`) instead of UM role.
- QRIS image is a static demo SVG; upload proof stored as dataURL in localStorage (≤ 300 KB).
