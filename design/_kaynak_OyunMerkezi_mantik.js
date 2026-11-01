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
function loadKD(country, done) {
  if (window.VE_KD && window.VE_KD[country]) return done(true);
  const f0 = 'kd/' + slugOf(country) + '.js'; const rels = [f0, './' + f0, 'project/' + f0, '/project/' + f0, '../project/' + f0]; let r = 0;
  let base = ''; try { base = document.baseURI || location.href; } catch (e) {}
  try { rels.unshift(new URL(f0, base).href); } catch (e) {}
  try { performance.getEntriesByType('resource').forEach(en => { const m = String(en.name).match(/^(.*\/)[^\/]*\.dc\.html/); if (m) rels.unshift(m[1] + f0); }); } catch (e) {}
  const next = () => {
    if (window.VE_KD && window.VE_KD[country]) return done(true);
    if (r >= rels.length) return done(false);
    const sc = document.createElement('script'); sc.src = rels[r++]; sc.async = true;
    sc.onload = () => next(); sc.onerror = () => { try { sc.remove(); } catch (e) {} next(); };
    (document.head || document.documentElement).appendChild(sc);
  };
  next();
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
    this.state = { mi: 0, view: 'inbox', msg: 0, tick: 0, loaded: false };
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
    const nav = [['inbox', 'Gelen Kutusu', unread ? String(unread) : ''], ['kadro', 'Kadro', ''], ['fikstur', 'Fikstür', ''], ['tablo', 'Tablo', ''], ['finans', 'Finans', ''], ['taktik', 'Taktik', 'Yakında'], ['antrenman', 'Antrenman', 'Yakında'], ['transfer', 'Transfer', 'Yakında']].map(n => { const on = st.view === n[0]; const dis = n[2] === 'Yakında'; return { label: n[1], badge: n[2], pressed: on ? 'true' : 'false', dis: dis ? 'true' : 'false', bar: on ? 'var(--td-accent,#C8102E)' : 'transparent', bg: on ? 'rgba(var(--td-accent-rgb,200,16,46),0.14)' : 'transparent', fg: dis ? 'var(--td-mut2,#8C96B2)' : 'var(--td-text,#F4F6FB)', cur: dis ? 'not-allowed' : 'pointer', pick: () => { if (!dis) this.setState({ view: n[0] }); } }; });
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
    return {
      crestBg: 'hsl(' + hue + ' 52% 34%)', crestText: initialsOf(p.n), clubName: p.n, clubSub: (p.lg || '') + (p.c ? ' · ' + p.c : '') + ' · ' + it.name,
      tabs, hasTabs: this.items.length > 1, dateText: fmtDate(G.date), matchDay, notMatchDay: !matchDay,
      simMatch: () => { this.simRound(M, G, my); G.date = addDays(G.date, 1); M.dates.forEach((d, i) => { if (d < G.date && !G.sim[i]) this.simRound(M, G, i); }); this.save(); this.setState({ view: 'fikstur', tick: st.tick + 1 }); },
      nextDay: () => this.advance(1, false), toMatch: () => this.advance(0, true),
      nav, noData: st.loaded && !squad.length, vInbox: st.view === 'inbox', vKadro: st.view === 'kadro', vFikstur: st.view === 'fikstur', vTablo: st.view === 'tablo', vFinans: st.view === 'finans',
      msgs: msgRows, hasMsg: !!cur, cur: cur || { from: '', subject: '', paras: [], facts: [], hasFacts: false },
      squad: squadRows, noSquad: !squadRows.length, fixtures, noFix: !fixtures.length, table, fin: finRows, noFin: !has,
      hasNext: !!nx, noNext: !nx, next: nx ? { opp: nx.opp, where: nx.home ? 'Ev sahibi' : 'Deplasman', date: fmtDate(nx.date), days: diffDays(G.date, nx.date) <= 0 ? 'Bugün' : diffDays(G.date, nx.date) + ' gün sonra' } : { opp: '', where: '', date: '', days: '' },
      summary: [{ k: 'Takım gücü (en iyi 11)', v: avg11 ? avg11.toFixed(1) : '—' }, { k: 'Lig sırası', v: myPos && league.length ? myPos + ' / ' + league.length : '—' }, { k: 'Kadro', v: squad.length ? String(squad.length) : '—' }, { k: 'Sezon hedefi', v: has ? EXP_LABEL[s.exp] : '—' }]
    };
  }
}
