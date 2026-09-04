# rmc-web — Resique Golden Privilege

Consumer web prototype for the **Resique Golden Privilege** campaign (Apique Group): mobile-first landing
("Resique Turun Harga"), RMC member profile (points · tier · prizes), Golden Sale with QRIS checkout + proof
upload, spending Klasemen, and the admin config surface that the Apique UM app embeds.

- Live: https://rmc-web.vercel.app (auto-deploys from `main`)
- Admin: `/#/admin` (demo passcode in `src/data/seed-config.ts`) · embed mode `/#/admin?embed=1` (used by crm-apique UM → Module Config → Golden Privilege)
- PRD: `Apique\prd\PRD-CRM-Resique-Golden-Privilege-v1.0.md` (Google Doc canonical)
- Design notes: `DESIGN-RMC.md`

## Stack
Vite 5 · React 18 · TypeScript · Tailwind 3 · shadcn-style ui (Radix) · zustand/persist (localStorage) · react-hook-form + zod · Recharts · SheetJS · sonner · lucide.
No backend — CRM data, accounts, orders, config are seeded + persisted in the browser (`rmcweb_*_v1` keys).

## Run
```
npm install
npm run dev            # http://localhost:5173
npm run build          # tsc -b && vite build → dist/
npm run preview        # http://localhost:4173 (gates run against this)
```

## Gates (Playwright, plain node scripts)
```
npx playwright install chromium   # once
npm run preview &                  # keep running
npm test                           # test/run-all.cjs → model · landing · register · auth-profile · shop · admin
BASE=https://rmc-web.vercel.app node test/landing-verify.cjs   # against live
```
Each gate prints `PASS:`/`FAIL:` lines and exits non-zero on any failure or page error.

## Structure
```
src/model     pure domain: phone normalization, Dice similarity, matching cascade, RMC tier/points, password policy
src/store     zustand stores: config · crm (mock CRM) · accounts · session · orders · cart · inbox (mock email)
src/data      seeds: config defaults, customers (RSL ids), products, prizes, orders
src/pages     Landing · Register · Login · ChangePassword · Profile · Checkout · OrderStatus · Admin
src/components  ui/* (shadcn-style) · layout · landing · shop · auth · profile · admin
test/         gates (*.cjs) + _lib.cjs
tools/        safe-commit.ps1 (commit only named files)
```

## Commit convention
`R.NNN <type>(scope): message` — one phase per commit, `powershell -File tools\safe-commit.ps1 -m "..." -Files a,b,c`.
