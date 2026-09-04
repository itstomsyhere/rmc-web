/* Pure-model gate — runs in the browser page (no TS toolchain in node): phone, similarity, cascade, rmc math. */
const { ok, launch, go, resetStores, finish } = require('./_lib.cjs')

;(async () => {
  const { b, p, errs } = await launch()
  await resetStores(p)
  await go(p, '/')
  const r = await p.evaluate(() => new Promise(res => {
    const iv = setInterval(() => { if (!window.__rmcweb) return; clearInterval(iv); const m = window.__rmcweb.model
      const customers = JSON.parse(localStorage.getItem('rmcweb_crm_v1') || '{"state":{}}').state.customers || m.seedCustomers
      res({
        p1: m.normalizePhone('0812-3345-8891'), p2: m.normalizePhone('+62 812 3345 8891'), p3: m.normalizePhone('8123345889'), p4: m.normalizePhone('021-5551234'), p5: m.normalizePhone('62812'),
        d1: m.dice('Laundry Bunda Palembang', 'Laundry Bunda Palembng'), d2: m.dice('Fresh Laundry Kemang', 'Cuci Kilat Palu'), d3: m.dice('Sparkle Laundry Co', 'sparkle laundry co.'),
        c1: m.matchRegistration({ phone: '081233458891', laundry: 'x', pic: 'y' }, customers).path,
        c2: m.matchRegistration({ phone: '089900001111', laundry: 'Karpet', pic: 'Tono Prabowo', rsl: 'rsl-40018' }, customers),
        c3: m.matchRegistration({ phone: '085200003333', laundry: 'Laundry Bunda Palembng', pic: 'Rina Marlina' }, customers),
        c4: m.matchRegistration({ phone: '087700004444', laundry: 'Laundry Mentari Baru', pic: 'Dina' }, customers).path,
        cardWrongName: m.matchRegistration({ phone: '089900009999', laundry: 'zzz', pic: 'Orang Lain', rsl: 'RSL40018' }, customers).path,
        pw1: m.checkPassword('Abcd1234').ok, pw2: m.checkPassword('Abcd123!').ok, pw3: m.checkPassword('abcd123!').ok, tmp: m.checkPassword(m.genTempPassword()).ok,
        tier: m.tierForSpend(m.tiers, 9000000).key, tier2: m.tierForSpend(m.tiers, 8999999).key, tier3: m.tierForSpend(m.tiers, 130000000).key,
        win: m.currentWindow(new Date('2026-09-04')).half,
      })
    }, 50)
  }))
  ok(r.p1 === '+6281233458891' && r.p2 === '+6281233458891' && r.p3 === '+628123345889', `phone normalization → ${r.p1}`)
  ok(r.p4 === null && r.p5 === null, 'landline / too-short rejected')
  ok(r.d1 >= 0.8, `dice typo ≥ 0.8 (${r.d1.toFixed(2)})`)
  ok(r.d2 < 0.4, `dice unrelated < 0.4 (${r.d2.toFixed(2)})`)
  ok(r.d3 === 1, 'dice ignores case/punct')
  ok(r.c1 === 1, 'cascade path 1 (phone)')
  ok(r.c2.path === 2 && r.c2.backfillPhone === true && r.c2.customer.id === 'C-2026-0015', 'cascade path 2 (card+name, backfill)')
  ok(r.c3.path === 3 && r.c3.link === 'PENDING' && r.c3.customer.id === 'C-2026-0043', `cascade path 3 (fuzzy ${r.c3.score.toFixed(2)})`)
  ok(r.c4 === 4, 'cascade path 4 (lead)')
  ok(r.cardWrongName !== 2, 'card with wrong PIC name does not link (path ' + r.cardWrongName + ')')
  ok(r.pw1 === false && r.pw2 === true && r.pw3 === false && r.tmp === true, 'password policy + temp password')
  ok(r.tier === 'beginner' && r.tier2 === 'starter' && r.tier3 === 'ultimate', 'tier thresholds inclusive')
  ok(r.win === 'H2', 'window H2 for Sep')
  ok(errs.length === 0, `no page errors (${errs.length})`)
  await finish(b, errs, 'model-verify')
})().catch(e => { console.error(e); process.exit(1) })
