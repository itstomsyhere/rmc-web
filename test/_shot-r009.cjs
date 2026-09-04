/* Eyeball captures for R.009 (not a gate). */
const { launch, go, resetStores } = require('./_lib.cjs')
;(async () => {
  const { b, p } = await launch({ width: 1440, height: 900 })
  await resetStores(p); await go(p, '/')
  for (const id of ['hook', 'benefit', 'tier', 'cek-poin', 'klasemen']) {
    await p.locator('#' + id).screenshot({ path: `test/_shots/r009-${id}-1440.png` })
  }
  await p.locator('#tier ol > li').nth(3).hover(); await p.waitForTimeout(400)
  await p.locator('#tier').screenshot({ path: 'test/_shots/r009-tier-hover.png' })
  await p.locator('#klasemen ol li[data-rank="3"]').hover(); await p.waitForTimeout(400)
  await p.locator('#klasemen').screenshot({ path: 'test/_shots/r009-klasemen-hover.png' })
  await p.locator('header nav a').nth(1).hover(); await p.waitForTimeout(400)
  await p.locator('header').screenshot({ path: 'test/_shots/r009-nav-hover.png' })
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(400)
  for (const id of ['benefit', 'cek-poin', 'klasemen']) await p.locator('#' + id).screenshot({ path: `test/_shots/r009-${id}-390.png` })
  const sw = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth])
  console.log('390 scrollWidth/clientWidth', sw)
  await b.close()
})()
