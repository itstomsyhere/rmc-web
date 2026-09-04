/* Registration cascade gate — paths 1..4 + duplicate + password policy + phone normalization. */
const { ok, launch, go, resetStores, readStore, fill, clickText, text, finish } = require('./_lib.cjs')

async function fillBase(p, { laundry, pic, phone, email, kota = 'Jakarta', mitra = 'Tidak', card = 'Tidak', rsl }) {
  await p.locator(`label:has-text("${mitra}")`).first().click()
  const cards = p.locator('[role="radiogroup"]').nth(1)
  await cards.locator(`label:has-text("${card}")`).first().click()
  await fill(p, 'input[name="laundry"]', laundry)
  await fill(p, 'input[name="pic"]', pic)
  await fill(p, 'input[name="phone"]', phone)
  await fill(p, 'input[name="email"]', email)
  await p.locator('button[role="combobox"]').first().click()
  await p.locator(`[role="option"]:has-text("${kota}")`).first().click()
  if (rsl) await fill(p, 'input[name="rsl"]', rsl)
  await p.locator('button[role="checkbox"]').first().click()
}
const submit = async (p) => { await p.locator('button[type="submit"]').first().click(); await p.waitForTimeout(700) }
async function setPassword(p, pw, expectEnabled = true) {
  await p.locator('#pw').fill(pw); await p.locator('#pw2').fill(pw); await p.waitForTimeout(150)
  const btn = p.locator('button[type="submit"]').first()
  const enabled = !(await btn.isDisabled())
  if (expectEnabled && enabled) await submit(p)
  return enabled
}

;(async () => {
  const { b, p, errs } = await launch()
  await resetStores(p)

  // path 1 — phone exact (Fresh Laundry Kemang 0812-3345-8891)
  await go(p, '/register')
  await fillBase(p, { laundry: 'Fresh Laundry', pic: 'Maya', phone: '081233458891', email: 'maya@test.id', card: 'Ya' })
  ok(/\+62812/.test(await text(p)), 'phone normalization preview shows +62812…')
  await submit(p)
  let t = await text(p)
  ok(/terhubung/i.test(t) && /Fresh Laundry Kemang/.test(t), 'path 1 → LINKED to Fresh Laundry Kemang')
  let inbox = await readStore(p, 'inbox')
  ok(inbox && inbox.mails.length === 1 && /Rsq-/.test(inbox.mails[0].body), 'temp password email in mock inbox')
  let acc = await readStore(p, 'accounts')
  ok(acc.accounts[0].link === 'LINKED' && acc.accounts[0].matchPath === 1 && acc.accounts[0].mustChangePassword === true, 'account LINKED, path 1, mustChangePassword')

  // duplicate phone
  await go(p, '/register')
  await fillBase(p, { laundry: 'Xy', pic: 'Yz', phone: '0812 3345 8891', email: 'dup@test.id' })
  await submit(p)
  ok(/sudah terdaftar/i.test(await text(p)), 'duplicate phone rejected with "sudah terdaftar"')

  // path 2 — RSL card + name, CRM customer without phone (Karpet Bersih Bandung RSL40018 Tono Prabowo)
  await go(p, '/register')
  await fillBase(p, { laundry: 'Karpet Bersih', pic: 'Tono Prabowo', phone: '089900001111', email: 'tono@test.id', kota: 'Bandung', card: 'Ya', rsl: 'rsl40018' })
  await submit(p)
  t = await text(p)
  ok(/terhubung/i.test(t) && /Karpet Bersih Bandung/.test(t), 'path 2 → LINKED via card + name')
  ok(/dilengkapi/i.test(t), 'path 2 note: phone backfilled')
  const crm = await readStore(p, 'crm')
  const tono = crm.customers.find(c => c.id === 'C-2026-0015')
  ok(tono.hp === '+6289900001111', `CRM customer phone backfilled → ${tono.hp}`)
  ok(crm.audit.some(a => /dilengkapi/i.test(a.event)), 'audit row for backfill')

  // path 3 — fuzzy (Laundry Bunda Palembang / Rina Marlina, no phone) with a typo
  await go(p, '/register')
  await fillBase(p, { laundry: 'Laundry Bunda Palembng', pic: 'Rina Marlina', phone: '085200003333', email: 'rina@test.id', kota: 'Palembang' })
  await submit(p)
  ok((await p.locator('#pw').count()) === 1 && (await p.locator('#pw2').count()) === 1, 'path 3 asks for a user password')
  ok((await setPassword(p, 'Abcd1234', false)) === false, 'weak password (no symbol) keeps submit disabled')
  await setPassword(p, 'Resique#2026')
  t = await text(p)
  ok(/mirip|verifikasi/i.test(t), 'path 3 → PENDING result screen')
  acc = await readStore(p, 'accounts')
  ok(acc.accounts[0].link === 'PENDING' && acc.accounts[0].matchPath === 3, 'account PENDING path 3')
  ok((await readStore(p, 'crm')).claims.length === 1, 'claim row created')

  // path 4 — lead
  await go(p, '/register')
  await fillBase(p, { laundry: 'Laundry Mentari Baru', pic: 'Dina Kartika', phone: '087700004444', email: 'dina@test.id', kota: 'Jambi' })
  await submit(p)
  await setPassword(p, 'Resique#2026')
  t = await text(p)
  ok(/belum ada|lead|sales/i.test(t), 'path 4 → LEAD result screen')
  const crm2 = await readStore(p, 'crm')
  ok(crm2.leads.length === 1 && crm2.leads[0].source === 'Golden Privilege Web', 'lead created with source Golden Privilege Web')
  acc = await readStore(p, 'accounts')
  ok(acc.accounts[0].link === 'LEAD' && acc.accounts[0].matchPath === 4, 'account LEAD path 4')

  ok(errs.length === 0, `no page errors (${errs.length})`)
  await finish(b, errs, 'register-verify')
})().catch(e => { console.error(e); process.exit(1) })
