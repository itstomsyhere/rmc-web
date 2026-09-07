import { cn } from '@/lib/utils'

/* Doodles (Lurd, 7 Sep: "the doodle background isn't that clear"): line-art behind the two navy bands, brand-green
   tint, 1.5px strokes, bigger motifs kept away from the deck / card, a linear edge mask (the old radial mask killed
   it), slow drift. `hero` / `footer` = laundry motifs; `cta` = coins, tag, star, receipt. Decorative only. */
export function Doodle({ variant }: { variant: 'hero' | 'cta' | 'footer' }) {
  const cls = 'doodle-drift pointer-events-none absolute inset-0 h-full w-full text-green-200'
  const mask = variant === 'hero' ? 'linear-gradient(90deg, #000 0, #000 62%, transparent 100%)' : variant === 'footer' ? 'linear-gradient(90deg, transparent 0, #000 45%, #000 100%)' : 'linear-gradient(270deg, #000 0, #000 55%, transparent 100%)'
  return (
    <svg aria-hidden data-doodle={variant} className={cn(cls, variant === 'hero' ? 'opacity-[0.18] lg:opacity-[0.22]' : variant === 'footer' ? 'opacity-[0.12] lg:opacity-[0.14]' : 'opacity-[0.14] lg:opacity-[0.16]')} viewBox="0 0 1440 560" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="xMidYMid slice" style={{ maskImage: mask, WebkitMaskImage: mask }}>
      {variant !== 'cta' ? (
        <>
          {/* shirt on a hanger, top-left, ×1.3 */}
          <g transform="translate(60 40) scale(1.3)"><path d="M60 56l24-22 20 8 20-8 24 22-14 14-10-6v70h-40v-70l-10 6z" /><path d="M104 22v-14a8 8 0 0 1 8-8h4M48 60l-24 10M168 60l24 10" /></g>
          {/* bubbles, left */}
          <g transform="translate(0 20) scale(1.3)"><circle cx="70" cy="300" r="22" /><circle cx="118" cy="342" r="12" /><circle cx="40" cy="360" r="7" /><circle cx="150" cy="300" r="5" /><path d="M58 290a14 14 0 0 1 10-10" /></g>
          {/* washing-machine drum, bottom-left */}
          <g transform="translate(220 380) scale(1.3)"><circle cx="60" cy="60" r="52" /><circle cx="60" cy="60" r="36" /><path d="M34 34a36 36 0 0 0-8 22M82 86a36 36 0 0 0 10-22" /></g>
          {/* clothes line + pegs, top centre */}
          <path d="M420 60q180 50 360 0" /><path d="M520 78v44h34v-44M640 76v40h28v-40M740 64v34h22v-34" />
          {/* laundry basket, centre */}
          <g transform="translate(560 300) scale(1.2)"><path d="M0 0h150l-16 96H16z" /><path d="M16 28h118M12 56h126M8 84h134M25 0v96M75 0v96M125 0v96" /></g>
          {/* sparkles */}
          <path d="M360 200v40M340 220h40M900 90v26M887 103h26M1000 480v30M985 495h30M190 300v20M180 310h20" />
          {/* soft wave, bottom */}
          <path d="M0 530c120-30 240-30 360 0s240 30 360 0 240-30 360 0 240 30 360 0" />
        </>
      ) : (
        <>
          {/* coins, left */}
          <g transform="translate(90 120) scale(1.3)"><ellipse cx="60" cy="40" rx="48" ry="16" /><path d="M12 40v28c0 9 21 16 48 16s48-7 48-16V40" /><path d="M12 54c0 9 21 16 48 16s48-7 48-16" /></g>
          {/* price tag */}
          <g transform="translate(300 330) scale(1.3)"><path d="M0 40L40 0h60v60l-40 40z" /><circle cx="82" cy="18" r="6" /></g>
          {/* star */}
          <path d="M470 120l14 30 33 4-24 23 6 33-29-16-29 16 6-33-24-23 33-4z" />
          {/* receipt */}
          <g transform="translate(120 360) scale(1.2)"><path d="M0 0h110v130l-14-10-14 10-14-10-13 10-14-10-14 10-13-10-14 10z" /><path d="M22 30h66M22 54h66M22 78h40" /></g>
          {/* sparkles + gift */}
          <path d="M560 300v34M543 317h34M640 60v24M628 72h24M720 420v20M710 430h20" />
          <g transform="translate(600 380) scale(1.2)"><path d="M0 30h120v70H0zM0 30l-30 20 30 15M60 30v70M45 30c0-20 30-20 30 0M75 30c0-20-30-20-30 0" /></g>
        </>
      )}
    </svg>
  )
}

