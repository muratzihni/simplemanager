// Ayar -> oyun davranışı uçtan uca testi (Playwright, gerçek tarayıcı).
// Kullanım: node settings_e2e.js <yayın-klasörü(design)> <parça-klasörü(kd*.js)> [kd-id-haritası.json]
// Her ayar için: Ayarlar ekranından değiştir → kaydet → Oyun Merkezi'nde ölç → sayfayı yeniden aç (yeniden başlatma) → ölç → varsayılana dön → ölç.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const [root, chunks, idmap] = [process.argv[2], process.argv[3], process.argv[4]];
const ids = idmap ? JSON.parse(fs.readFileSync(idmap)) : {};
const srv = http.createServer((q, r) => { const p = decodeURIComponent(q.url.split('?')[0]);
  if (p === '/support.js') { r.setHeader('content-type', 'text/javascript'); return r.end(fs.readFileSync(path.join(__dirname, 'support.js'))); }
  if (p.startsWith('/_blob/')) { const f = ids[p.slice(7)]; if (!f) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', 'text/javascript'); return r.end(fs.readFileSync(path.join(chunks, f + '.js'))); }
  const fp = path.join(root, p); if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { r.statusCode = 404; return r.end(); }
  r.setHeader('content-type', p.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'); r.end(fs.readFileSync(fp)); });
const results = [];
srv.listen(0, async () => {
  const port = srv.address().port, base = `http://localhost:${port}/`;
  const b = await chromium.launch({ args: ['--no-sandbox'] }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { try { if (!localStorage.getItem('__seeded')) { localStorage.setItem('__seeded', '1'); localStorage.setItem('td-taslak-v1', JSON.stringify({ managers: [{ ad: 'Test', soyad: 'Menajer' }], kulupler: [{ n: 'Fenerbahçe', c: 'Türkiye', lg: 'Süper Lig' }] })); } } catch (e) {} });
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
  const openGame = async (view) => { await page.goto(base + 'OyunMerkezi.dc.html'); await page.waitForTimeout(3500); if (view) { await page.getByText(view, { exact: true }).first().click(); await page.waitForTimeout(500); } };
  const setIn = async (tab, opt, byText) => { await page.goto(base + 'Ayarlar.dc.html'); await page.waitForTimeout(1200); if (tab) await page.getByRole('button', { name: tab, exact: true }).first().click(); await page.waitForTimeout(200); await (byText ? page.getByText(opt, { exact: true }) : page.getByRole('button', { name: opt, exact: true })).first().click(); await page.waitForTimeout(300); await page.getByText('Kaydet ve Kapat', { exact: true }).first().click(); await page.waitForTimeout(500); };
  const resetAll = async () => { await page.goto(base + 'Ayarlar.dc.html'); await page.waitForTimeout(1000); await page.getByRole('button', { name: 'Varsayılanlara Dön', exact: true }).first().click(); await page.waitForTimeout(300); await page.getByText('Kaydet ve Kapat', { exact: true }).first().click(); await page.waitForTimeout(400); };
  const css = (prop) => page.evaluate(p => getComputedStyle(document.documentElement).getPropertyValue(p).trim(), prop);
  const tests = [
    { key: 'theme', tab: 'Görüntü', opt: 'Açık', view: null, probe: async () => (await css('--td-bg')).toLowerCase(), want: v => v === '#f2f4f9', def: async () => (await css('--td-bg')).toLowerCase() === '#0a0f1c' },
    { key: 'scale', opt: null, view: null, skip: 'kaydırıcı: otomasyon eklenmedi' },
    { key: 'contrast', opt: null, view: null, skip: 'anahtar: otomasyon eklenmedi' },
    { key: 'cur', tab: 'Birimler ve Biçimler', opt: '€ Euro', view: 'Kadro', probe: async () => (await page.locator('body').innerText()).includes('€'), want: v => v === true, def: async () => (await page.locator('body').innerText()).includes('₺') },
    { key: 'date', tab: 'Birimler ve Biçimler', opt: 'YYYY-AA-GG', view: null, probe: async () => /2026-07-01/.test(await page.locator('body').innerText()), want: v => v === true, def: async () => !/2026-07-01/.test(await page.locator('body').innerText()) },
    { key: 'lang', skip: 'dil seçici açılır listesi otomasyonla açılamadı (BLOCKED: test yazılamadı)', byText: true, tab: 'Oyun Tercihleri', opt: 'İngilizce', view: null, probe: async () => /Squad/.test(await page.locator('body').innerText()), want: v => v === true, def: async () => /Kadro/.test(await page.locator('body').innerText()) }
  ];
  for (const t of tests) {
    if (t.skip) { results.push([t.key, 'NOT TESTED', t.skip]); continue; }
    try {
      await resetAll(); await openGame(t.view);
      await setIn(t.tab, t.opt, t.byText); await openGame(t.view); const v1 = await t.probe(); const ok1 = t.want(v1);
      await openGame(t.view); const v2 = await t.probe(); const ok2 = t.want(v2);   // yeniden açılış
      await resetAll(); await openGame(t.view); const ok3 = await t.def();
      results.push([t.key, ok1 && ok2 && ok3 ? 'PASS' : 'FAIL', `uygulandı=${ok1} korundu=${ok2} varsayılana-döndü=${ok3}`]);
    } catch (e) { results.push([t.key, 'FAIL', String(e.message).split('\n')[0]]); }
  }
  console.log(results.map(r => r.join(' | ')).join('\n')); console.log('sayfa hataları:', errs.length);
  fs.writeFileSync(path.join(__dirname, 'last_result.json'), JSON.stringify({ date: new Date().toISOString(), results, pageErrors: errs.length }, null, 1));
  await b.close(); srv.close();
});
