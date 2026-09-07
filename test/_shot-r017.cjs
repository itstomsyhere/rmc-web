/* R.017 eyeball captures: header (rest / scrolled / drawer), hero (after deal), each section, footer, at 1440 + 390.
 * BASE=https://rmc-web-beta.vercel.app node test/_shot-r017.cjs → test/_shots/r017-*.png (git-ignored) */
const fs = require('fs')
const path = require('path')
const { launch, go, resetStores } = require('./_lib.cjs')

const out = path.join(__dirname, '_shots')
fs.mkdirSync(out, { recursive: true })
const shot = async (p, name, opts = {}) => { await p.screenshot({ path: path.join(out, `r017-${name}.png`), ...opts }); console.log('shot', name) }
const section = async (p, id, name, w) => {
  await p.evaluate(id => document.getElementById(id).scrollIntoView({ block: 'start' }), id)
  await p.waitForTimeout(1200)
  const box = await p.evaluate(id => { const r = document.getElementById(id).getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top + window.scrollY), width: r.width, height: Math.min(r.height, 2200) } }, id)
  await shot(p, `${name}-${w}`, { clip: { ...box, width: w }, fullPage: true })
}

;(async () => {
  for (const w of [1440, 390]) {
    const { b, p } = await launch({ width: w, height: w === 1440 ? 900 : 844 })
    await resetStores(p)
    await go(p, '/', 1200)
    await shot(p, `header-rest-${w}`, { clip: { x: 0, y: 0, width: w, height: w === 1440 ? 110 : 60 } })
    await p.evaluate(() => window.scrollTo(0, 420)); await p.waitForTimeout(500)
    await shot(p, `header-scrolled-${w}`, { clip: { x: 0, y: 0, width: w, height: 80 } })
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300)
    if (w === 390) {
      await p.locator('button[aria-controls="site-drawer"]').click(); await p.waitForTimeout(700)
      await shot(p, `drawer-${w}`)
      await p.keyboard.press('Escape'); await p.waitForTimeout(400)
    }
    await shot(p, `fold-${w}`)
    for (const [id, name] of [['hook', 'hook'], ['hero', 'hero'], ['benefit', 'benefit'], ['tier', 'tier'], ['cek-poin', 'cekpoin'], ['golden-sale', 'sale'], ['klasemen', 'klasemen']]) await section(p, id, name, w)
    if (w === 1440) {
      await p.locator('#tier ol > li').last().hover(); await p.waitForTimeout(500)
      await section(p, 'tier', 'tier-hover', w)
      await p.locator('#hero .deck').hover(); await p.waitForTimeout(700)
      await section(p, 'hero', 'hero-hover', w)
    }
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(1000)
    const fb = await p.evaluate(() => { const r = document.querySelector('footer').getBoundingClientRect(); return { x: 0, y: r.top + window.scrollY, width: r.width, height: r.height } })
    await shot(p, `footer-${w}`, { clip: { ...fb, width: w }, fullPage: true })
    await b.close()
  }
})()
