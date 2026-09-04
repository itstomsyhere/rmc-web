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
  ok(/Resique Turun Harga/.test(t), 'hook title "Resique Turun Harga"')
  ok(/Tingkatkan transaksi, dapatkan hadiahnya/.test(t), 'hero tagline')
  ok(/Cek poin-mu/.test(t), 'CTA "Cek poin-mu!"')
  ok((await p.locator('.marquee-track li').count()) >= 2, 'hero marquee has duplicated strip')
  ok((await p.locator('#tier h3').count()) === 6, '6 tier cards')
  ok(/Mitra Apique Management/.test(t) && /Floor 3%/.test(t), 'Mitra floor 3% row')
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
  ok(heights.every(h => h >= 900 * 0.9), `desktop deck sections ≥ 90vh → ${heights.map(Math.round)}`)
  const heroCols = await p.evaluate(() => { const g = document.querySelector('#hero .grid'); return g ? getComputedStyle(g).gridTemplateColumns.split(' ').length : 0 })
  ok(heroCols >= 12, `hero two-column grid on desktop (${heroCols} tracks)`)

  ok(errs.length === 0, `no page errors (${errs.length})`)
  await finish(b, errs, 'landing-verify')
})()
