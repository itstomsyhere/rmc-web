/* Landing gate — 7 sections at 390 + 1440, marquee, tiers, klasemen, basket bar, no page errors. */
const { ok, launch, go, resetStores, text, minTapHeight, finish } = require('./_lib.cjs')

;(async () => {
  const { b, p, errs } = await launch({ width: 390, height: 844 })
  await resetStores(p)
  await go(p, '/')

  const ids = ['hook', 'hero', 'benefit', 'tier', 'cek-poin', 'golden-sale', 'klasemen']
  const order = await p.evaluate(ids => ids.map(id => { const el = document.getElementById(id); return el ? el.getBoundingClientRect().top + window.scrollY : -1 }), ids)
  ok(order.every(v => v >= 0), `7 sections present → ${JSON.stringify(order.map(Math.round))}`)
  ok(order.every((v, i) => i === 0 || v > order[i - 1]), 'sections in the specified order')

  const t = await text(p)
  ok(/Resique Turun Harga!/.test(t), 'hook title "Resique Turun Harga!" (exclamation)')
  ok(/Harga turun paling besar/.test(t) && !/Contoh harga turun/.test(t), 'hook drop card titled "Harga turun paling besar" (no "Contoh")')
  ok((await p.locator('#benefit ul > li').count()) === 5, '5 privilege blocks (diskon · ongkir · konsultasi · redeem · event)')
  ok(/Diskon belanja/.test(t) && /Gratis ongkir/.test(t) && /Gratis konsultasi bisnis/.test(t) && /Redeem poin/.test(t) && /Event tahunan eksklusif Resique/.test(t), 'all 5 privilege titles present')
  ok((await p.locator('#benefit ul > li svg').count()) >= 5, 'privilege blocks carry icons')
  ok(/Peringkat 1/.test(t) && (await p.locator('#klasemen ol li[data-rank="1"] svg').count()) === 1, 'klasemen leader card (rank 1 with trophy)')
  ok((await p.locator('#klasemen ol li[data-rank="2"] div[aria-hidden] > div').count()) === 1, 'klasemen rows carry spend bar')
  const ctaBg = await p.evaluate(() => getComputedStyle(document.getElementById('cek-poin')).backgroundColor)
  ok(ctaBg === 'rgb(14, 82, 73)', `CTA section is a teal block (${ctaBg})`)
  ok((await p.locator('#cek-poin ol li').count()) === 3, 'CTA section lists the 3 steps')
  ok(/Tingkatkan transaksi, dapatkan hadiahnya/.test(t), 'hero tagline')
  ok(/Cek poin-mu/.test(t), 'CTA "Cek poin-mu!"')
  ok((await p.locator('.marquee-track li').count()) >= 2, 'hero marquee has duplicated strip')
  ok((await p.locator('#tier h3:visible').count()) === 6, '6 tier cards visible (mobile ladder / desktop cards)')
  ok(/Mitra Apique Management/.test(t) && /minimal 3%/.test(t), 'Mitra floor 3% note')
  ok((await p.locator('#klasemen ol li').count()) === 10, 'klasemen shows 10 rows')

  // no horizontal scroll at 390
  const sw = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
  ok(sw.sw === sw.cw, `no horizontal scroll (scrollWidth ${sw.sw} = clientWidth ${sw.cw})`)

  // basket bar hidden when empty, shown after add
  ok((await p.locator('[data-basket-bar]').getAttribute('aria-hidden')) === 'true', 'basket bar hidden when cart empty')
  await p.locator('#golden-sale button[aria-label^="Tambah"]').first().click()
  await p.waitForTimeout(400)
  ok((await p.locator('[data-basket-bar]').getAttribute('aria-hidden')) === 'false', 'basket bar visible after add')
  ok(/1 item/.test(await text(p, '[data-basket-bar]')), 'basket bar shows 1 item')
  const tap = await minTapHeight(p, '#golden-sale button, [data-basket-bar] a, [data-basket-bar] button')
  ok(tap >= 44, `tap targets ≥ 44px (min ${tap})`)

  // desktop
  await p.setViewportSize({ width: 1440, height: 900 })
  await p.waitForTimeout(500)
  const heights = await p.evaluate(ids => ids.map(id => document.getElementById(id).getBoundingClientRect().height), ['hero', 'benefit', 'tier'])
  ok(new Set(heights.map(h => Math.round(h / 50))).size >= 2 && heights[0] >= 280, `desktop sections vary in height (no uniform deck) → ${heights.map(Math.round)}`)
  const heroCols = await p.evaluate(() => { const g = document.querySelector('#hero .grid'); return g ? getComputedStyle(g).gridTemplateColumns.split(' ').length : 0 })
  ok(heroCols >= 12, `hero two-column grid on desktop (${heroCols} tracks)`)

  // hover motion (desktop): tier card lifts, klasemen row slides, nav link underline grows, hook button arrow nudges
  const tf = async (sel, pseudo) => await p.evaluate(({ sel, pseudo }) => getComputedStyle(document.querySelector(sel), pseudo || null).transform, { sel, pseudo })
  await p.locator('#tier ol > li').first().hover(); await p.waitForTimeout(350)
  ok((await tf('#tier ol > li')) !== 'none', `tier card transforms on hover (${await tf('#tier ol > li')})`)
  await p.locator('#klasemen ol li[data-rank="2"]').hover(); await p.waitForTimeout(350)
  ok((await tf('#klasemen ol li[data-rank="2"]')) !== 'none', 'klasemen row slides on hover')
  ok((await tf('header nav a', '::after')).startsWith('matrix(0'), 'nav underline hidden at rest (scaleX 0)')
  await p.locator('header nav a').first().hover(); await p.waitForTimeout(350)
  ok(/^matrix\(1/.test(await tf('header nav a', '::after')), 'nav underline grows on hover (scaleX 1)')
  await p.locator('#hook a[href="#golden-sale"]').first().hover(); await p.waitForTimeout(350)
  ok((await tf('#hook a[href="#golden-sale"] svg')) !== 'none' && (await tf('#hook a[href="#golden-sale"]')) !== 'none', 'hook CTA lifts + arrow nudges on hover')
  await p.locator('#hook a[href="#/login"]').hover(); await p.waitForTimeout(350)
  ok(/^matrix\(1/.test(await tf('#hook a[href="#/login"]', '::after')), '"Cek poin-mu!" underline grows on hover')

  ok(errs.length === 0, `no page errors (${errs.length})`)
  await finish(b, errs, 'landing-verify')
})()
