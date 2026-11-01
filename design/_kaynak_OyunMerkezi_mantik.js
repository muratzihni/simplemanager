function tdStore(key) { let r = null; try { r = localStorage.getItem(key); } catch (e) {} if (!r) { try { r = (window.top.__tdStore || {})[key] || null; } catch (e) {} } if (!r) { try { r = (window.__tdStore || {})[key] || null; } catch (e) {} } return r; }
function tdLoad(key, def) { try { const r = tdStore(key); return r ? JSON.parse(r) : def; } catch (e) { return def; } }
function tdSave(key, obj) { const raw = JSON.stringify(obj); try { localStorage.setItem(key, raw); } catch (e) {} try { window.top.__tdStore = window.top.__tdStore || {}; window.top.__tdStore[key] = raw; } catch (e) {} try { window.__tdStore = window.__tdStore || {}; window.__tdStore[key] = raw; } catch (e) {} }
function tdRead() { try { return window.__tdReadPrefs ? window.__tdReadPrefs() : {}; } catch (e) { return {}; } }
const DRAFT_KEY = 'td-taslak-v1', GAME_KEY = 'td-oyun-v1';
const EUR = { '₺ TL': ['TRY', 55.93], '€ Euro': ['EUR', 1], '$ Dolar': ['USD', 1.08], '£ Sterlin': ['GBP', 0.85] };
const LOC = { 'İngilizce': 'en-GB', 'Almanca': 'de-DE', 'Fransızca': 'fr-FR', 'İspanyolca': 'es-ES', 'Portekizce': 'pt-PT', 'İtalyanca': 'it-IT', 'Hollandaca': 'nl-NL', 'İsveççe': 'sv-SE', 'Rusça': 'ru-RU', 'Ukraynaca': 'uk-UA', 'Lehçe': 'pl-PL', 'Romence': 'ro-RO', 'Azerice': 'az-AZ', 'Arapça': 'ar', 'Farsça': 'fa-IR', 'Çince': 'zh-CN', 'Japonca': 'ja-JP', 'Korece': 'ko-KR' };
function loc() { return LOC[tdRead().lang] || 'tr-TR'; }
function money(eur) { const set = tdRead(); const cur = EUR[set.cur] || EUR['₺ TL']; try { return new Intl.NumberFormat(loc(), { style: 'currency', currency: cur[0], notation: 'compact', maximumFractionDigits: 1 }).format(eur * cur[1]); } catch (e) { return Math.round(eur * cur[1]).toLocaleString(); } }
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const u01 = (s) => (hash(s) % 100000) / 100000;
function initialsOf(n) { const w = n.replace(/[^\p{L}0-9 ]/gu, ' ').split(' ').filter(x => x.length > 1 && !/^(FC|SC|CF|AC|CD|SK|FK|AS|SV|CA|CS|AFC|SD|UD|JK|BK|IF|IK)$/i.test(x)); const s = w.length >= 2 ? w[0][0] + w[1][0] : (w[0] || n).slice(0, 2); return s.toLocaleUpperCase('tr-TR'); }
function slugOf(s) { return String(s).replace(/ı/g, 'i').replace(/İ/g, 'I').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
function fetchJson(f0, done) {
  const rels = [f0, './' + f0, 'project/' + f0, '/project/' + f0, '../project/' + f0]; let base = ''; try { base = document.baseURI || location.href; } catch (e) {}
  try { rels.unshift(new URL(f0, base).href); } catch (e) {}
  try { performance.getEntriesByType('resource').forEach(en => { const m = String(en.name).match(/^(.*\/)[^\/]*\.dc\.html/); if (m) rels.unshift(m[1] + f0); }); } catch (e) {}
  let r = 0; const next = () => { if (r >= rels.length) return done(null); fetch(rels[r++]).then(res => { if (!res.ok) throw new Error('http'); return res.json(); }).then(d => done(d)).catch(() => next()); }; next();
}
function loadKD(country, done) {
  window.VE_KD = window.VE_KD || {}; let left = 2, ok = true;
  const fin = () => { if (--left === 0) done(ok); };
  if (window.VE_KD[country]) fin(); else fetchJson('kd/' + slugOf(country) + '.json', d => { if (d) window.VE_KD[country] = d; else ok = false; fin(); });
  if (window.VE_TUR) fin(); else fetchJson('kd/_turnuvalar.json', d => { if (d) window.VE_TUR = d; fin(); });
}
const EXP_LABEL = ['Şampiyonluk', 'Üst sıralar', 'Orta sıra', 'Ligde kal'];
const FIN = ['Çok güçlü', 'Güçlü', 'Dengeli', 'Sıkıntılı', 'İflasın eşiğinde'];
const FIN_COLOR = ['var(--td-green,#4FB286)', 'var(--td-green,#4FB286)', 'var(--td-blue,#8FB8FF)', 'var(--td-gold,#F2C14E)', 'var(--td-accent2,#FF6B76)'];
const PAT_LABEL = ['Sabırlı', 'Normal', 'Acımasız'];
const P_EXP = ['Bu sezonun hedefi şampiyonluk. Taraftar ve yönetim kupayı senden bekliyor.', 'Üst sıralarda bitirmek ve kıtasal kupalara katılmak istiyoruz.', 'Ligde orta sıra hedefliyoruz; kadroyu geliştirip sezonu rahat tamamlamak istiyoruz.', 'Önceliğimiz ligde kalmak. İstikrar bizim için her şeyden önemli.'];
const P_FIN = ['Mali durumumuz çok güçlü, transfer ve maaş konusunda elin rahat.', 'Mali durumumuz güçlü; akıllı harcamalarla kadroyu güçlendirebilirsin.', 'Mali durumumuz dengeli; bütçeye dikkat ederek ilerlemeni istiyoruz.', 'Mali durumumuz sıkıntılı; harcamalarda çok dikkatli olmalısın.', 'Kulüp iflasın eşiğinde; harcama sınırlarımız çok dar, her kuruşu düşünmelisin.'];
const P_PAT = ['Sana zaman vermeye hazırız; projeye inanıyoruz.', 'Sonuçları yakından izleyeceğiz; birlikte ilerleyeceğiz.', 'Sabrımız kısa; kötü gidişatta hızlı karar alırız.'];
const P_PRESS = ['Basın takımını şampiyonluk adayı olarak görüyor.', 'Basın takımını üst sıraların ciddi bir adayı olarak görüyor.', 'Basın takımından sezonda orta sıralarda bir yer bekliyor.', 'Basın takımının ligde kalma mücadelesi vereceğini düşünüyor.'];
const START = '2026-07-01', FIRST_MATCH = '2026-08-15';
const MAX_DAYS = 400;
const POS_ORDER = { 'Kaleci': 0, 'Stoper': 1, 'Sağ bek': 2, 'Sol bek': 3, 'Ön libero': 4, 'Merkez orta saha': 5, 'Ofansif orta saha': 6, 'Sağ kanat': 7, 'Sol kanat': 8, 'Santrfor': 9 };
const SAMPLE = { n: 'Galatasaray', c: 'Türkiye', lg: 'Süper Lig', s: { rep: 16, exp: 0, pat: 1, fin: 1, tr: 24000000, wg: 4200000, stad: 'Rams Park', cap: 52652, city: 'İstanbul', f1: 16, f2: 15, f3: 15 } };
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const diffDays = (a, b) => Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000);
const fmtDate = (iso) => { try { return new Date(iso + 'T12:00:00Z').toLocaleDateString(loc(), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); } catch (e) { return iso; } };
const fmtShort = (iso) => { try { return new Date(iso + 'T12:00:00Z').toLocaleDateString(loc(), { day: 'numeric', month: 'short', timeZone: 'UTC' }); } catch (e) { return iso; } };
function roundRobin(teams) {
  const t = teams.slice().sort((a, b) => hash('rr|' + a) - hash('rr|' + b)); if (t.length % 2) t.push(null); const n = t.length; const rounds = [];
  for (let r = 0; r < n - 1; r++) { const rd = []; for (let i = 0; i < n / 2; i++) { const a = t[i], b = t[n - 1 - i]; if (a && b) rd.push(r % 2 ? [b, a] : [a, b]); } rounds.push(rd); t.splice(1, 0, t.pop()); }
  return rounds.concat(rounds.map(rd => rd.map(([h, a]) => [a, h])));
}
function poisson(lam, u) { let k = 0, p = Math.exp(-lam), s = p; while (u > s && k < 10) { k++; p *= lam / k; s += p; } return k; }
const powCol = v => v >= 15 ? 'var(--td-green,#4FB286)' : v >= 11 ? 'var(--td-blue,#8FB8FF)' : v >= 7 ? 'var(--td-gold,#F2C14E)' : 'var(--td-accent2,#FF6B76)';
class Component extends DCLogic {
  constructor(props) {
    super(props);
    const dr = tdLoad(DRAFT_KEY, null) || {};
    const picks = Array.isArray(dr.kulupler) ? dr.kulupler.filter(Boolean) : []; const dm = Array.isArray(dr.managers) ? dr.managers : [];
    this.sample = picks.length === 0;
    this.items = this.sample ? [{ name: 'Menajer', pick: SAMPLE }] : picks.map((p, i) => { const a = dm[i] || {}; const nm = ((a.ad || '') + ' ' + (a.soyad || '')).trim() || ('Menajer ' + (i + 1)); return { name: nm, first: (a.ad || '').trim() || nm, pick: p }; });
    this.game = tdLoad(GAME_KEY, null) || {}; this.game.k = this.game.k || {};
    this.state = { mi: 0, view: 'pano', msg: 0, tick: 0, loaded: false, tq: '', tsel: -1 };
    this.loadFor(0);
  }
  key() { const p = this.items[this.state.mi].pick; return p.n + '|' + p.c; }
  gs() { const k = this.key(); if (!this.game.k[k] || this.game.k[k].lg !== this.items[this.state.mi].pick.lg) this.game.k[k] = { lg: this.items[this.state.mi].pick.lg, date: START, sim: {}, res: {}, read: {} }; return this.game.k[k]; }
  loadFor(mi) { this.setState({ loaded: false }); const p = this.items[mi].pick; loadKD(p.c, ok => { this.setState({ loaded: true, kdOk: ok, tick: this.state.tick + 1 }); }); }
  save() { tdSave(GAME_KEY, this.game); }
  model() {
    const st = this.state; const it = this.items[st.mi]; const p = it.pick; const kd = (window.VE_KD && window.VE_KD[p.c]) || null;
    const squad = (kd && kd.clubs[p.n]) ? kd.clubs[p.n].slice() : [];
    const league = (kd && kd.ligs[p.lg]) ? kd.ligs[p.lg].slice() : []; if (league.length && league.indexOf(p.n) < 0) league.push(p.n);
    const strength = (name) => { const a = kd && kd.clubs[name]; if (!a || !a.length) return 7; const t = a.slice().sort((x, y) => y[5] - x[5]).slice(0, 11); return t.reduce((s, x) => s + x[5], 0) / t.length; };
    const rounds = league.length >= 2 ? roundRobin(league) : [];
    const dates = rounds.map((_, i) => addDays(FIRST_MATCH, i * 7));
    return { st, it, p, kd, squad, league, strength, rounds, dates };
  }
  simRound(M, G, r) {
    if (G.sim[r]) return; G.sim[r] = 1;
    M.rounds[r].forEach(([h, a]) => {
      const dif = M.strength(h) - M.strength(a); const lh = Math.max(0.2, 1.4 + 0.18 * dif + 0.25), la = Math.max(0.2, 1.1 - 0.18 * dif);
      G.res[r + '|' + h + '|' + a] = [poisson(lh, u01('g|' + r + h + a + 'h')), poisson(la, u01('g|' + r + h + a + 'a'))];
    });
  }
  myRound(M, from) { for (let i = from; i < M.rounds.length; i++) if (M.rounds[i].some(([h, a]) => h === M.p.n || a === M.p.n)) return i; return -1; }
  advance(days, untilMatch) {
    const M = this.model(); const G = this.gs(); let guard = 0;
    while (guard++ < MAX_DAYS) {
      const my = this.nextMyRound(M, G);
      const matchToday = my >= 0 && M.dates[my] === G.date;
      if (matchToday && !G.sim[my]) break;
      G.date = addDays(G.date, 1);
      M.dates.forEach((d, i) => { if (d < G.date && !G.sim[i]) { const mine = M.rounds[i].some(([h, a]) => h === M.p.n || a === M.p.n); if (!mine || G.sim[i] === undefined) this.simRound(M, G, i); } });
      if (!untilMatch && --days <= 0) break;
      const nm = this.nextMyRound(M, G); if (untilMatch && nm >= 0 && M.dates[nm] === G.date) break;
    }
    this.save(); this.setState({ tick: this.state.tick + 1 });
  }
  nextMyRound(M, G) { for (let i = 0; i < M.rounds.length; i++) { if (G.sim[i]) continue; if (M.rounds[i].some(([h, a]) => h === M.p.n || a === M.p.n)) return i; } return -1; }
  renderVals() {
    const M = this.model(); const G = this.gs(); const { st, it, p, squad, league, rounds, dates } = M; const s = p.s; const has = s !== undefined;
    const my = this.nextMyRound(M, G); const matchDay = my >= 0 && dates[my] === G.date && !G.sim[my];
    const hue = hash(p.n) % 360;
    const ages = squad.map(x => 2026 - x[1]); const top11 = squad.slice().sort((a, b) => b[5] - a[5]).slice(0, 11); const avg11 = top11.length ? top11.reduce((a, x) => a + x[5], 0) / top11.length : 0;
    const lineAvg = (names) => { const a = squad.filter(x => names.indexOf(x[3]) >= 0).sort((x, y) => y[5] - x[5]); const t = a.slice(0, names.length === 1 ? 1 : names[0] === 'Stoper' ? 4 : 3); return t.length ? t.reduce((q, x) => q + x[5], 0) / t.length : 0; };
    const lines = [['Kalecilik', lineAvg(['Kaleci'])], ['Defans', lineAvg(['Stoper', 'Sağ bek', 'Sol bek'])], ['Orta saha', lineAvg(['Ön libero', 'Merkez orta saha', 'Ofansif orta saha'])], ['Hücum', lineAvg(['Sağ kanat', 'Sol kanat', 'Santrfor'])]].filter(x => x[1] > 0);
    const weakest = lines.length ? lines.slice().sort((a, b) => a[1] - b[1])[0] : null;
    const best = squad.length ? squad.slice().sort((a, b) => b[5] - a[5])[0] : null;
    const mk = (id, date, from, subject, paras, facts) => ({ id, date, from, subject, paras: (paras || []).map(t => ({ t })), facts: facts || [], hasFacts: !!(facts && facts.length) });
    const msgs = [];
    const myFix = rounds.map((rd, i) => { const m = rd.find(([h, a]) => h === p.n || a === p.n); return m ? { i, h: m[0], a: m[1], date: dates[i] } : null; }).filter(Boolean);
    msgs.push(mk('m1', START, 'Yönetim Kurulu Başkanı', 'Hoş geldin', has ? [P_EXP[s.exp], P_FIN[s.fin], P_PAT[s.pat]] : ['Seni teknik direktörümüz olarak aramızda görmekten büyük mutluluk duyuyoruz.'], []));
    if (squad.length) msgs.push(mk('m2', START, 'Yardımcı Antrenör', 'Kadro değerlendirmesi', [], [
      { k: 'KADRO BÜYÜKLÜĞÜ', v: String(squad.length), c: 'var(--td-text,#F4F6FB)' }, { k: 'YAŞ ORTALAMASI', v: (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1), c: 'var(--td-text,#F4F6FB)' },
      { k: 'EN İYİ 11 GÜÇ ORTALAMASI', v: avg11.toFixed(1), c: powCol(avg11) }, { k: 'EN GÜÇLÜ OYUNCU', v: best ? best[0] + ' · ' + best[5] : '—', c: 'var(--td-text,#F4F6FB)' },
      { k: 'EN ZAYIF BÖLGE', v: weakest ? weakest[0] + ' · ' + weakest[1].toFixed(1) : '—', c: 'var(--td-gold,#F2C14E)' }]));
    if (has) msgs.push(mk('m3', START, 'Mali Müdür', 'Bütçe özeti', [], [{ k: 'MALİ DURUM', v: FIN[s.fin], c: FIN_COLOR[s.fin] }, { k: 'TRANSFER BÜTÇESİ', v: money(s.tr), c: 'var(--td-text,#F4F6FB)' }, { k: 'MAAŞ BÜTÇESİ', v: money(s.wg) + ' / ay', c: 'var(--td-text,#F4F6FB)' }]));
    if (myFix.length) msgs.push(mk('m4', '2026-07-10', 'Lig Organizasyonu', 'Fikstür açıklandı', [], [{ k: 'İLK MAÇ', v: fmtDate(myFix[0].date), c: 'var(--td-text,#F4F6FB)' }, { k: 'RAKİP', v: myFix[0].h === p.n ? myFix[0].a : myFix[0].h, c: 'var(--td-text,#F4F6FB)' }, { k: 'TOPLAM MAÇ', v: String(myFix.length), c: 'var(--td-text,#F4F6FB)' }]));
    msgs.push(mk('m5', '2026-07-20', 'Yardımcı Antrenör', 'Sezon öncesi hazırlık', ['Sezon öncesi hazırlık dönemi başladı. Oyuncuların kondisyonunu ve takım uyumunu artırmak için antrenman programını gözden geçirmeni öneririm.'], []));
    if (has) msgs.push(mk('m6', '2026-08-10', 'Basın', 'Sezon beklentisi', [P_PRESS[s.exp]], []));
    const vis = msgs.filter(m => m.date <= G.date).sort((a, b) => b.date < a.date ? -1 : b.date > a.date ? 1 : 0);
    const mi = Math.max(0, Math.min(st.msg, vis.length - 1)); const cur = vis[mi];
    const unread = vis.filter(m => !G.read[m.id]).length;
    const nav = [['pano', 'Pano', ''], ['inbox', 'Gelen Kutusu', unread ? String(unread) : ''], ['kadro', 'Kadro', ''], ['fikstur', 'Fikstür', ''], ['tablo', 'Tablo', ''], ['finans', 'Finans', ''], ['kulup', 'Kulüp', ''], ['lig', 'Lig', ''], ['ulke', 'Ülke', ''], ['turn', 'Turnuvalar', ''], ['taktik', 'Taktik', 'Yakında'], ['antrenman', 'Antrenman', 'Yakında'], ['transfer', 'Transfer', 'Yakında']].map(n => { const on = st.view === n[0]; const dis = n[2] === 'Yakında'; return { label: n[1], badge: n[2], pressed: on ? 'true' : 'false', dis: dis ? 'true' : 'false', bar: on ? 'var(--td-accent,#C8102E)' : 'transparent', bg: on ? 'rgba(var(--td-accent-rgb,200,16,46),0.14)' : 'transparent', fg: dis ? 'var(--td-mut2,#8C96B2)' : 'var(--td-text,#F4F6FB)', cur: dis ? 'not-allowed' : 'pointer', pick: () => { if (!dis) this.setState({ view: n[0] }); } }; });
    const vlist = { pano: 1, inbox: 1, kadro: 1, fikstur: 1, tablo: 1, finans: 1, kulup: 1, lig: 1, ulke: 1, turn: 1 };
    const msgRows = vis.map((m, i) => ({ from: m.from, date: fmtShort(m.date), subject: m.subject, weight: G.read[m.id] ? '500' : '800', pressed: i === mi ? 'true' : 'false', bar: !G.read[m.id] ? 'var(--td-accent,#C8102E)' : 'transparent', bg: i === mi ? 'rgba(var(--td-fg-rgb,255,255,255),0.06)' : 'transparent', pick: () => { G.read[m.id] = 1; this.save(); this.setState({ msg: i }); } }));
    if (cur && !G.read[cur.id] && st.view === 'inbox') { G.read[cur.id] = 1; this.save(); }
    const sorted = squad.slice().sort((a, b) => (POS_ORDER[a[3]] - POS_ORDER[b[3]]) || (b[5] - a[5]));
    const squadRows = sorted.map(x => ({ no: x[9] || '', name: x[0], pos: x[3], age: 2026 - x[1], nat: x[2], pow: x[5], pot: x[6], col: powCol(x[5]), val: x[7] ? money(x[7]) : '—', end: x[8] || '—' }));
    const fixtures = myFix.map((f, i) => { const done = !!G.sim[f.i]; const r = G.res[f.i + '|' + f.h + '|' + f.a]; const mine = f.h === p.n ? 0 : 1; let res = '', col = 'var(--td-text3,#C9D0E2)'; if (done && r) { res = r[0] + ' – ' + r[1]; const d = mine === 0 ? r[0] - r[1] : r[1] - r[0]; col = d > 0 ? 'var(--td-green,#4FB286)' : d < 0 ? 'var(--td-accent2,#FF6B76)' : 'var(--td-gold,#F2C14E)'; } return { n: i + 1, date: fmtDate(f.date), home: f.h, away: f.a, res, col, bg: f.i === my ? 'rgba(var(--td-accent-rgb,200,16,46),0.10)' : 'transparent' }; });
    const tb = {}; league.forEach(n => { tb[n] = { n, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }; });
    Object.keys(G.res).forEach(k => { const [r, h, a] = k.split('|'); const [x, y] = G.res[k]; if (!tb[h] || !tb[a]) return; tb[h].p++; tb[a].p++; tb[h].gf += x; tb[h].ga += y; tb[a].gf += y; tb[a].ga += x; if (x > y) { tb[h].w++; tb[a].l++; } else if (x < y) { tb[a].w++; tb[h].l++; } else { tb[h].d++; tb[a].d++; } });
    const table = Object.values(tb).map(t => Object.assign(t, { pts: t.w * 3 + t.d, gd: t.gf - t.ga })).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.n.localeCompare(b.n)).map((t, i) => ({ pos: i + 1, name: t.n, w: t.n === p.n ? '800' : '500', bg: t.n === p.n ? 'rgba(var(--td-accent-rgb,200,16,46),0.12)' : 'transparent', p: t.p, w2: t.w, d: t.d, l: t.l, gf: t.gf, ga: t.ga, gd: (t.gd > 0 ? '+' : '') + t.gd, pts: t.pts }));
    const myPos = table.findIndex(r => r.name === p.n) + 1;
    const nx = my >= 0 ? { opp: rounds[my].find(([h, a]) => h === p.n || a === p.n).filter(x => x !== p.n)[0], home: rounds[my].find(([h]) => h === p.n) ? true : false, date: dates[my] } : null;
    const finRows = has ? [{ label: 'MALİ DURUM', value: FIN[s.fin], color: FIN_COLOR[s.fin] }, { label: 'TRANSFER BÜTÇESİ', value: money(s.tr), color: 'var(--td-text,#F4F6FB)' }, { label: 'MAAŞ BÜTÇESİ', value: money(s.wg) + ' / ay', color: 'var(--td-text,#F4F6FB)' }, { label: 'YÖNETİMİN SABRI', value: PAT_LABEL[s.pat], color: 'var(--td-text,#F4F6FB)' }] : [];
    const tabs = this.items.map((x, i) => { const on = i === st.mi; return { name: x.name, pressed: on ? 'true' : 'false', border: on ? 'var(--td-accent,#C8102E)' : 'rgba(var(--td-fg-rgb,255,255,255),0.14)', bg: on ? 'rgba(var(--td-accent-rgb,200,16,46),0.14)' : 'transparent', pick: () => { this.setState({ mi: i, msg: 0, view: 'inbox' }); this.loadFor(i); } }; });
    const out = {
      crestBg: 'hsl(' + hue + ' 52% 34%)', crestText: initialsOf(p.n), clubName: p.n, 
      tabs, hasTabs: this.items.length > 1, dateText: fmtDate(G.date), matchDay, notMatchDay: !matchDay,
      simMatch: () => { this.simRound(M, G, my); G.date = addDays(G.date, 1); M.dates.forEach((d, i) => { if (d < G.date && !G.sim[i]) this.simRound(M, G, i); }); this.save(); this.setState({ view: 'fikstur', tick: st.tick + 1 }); },
      nextDay: () => this.advance(1, false), toMatch: () => this.advance(0, true),
      nav, noData: st.loaded && !squad.length, vInbox: st.view === 'inbox', vKadro: st.view === 'kadro', vFikstur: st.view === 'fikstur', vTablo: st.view === 'tablo', vFinans: st.view === 'finans',
      msgs: msgRows, hasMsg: !!cur, cur: cur || { from: '', subject: '', paras: [], facts: [], hasFacts: false },
      squad: squadRows, noSquad: !squadRows.length, fixtures, noFix: !fixtures.length, table, fin: finRows, noFin: !has,
      hasNext: !!nx, noNext: !nx, next: nx ? { opp: nx.opp, where: nx.home ? 'Ev sahibi' : 'Deplasman', date: fmtDate(nx.date), days: diffDays(G.date, nx.date) <= 0 ? 'Bugün' : diffDays(G.date, nx.date) + ' gün sonra' } : { opp: '', where: '', date: '', days: '' },
      summary: [{ k: 'Takım gücü (en iyi 11)', v: avg11 ? avg11.toFixed(1) : '—' }, { k: 'Lig sırası', v: myPos && league.length ? myPos + ' / ' + league.length : '—' }, { k: 'Kadro', v: squad.length ? String(squad.length) : '—' }, { k: 'Sezon hedefi', v: has ? EXP_LABEL[s.exp] : '—' }]
    };
    return Object.assign(out, this.extra(M, G, { squad, table, myFix, avg11, lines, best, ages, has, s, my, myPos, league, rounds, dates }));
  }
  extra(M, G, c) {
    const st = this.state, p = M.p, kd = M.kd, v = st.view; const info = (kd && kd.info && kd.info[p.n]) || {}; const ulk = (kd && kd.ulke) || {}; const tur = window.VE_TUR || [];
    const s = c.s, has = c.has; const squad = c.squad;
    const N = (x) => (x === undefined || x === null || x === '') ? null : x;
    const row = (k, val) => N(val) === null ? null : { k, v: String(val) };
    const rowsOf = (arr) => arr.filter(Boolean);
    const bar = (label, val, max, color) => N(val) === null ? null : { label, val: String(val), pct: Math.max(3, Math.min(100, val / max * 100)) + '%', color: color || powCol(val * 20 / max) };
    const it = (a, b, cc, o) => Object.assign({ a: String(a), b: String(b), c: cc === undefined ? '' : String(cc), w: '500', bg: 'transparent', cur: 'default', pick: () => {} }, o || {});
    const card = (title, o) => Object.assign({ title, chips: [], rows: [], bars: [], items: [], note: '', span: 'auto' }, o || {});
    const out = { cols: 3, hasKpis: false, kpis: [], cards: [], vCards: v === 'pano' || v === 'kulup' || v === 'lig' || v === 'ulke', vTurn: v === 'turn', tq: st.tq || '', setTq: (e) => this.setState({ tq: e.target.value }), tList: [], tTitle: '', tCards: [],
      goKulup: () => this.setState({ view: 'kulup' }), goLig: () => this.setState({ view: 'lig' }), goUlke: () => this.setState({ view: 'ulke' }), ligName: p.lg || '—', ulkeName: p.c || '—', mgrName: this.items[st.mi].name };
    const neutral = 'rgba(var(--td-fg-rgb,255,255,255),0.08)', fg = 'var(--td-text,#F4F6FB)';
    const lineBars = c.lines.map(l => bar(l[0], l[1].toFixed(1), 20, powCol(l[1])));
    const lgRec = tur.find(t => t.ad === p.lg && t.ulke === p.c) || null;
    const lgIdx = lgRec ? tur.indexOf(lgRec) : -1;
    const openT = (idx) => () => this.setState({ view: 'turn', tsel: idx });
    const winners = (txt, max) => String(txt || '').split('\n').filter(Boolean).slice(0, max || 40).map(l => { const q = l.split(' · '); return it(q[0] || '', q[1] || '', q[2] || ''); });
    const fmtMoney = (x, pb) => (pb === '₺' || !pb) ? money(x / 55.93) : Number(x).toLocaleString() + ' ' + pb;
    if (v === 'pano') {
      out.hasKpis = true;
      const strengths = c.league.map(n => [n, M.strength(n)]).sort((a, b) => b[1] - a[1]); const rs = strengths.findIndex(x => x[0] === p.n) + 1;
      const total = squad.reduce((a, x) => a + (x[7] || 0), 0); const avgAge = c.ages.length ? c.ages.reduce((a, b) => a + b, 0) / c.ages.length : 0;
      const myRow = c.table.find(r => r.name === p.n);
      out.kpis = [
        { label: 'TAKIM GÜCÜ', value: c.avg11 ? c.avg11.toFixed(1) : '—', color: powCol(c.avg11), sub: 'en iyi 11 ortalaması' },
        { label: 'GÜÇ SIRASI', value: rs ? rs + ' / ' + c.league.length : '—', color: fg, sub: 'ligdeki takımlar arasında' },
        { label: 'LİG SIRASI', value: myRow && myRow.p ? c.myPos + ' / ' + c.league.length : '—', color: fg, sub: myRow ? myRow.pts + ' puan' : '' },
        { label: 'KADRO DEĞERİ', value: total ? money(total) : '—', color: fg, sub: squad.length + ' oyuncu' },
        { label: 'YAŞ ORTALAMASI', value: avgAge ? avgAge.toFixed(1) : '—', color: fg, sub: 'kadro' },
        { label: 'SEZON HEDEFİ', value: has ? EXP_LABEL[s.exp] : '—', color: fg, sub: 'yönetim beklentisi' }];
      const played = c.myFix.filter(f => G.sim[f.i] && G.res[f.i + '|' + f.h + '|' + f.a]).slice(-5);
      const chips = played.map(f => { const r = G.res[f.i + '|' + f.h + '|' + f.a]; const d = f.h === p.n ? r[0] - r[1] : r[1] - r[0]; return { t: d > 0 ? 'G' : d < 0 ? 'M' : 'B', bg: d > 0 ? 'rgba(79,178,134,0.25)' : d < 0 ? 'rgba(255,107,118,0.25)' : 'rgba(242,193,78,0.25)', fg }; });
      const upcoming = c.myFix.filter(f => !G.sim[f.i]).slice(0, 5).map(f => it(fmtShort(f.date), f.h === p.n ? f.a : f.h, f.h === p.n ? 'Ev' : 'Dep'));
      const near = (() => { const i = Math.max(0, Math.min(c.table.length - 7, c.myPos - 4)); return c.table.slice(i, i + 7).map(r => it(r.pos, r.name, r.pts + ' P', { w: r.name === p.n ? '800' : '500', bg: r.name === p.n ? 'rgba(var(--td-accent-rgb,200,16,46),0.14)' : 'transparent' })); })();
      const top = squad.slice().sort((a, b) => b[5] - a[5]).slice(0, 8).map(x => it(x[5], x[0], x[3]));
      const bk = [['≤20', 0, 20], ['21–23', 21, 23], ['24–26', 24, 26], ['27–29', 27, 29], ['30–32', 30, 32], ['33+', 33, 99]].map(b => ({ l: b[0], n: c.ages.filter(a => a >= b[1] && a <= b[2]).length })); const mx = Math.max(1, ...bk.map(b => b.n));
      const nat = {}; squad.forEach(x => { nat[x[2]] = (nat[x[2]] || 0) + 1; }); const home = nat[p.c] || 0; const natTop = Object.keys(nat).sort((a, b) => nat[b] - nat[a]).slice(0, 5);
      const ends = squad.filter(x => x[8]).sort((a, b) => a[8] - b[8]).slice(0, 6).map(x => it(x[8], x[0], x[5]));
      const trophies = [['ku_lig', 'Lig şampiyonluğu'], ['ku_kupa', 'Ulusal kupa'], ['ku_superkupa', 'Süper kupa'], ['ku_kitasal', 'Kıtasal kupa'], ['ku_dunya', 'Dünya kulüpler kupası']].filter(x => info[x[0]]).map(x => ({ t: x[1] + ' · ' + info[x[0]], bg: 'rgba(var(--td-accent-rgb,200,16,46),0.16)', fg }));
      out.cards = [
        card('FORM VE SIRADAKİ MAÇLAR', { chips, items: upcoming, note: chips.length ? '' : 'Henüz maç oynanmadı.' }),
        card('HATLARA GÖRE GÜÇ', { bars: lineBars.filter(Boolean) }),
        card('LİG TABLOSU', { items: near }),
        card('EN İYİ OYUNCULAR', { items: top }),
        card('YAŞ DAĞILIMI', { bars: bk.map(b => ({ label: b.l, val: String(b.n), pct: Math.max(3, b.n / mx * 100) + '%', color: 'var(--td-blue,#8FB8FF)' })) }),
        card('UYRUK DAĞILIMI', { rows: [{ k: 'Yerli', v: home + ' (' + Math.round(home / Math.max(1, squad.length) * 100) + '%)' }, { k: 'Yabancı', v: (squad.length - home) + ' (' + Math.round((squad.length - home) / Math.max(1, squad.length) * 100) + '%)' }], bars: natTop.map(n => ({ label: n, val: String(nat[n]), pct: Math.max(3, nat[n] / squad.length * 100) + '%', color: 'var(--td-gold,#F2C14E)' })) }),
        card('SÖZLEŞMELER', { items: ends, note: ends.length ? 'Yıl · oyuncu · güç' : '' }),
        card('BÜTÇE VE TESİSLER', { rows: has ? [{ k: 'Transfer bütçesi', v: money(s.tr) }, { k: 'Maaş bütçesi', v: money(s.wg) + ' / ay' }, { k: 'Mali durum', v: FIN[s.fin] }] : [], bars: has ? [bar('Antrenman tesisi', s.f1, 20), bar('Altyapı', s.f2, 20), bar('Gözlemci ağı', s.f3, 20)].filter(Boolean) : [] }),
        card('KUPA VİTRİNİ', { chips: trophies, note: trophies.length ? '' : 'Kupa verisi yok.' }),
        card('YÖNETİM BEKLENTİSİ', { rows: rowsOf([has ? row('Sezon hedefi', EXP_LABEL[s.exp]) : null, row('Ulusal kupa hedefi', info.hd_kupa), row('Kıtasal hedef', info.hd_kitasal), has ? row('Yönetimin sabrı', PAT_LABEL[s.pat]) : null, row('Mali hedef', info.hd_mali), row('Transfer politikası', info.hd_transfer)]) })
      ];
    } else if (v === 'kulup') {
      out.cols = 2;
      const colors = [info.e_ana, info.e_ikinci].filter(Boolean).map(x => ({ t: x, bg: x, fg: '#FFFFFF' }));
      const keys = [['ku_lig', 'Lig şampiyonluğu'], ['ku_kupa', 'Ulusal kupa'], ['ku_superkupa', 'Süper kupa'], ['ku_kitasal', 'Kıtasal kupa'], ['ku_dunya', 'Dünya kulüpler kupası']];
      out.cards = [
        card('KİMLİK', { chips: colors, rows: rowsOf([row('Kuruluş', info.kurulus), row('Şehir', info.sehir), row('Stadyum', info.stadyum), row('Kapasite', info.kapasite ? Number(info.kapasite).toLocaleString() : null), row('Ortalama seyirci', info.tf_ortSeyirci ? Number(info.tf_ortSeyirci).toLocaleString() : null), row('Ezeli rakip', info.rakip), row('İtibar', info.itibar ? info.itibar + ' / 20' : null), row('Mali durum', info.maliDurum)]) }),
        card('KUPALAR', { rows: keys.filter(k => info[k[0]]).map(k => ({ k: k[1], v: String(info[k[0]]) })).concat(String(info.kupaGecmisi || '').split('\n').filter(Boolean).map(l => { const q = l.split(' · '); return { k: q[0], v: q.slice(1).join(' · ') }; })) }),
        card('REKORLAR', { rows: rowsOf([row('En büyük galibiyet', info.rkGalibiyet), row('En ağır yenilgi', info.rkYenilgi), row('En çok maç', info.rkMacOyuncu), row('En çok gol', info.rkGolOyuncu), row('Sezonda en çok gol', info.rkSezonGol), row('Sezonda en çok puan', info.rkSezonPuan), row('Rekor seyirci', info.rkSeyirci ? Number(info.rkSeyirci).toLocaleString() : null), row('Rekor transfer (alınan)', info.rkTransferAlinan), row('Rekor transfer (satılan)', info.rkTransferSatilan), row('En uzun yenilmezlik', info.rkYenilmez), row('En uzun galibiyet serisi', info.rkSeri)]) }),
        card('TARAFTAR', { rows: rowsOf([row('Taraftar sayısı (milyon)', info.tf_sayi), row('Organize gruplar', info.tf_ultra), row('Kimlik', info.tf_kimlik), row('Sosyal medya (milyon)', info.tf_sosyal)]), bars: [bar('Tribün atmosferi', info.tf_atmosfer, 20), bar('Sadakat', info.tf_sadakat, 20), bar('Yönetime baskı', info.tf_baski, 20), bar('Genç taraftar', info.tf_genc, 20), bar('Deplasman desteği', info.tf_deplasman, 20)].filter(Boolean) }),
        card('TAKTİKSEL ÖZELLİKLER', { rows: rowsOf([row('Diziliş', info.tk_dizilis), row('Oyun stili', info.tk_stil), row('Hücum yönü', info.tk_hucum), row('Felsefe', info.tk_felsefe)]), bars: [bar('Tempo', info.tk_tempo, 20), bar('Pres', info.tk_pres, 20), bar('Savunma hattı', info.tk_cizgi, 20), bar('Genişlik', info.tk_genislik, 20), bar('Set parçası', info.tk_setparca, 20)].filter(Boolean) }),
        card('KULÜP HEDEFLERİ', { rows: rowsOf([row('Lig hedefi', info.hd_ana), row('Ulusal kupa hedefi', info.hd_kupa), row('Kıtasal hedef', info.hd_kitasal), row('Mali hedef', info.hd_mali), row('Transfer politikası', info.hd_transfer), row('Hedef puan', info.hd_puan), row('Yönetim sabrı (sezon)', info.hd_sabir), row('Uzun vadeli plan', info.hd_plan)]) }),
        card('AKADEMİ', { rows: rowsOf([row('Ad', info.ak_ad), row('Kuruluş', info.ak_kurulus), row('Sporcu sayısı', info.ak_sporcu), row('Yaş grupları', info.ak_yaslar), row('Okul / eğitim', info.ak_okul), row('Öne çıkan yetişenler', info.ak_mezun)]), bars: [bar('Öğretim kalitesi', info.ak_kalite, 20), bar('Antrenör kadrosu', info.ak_antrenor, 20), bar('Tesis kalitesi', info.ak_tesis, 20)].filter(Boolean) }),
        card('KITASAL KUPA PUANLARI', { rows: rowsOf([row('5 sezon toplamı', info.ksToplam), row('En iyi derece', info.ksEnIyi), row('Son 10 yılda katılım', info.ksKatilim)]), bars: ['2025/26', '2024/25', '2023/24', '2022/23', '2021/22'].map((z, i) => bar(z, info['ks_' + i], 30, 'var(--td-blue,#8FB8FF)')).filter(Boolean) })
      ].filter(cd => cd.rows.length || cd.bars.length || cd.items.length || cd.chips.length);
      if (!out.cards.length) out.cards = [card('KULÜP', { note: 'Bu kulüp için ayrıntılı bilgi yok.' })];
    } else if (v === 'lig') {
      out.cols = 2;
      const lg = lgRec || {};
      out.cards = [
        card('LİG BİLGİSİ', { rows: rowsOf([row('Lig', p.lg), row('Ülke', p.c), row('Kademe', lg.kademe), row('İtibar', lg.itibar ? lg.itibar + ' / 20' : null), row('Takım sayısı', lg.takim || c.league.length), row('Format', lg.devre), row('Doğrudan yükselen', lg.dogrudan), row('Play-off ile yükselen', lg.playoff), row('Düşen', lg.dusen), row('Şampiyonluk ödülü', lg.odul ? fmtMoney(lg.odul, lg.odulPB) : null), row('Video hakem', lg.var), row('Katılım', lg.katilim)]) }),
        card('REKORLAR', { rows: rowsOf([row('En çok şampiyon olan', lg.trk_enCokSampiyon), row('En büyük galibiyet', lg.trk_enBuyukGalibiyet), row('Tüm zamanların en çok gol atanı', lg.trk_enCokGolAtan), row('En çok maça çıkan', lg.trk_enCokMac), row('Bir edisyonda en çok gol', lg.trk_sezonGol), row('Bir takımın en çok puanı', lg.trk_sezonPuan), row('En yüksek seyirci', lg.trk_enCokSeyirci ? Number(lg.trk_enCokSeyirci).toLocaleString() : null)]) }),
        card('GEÇMİŞ KAZANANLAR', { items: winners(lg.gecmisKazananlar, 40), note: lg.gecmisKazananlar ? 'Yıl · şampiyon · ikinci' : 'Geçmiş kazananlar verisi yok.', span: 'auto' }),
        card('TAKIMLAR', { chips: c.league.map(n => ({ t: n, bg: n === p.n ? 'rgba(var(--td-accent-rgb,200,16,46),0.25)' : neutral, fg })) })
      ].filter(cd => cd.rows.length || cd.bars.length || cd.items.length || cd.chips.length || cd.note);
    } else if (v === 'ulke') {
      out.cols = 2;
      const lgs = tur.map((t, i) => ({ t, i })).filter(x => x.t.ulke === p.c && (x.t.tur === 'Lig' || x.t.tur === 'Yabancı lig')).sort((a, b) => (a.t.kademe || 99) - (b.t.kademe || 99));
      const cups = tur.map((t, i) => ({ t, i })).filter(x => x.t.ulke === p.c && (x.t.tur === 'Ulusal kupa' || x.t.tur === 'Süper kupa'));
      const clubsN = Object.keys((kd && kd.info) || {}).length;
      out.cards = [
        card('ÜLKE BİLGİSİ', { rows: rowsOf([row('Ülke', p.c), row('Konfederasyon', ulk.konf), row('Ülke sıralaması', ulk.sira), row('Katsayı puanı', ulk.puan), row('FIFA sırası', ulk.fifaSira), row('FIFA puanı', ulk.fifaPuan), row('Futbol itibarı', ulk.itibar ? ulk.itibar + ' / 20' : null), row('Oyuncular için çekicilik', ulk.cekicilik ? ulk.cekicilik + ' / 20' : null), row('Çifte vatandaşlık', ulk.cifte), row('Kayıtlı kulüp sayısı', clubsN || null)]) }),
        card('KITASAL KONTENJAN', { rows: rowsOf([row('Şampiyonlar Ligi', ulk.sl), row('Avrupa Ligi', ulk.al), row('Konferans Ligi', ulk.kl)]) }),
        card('YABANCI OYUNCU KURALLARI', { rows: rowsOf([row('Kadroda yabancı sınırı', ulk.kadroYabanci), row('Sahada yabancı sınırı', ulk.sahaYabanci), row('Kimler yabancı sayılır', ulk.kimlerYabanci), row('Yerli oyuncu şartı', ulk.yerliSart), row('Alt ligler', ulk.altLig)]) }),
        card('LİGLER', { items: lgs.map(x => it('Kademe ' + (x.t.kademe || '—'), x.t.ad, x.t.takim ? x.t.takim + ' takım' : '', { cur: 'pointer', pick: openT(x.i), w: x.t.ad === p.lg ? '800' : '500' })), note: lgs.length ? 'Ayrıntı için bir lige tıkla.' : '' }),
        card('KUPALAR', { items: cups.map(x => it(x.t.tur, x.t.ad, x.t.takim ? x.t.takim + ' takım' : '', { cur: 'pointer', pick: openT(x.i) })) }),
        card('REGEN (ALT YAPIDAN GENÇLER)', { rows: rowsOf([row('Çıkış tarihi', ulk.regenTarih), row('Kulüp başına yıllık', ulk.regenSayi), row('Kalite', ulk.regenKalite ? ulk.regenKalite + ' / 20' : null), row('Yaş', ulk.regenYas)]) })
      ].filter(cd => cd.rows.length || cd.items.length || cd.chips.length);
    } else if (v === 'turn') {
      const q = (st.tq || '').toLocaleLowerCase('tr-TR'); const idxs = tur.map((t, i) => i);
      const KIT = { 'Avrupa kupası': 1, 'Kıtasal kulüp kupası': 1, 'Dünya kulüp turnuvası': 1, 'Milli takım turnuvası': 1 };
      const mk = (i) => { const t = tur[i]; const on = (st.tsel < 0 ? lgIdx : st.tsel) === i; return { isHead: false, isItem: true, title: '', name: t.ad, sub: t.tur + (t.ulke ? ' · ' + t.ulke : '') + (t.kita && !t.ulke ? ' · ' + t.kita : ''), pressed: on ? 'true' : 'false', bar: on ? 'var(--td-accent,#C8102E)' : 'transparent', bg: on ? 'rgba(var(--td-accent-rgb,200,16,46),0.12)' : 'transparent', pick: () => this.setState({ tsel: i }) }; };
      const head = (title) => ({ isHead: true, isItem: false, title, name: '', sub: '', pressed: 'false', bar: 'transparent', bg: 'transparent', pick: () => {} });
      let list = [];
      if (q) { const hit = idxs.filter(i => (tur[i].ad + ' ' + (tur[i].ulke || '') + ' ' + tur[i].tur).toLocaleLowerCase('tr-TR').indexOf(q) >= 0); list = [head('SONUÇLAR · ' + hit.length)].concat(hit.slice(0, 60).map(mk)); }
      else {
        const mine = idxs.filter(i => tur[i].ulke === p.c && (tur[i].tur === 'Lig' || tur[i].tur === 'Ulusal kupa' || tur[i].tur === 'Süper kupa' || tur[i].tur === 'Yabancı lig'));
        const intl = idxs.filter(i => KIT[tur[i].tur]);
        list = [head('BU ÜLKE')].concat(mine.map(mk), [head('KITASAL VE DÜNYA')], intl.map(mk), [head('DİĞER ÜLKELER İÇİN ARA')]);
      }
      out.tList = list;
      const si = st.tsel < 0 ? lgIdx : st.tsel; const t = si >= 0 ? tur[si] : null;
      if (t) {
        out.tTitle = t.ad;
        out.tCards = [
          card('GENEL', { rows: rowsOf([row('Tür', t.tur), row('Ülke', t.ulke), row('Kıta', t.kita), row('Düzenleyen', t.org), row('Statü', t.statu), row('Kademe', t.kademe), row('İtibar', t.itibar ? t.itibar + ' / 20' : null), row('Takım sayısı', t.takim), row('Grup sayısı', t.grup), row('Format', t.devre), row('Doğrudan yükselen', t.dogrudan), row('Düşen', t.dusen), row('Şampiyonluk ödülü', t.odul ? fmtMoney(t.odul, t.odulPB) : null), row('Katılım', t.katilim)]) }),
          card('REKORLAR', { rows: rowsOf([row('En çok şampiyon olan', t.trk_enCokSampiyon), row('En büyük galibiyet', t.trk_enBuyukGalibiyet), row('Tüm zamanların en çok gol atanı', t.trk_enCokGolAtan), row('En çok maça çıkan', t.trk_enCokMac), row('Bir edisyonda en çok gol', t.trk_sezonGol), row('Bir takımın en çok puanı', t.trk_sezonPuan)]) }),
          card('GEÇMİŞ KAZANANLAR', { items: winners(t.gecmisKazananlar, 80), note: t.gecmisKazananlar ? 'Yıl · kazanan · ikinci' : '' }),
          card('KATILAN TAKIMLAR', { chips: (t.katilanKulup || []).slice(0, 80).map(n => ({ t: n, bg: n === p.n ? 'rgba(var(--td-accent-rgb,200,16,46),0.25)' : neutral, fg })), note: (t.katilanKulup || []).length > 80 ? '+' + ((t.katilanKulup || []).length - 80) : '' })
        ].filter(cd => cd.rows.length || cd.items.length || cd.chips.length);
        if (!out.tCards.length) out.tCards = [card('GENEL', { note: 'Bu turnuva için ayrıntılı bilgi yok.' })];
      }
    }
    return out;
  }
}
