/* Admin gate — passcode, copy edit reflects on landing, xlsx export (phone as text), embed mode, claims approve. */
const path = require('node:path')
const fs = require('node:fs')
const XLSX = require('xlsx')
const { ok, launch, go, resetStores, readStore, fill, text, finish } = require('./_lib.cjs')

;(async () => {
  const { b, p, errs } = await launch({ width: 1440, height: 900 })
  await resetStores(p)

  await go(p, '/admin')
  ok(/passcode|kata sandi|Admin/i.test(await text(p)), 'passcode gate shown')
  await fill(p, 'input[type="password"], input[name="passcode"]', 'salah')
  await p.locator('button[type="submit"], button:has-text("Masuk")').first().click(); await p.waitForTimeout(300)
  ok(!(await p.locator('[data-admin-section]').count()), 'wrong passcode keeps gate')
  await fill(p, 'input[type="password"], input[name="passcode"]', 'resique2026')
  await p.locator('button[type="submit"], button:has-text("Masuk")').first().click(); await p.waitForTimeout(500)
  ok((await p.locator('[data-admin-section]').count()) >= 1, 'unlocked → section rendered')
  ok((await p.locator('[data-admin-nav]').count()) >= 10, `nav has ≥10 sections (${await p.locator('[data-admin-nav]').count()})`)

  // edit headline
  await p.locator('[data-admin-nav="konten"]').first().click(); await p.waitForTimeout(300)
  const hook = p.locator('[data-admin-section="konten"] input').first()
  await hook.fill('Resique Diskon Gede')
  await p.locator('[data-admin-section="konten"] button:has-text("Simpan")').first().click(); await p.waitForTimeout(400)
  ok((await readStore(p, 'config')).config.copy.hook === 'Resique Diskon Gede', 'config.copy.hook saved')
  await go(p, '/')
  ok(/Resique Diskon Gede/.test(await text(p, '#hook')), 'landing reflects new headline')

  // export xlsx
  await go(p, '/admin?tab=transaksi')
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 10000 }), p.locator('button:has-text("Export")').first().click()])
  const out = path.join(__dirname, '_export.xlsx')
  await dl.saveAs(out)
  const wb = XLSX.read(fs.readFileSync(out))
  const ws = wb.Sheets[wb.SheetNames[0]]
  const aoa = XLSX.utils.sheet_to_json(ws, { header: 1 })
  ok(/golden-privilege-transaksi-\d{8}\.xlsx/.test(dl.suggestedFilename()), `export filename ${dl.suggestedFilename()}`)
  ok(aoa[0].length === 16 && aoa[0][0] === 'ID Pesanan', `16 header columns (${aoa[0].length})`)
  const hpCell = ws[XLSX.utils.encode_cell({ r: 1, c: 5 })]
  ok(hpCell && hpCell.t === 's' && /^\+62/.test(String(hpCell.v)), `phone column stored as text (${hpCell && hpCell.v})`)
  ok(aoa.length - 1 === (await readStore(p, 'orders')).orders.length, 'row count = orders')
  fs.unlinkSync(out)

  // claims approve
  await go(p, '/')
  await p.evaluate(() => window.__rmcweb.register({ isMitra: false, hasCard: false, laundry: 'Laundry Bunda Palembng', pic: 'Rina Marlina', phone: '085200003333', email: 'rina@test.id', kota: 'Palembang', password: 'Resique#2026' }))
  await go(p, '/admin?tab=klaim')
  ok(/Rina Marlina/.test(await text(p)), 'claim row visible')
  await p.locator('button:has-text("Setujui")').first().click(); await p.waitForTimeout(500)
  const acc = (await readStore(p, 'accounts')).accounts.find(a => a.phone === '+6285200003333')
  ok(acc.link === 'LINKED' && acc.crmCustomerId === 'C-2026-0043', 'approve → account LINKED to candidate')
  const c = (await readStore(p, 'crm')).customers.find(x => x.id === 'C-2026-0043')
  ok(c.hp === '+6285200003333', 'approve backfills phone into CRM customer')

  // embed mode
  await go(p, '/admin?embed=1')
  ok((await p.locator('header[data-site-header]').count()) === 0, 'embed: no site header')
  ok((await p.locator('[data-admin-section]').count()) >= 1, 'embed: admin renders')

  ok(errs.length === 0, `no page errors (${errs.length})`)
  await finish(b, errs, 'admin-verify')
})().catch(e => { console.error(e); process.exit(1) })
