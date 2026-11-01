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
const KD_IDS = ["7f279cacbeebb2a0e86dcdcb7a417a0a", "e02241c677d6b0b84c26cbf385f44a3c", "911d1fb885e567e137a588f9d77ee1ec", "c86f1efac53852b1d0ffa0ddf10c0047", "3a167cfcda1e9efa8969539a81d9f466", "3c30c1204299f1bbd70f732a652ff18f", "af74558d5bb17a60a402135fe58fea3d", "6f72b046e62a36d8e4e45610da1ee234"];
const KD_MAP = {"ingiltere":0,"_dunya":0,"arjantin":0,"portekiz":0,"ruanda":0,"italya":1,"meksika":1,"brezilya":1,"fransa":1,"polonya":1,"guney-kore":1,"ispanya":2,"turkiye":2,"abd":2,"suudi-arabistan":2,"hollanda":2,"romanya":2,"cekya":2,"macaristan":2,"sirbistan":2,"norvec":2,"urdun":2,"almanya":3,"bulgaristan":3,"danimarka":3,"isvec":3,"isvicre":3,"rusya":3,"peru":3,"hirvatistan":3,"uruguay":3,"israil":3,"kolombiya":3,"kibris":3,"fildisi-sahili":3,"cin":3,"tayland":4,"slovakya":4,"esvatini":4,"ukrayna":4,"japonya":4,"avusturya":4,"nijerya":4,"ekvador":4,"sili":4,"belcika":4,"finlandiya":4,"endonezya":4,"paraguay":4,"iskocya":4,"iran":4,"slovenya":4,"luksemburg":4,"yunanistan":5,"malta":5,"gana":5,"senegal":5,"kanada":5,"izlanda":5,"cezayir":5,"ozbekistan":5,"azerbaycan":5,"birlesik-arap-emirlikleri":5,"estonya":5,"misir":5,"_turnuvalar":5,"gurcistan":5,"guney-afrika":5,"vietnam":5,"benin":5,"ermenistan":5,"irak":5,"avustralya":5,"hindistan":5,"letonya":5,"namibya":5,"venezuela":5,"karadag":5,"kongo-dc":5,"burkina-faso":5,"galler":5,"bermuda":5,"tanzanya":6,"tunus":6,"belarus":6,"kenya":6,"gine-bissau":6,"zambiya":6,"kazakistan":6,"botsvana":6,"kamerun":6,"irlanda":6,"guatemala":6,"libya":6,"angola":6,"faroe-adalari":6,"nijer":6,"gambiya":6,"lesotho":6,"curacao":6,"liberya":6,"komorlar":6,"kosova":6,"el-salvador":6,"kuzey-irlanda":6,"bosna-hersek":6,"fas":6,"ekvator-ginesi":6,"kuzey-makedonya":6,"antigua-ve-barbuda":6,"guney-sudan":6,"malezya":6,"arnavutluk":6,"bahreyn":6,"sudan":6,"cayman-adalari":6,"gabon":6,"saint-kitts-ve-nevis":6,"uganda":6,"bolivya":6,"mali":6,"aruba":6,"surinam":6,"cibuti":6,"eritre":6,"zimbabve":6,"litvanya":6,"panama":6,"jamaika":6,"andorra":6,"honduras":6,"madagaskar":6,"moritanya":6,"kuba":6,"myanmar":6,"san-marino":6,"etiyopya":6,"kongo":6,"yeni-zelanda":6,"malavi":6,"burundi":6,"mozambik":6,"gine":6,"kosta-rika":6,"saint-vincent-ve-grenadinler":6,"katar":6,"orta-afrika-cumhuriyeti":6,"cad":6,"britanya-virjin-adalari":6,"turks-ve-caicos-adalari":6,"bahamalar":7,"trinidad-ve-tobago":7,"cebelitarik":7,"nikaragua":7,"porto-riko":7,"kambocya":7,"hong-kong":7,"laos":7,"mauritius":7,"guyana":7,"dominika":7,"barbados":7,"grenada":7,"anguilla":7,"dominik-cumhuriyeti":7,"filipinler":7,"moldova":7,"abd-virjin-adalari":7,"singapur":7,"belize":7,"lihtenstayn":7,"haiti":7,"lubnan":7};
const KD_CH = {}, KD_WAIT = {};
function injectJs(url, ok, fail) {
  const host = document.head || document.documentElement; const s = document.createElement('script'); s.async = true;
  s.onload = () => ok();
  s.onerror = () => { fetch(url).then(r => { if (!r.ok) throw new Error('http'); return r.text(); }).then(t => { const e = document.createElement('script'); e.text = t; host.appendChild(e); ok(); }).catch(() => fail()); };
  s.src = url; host.appendChild(s);
}
function getChunk(i, cb) {
  const have = () => (window.__kdChunks || {})[i];
  if (have()) return cb(have());
  if (KD_WAIT[i]) return KD_WAIT[i].push(cb);
  KD_WAIT[i] = [cb];
  const done = () => { const w = KD_WAIT[i]; KD_WAIT[i] = null; w.forEach(f => f(have() || null)); };
  injectJs('/_blob/' + KD_IDS[i], done, done);
}
function loadKD(country, done) {
  window.VE_KD = window.VE_KD || {}; let left = 3, ok = true;
  const fin = () => { if (--left === 0) done(ok); };
  const slug = slugOf(country);
  if (window.VE_KD[country]) fin(); else if (KD_MAP[slug] == null) { ok = false; fin(); } else getChunk(KD_MAP[slug], c => { if (c && c[slug]) window.VE_KD[country] = c[slug]; else ok = false; fin(); });
  if (window.VE_TUR) fin(); else getChunk(KD_MAP['_turnuvalar'], c => { if (c && c['_turnuvalar']) window.VE_TUR = c['_turnuvalar']; fin(); });
  if (window.VE_DUN) fin(); else getChunk(KD_MAP['_dunya'], c => { if (c && c['_dunya']) window.VE_DUN = c['_dunya']; fin(); });
}
const POS_GROUP = { 'Kaleci': 'Kaleci', 'Stoper': 'Defans', 'Sağ bek': 'Defans', 'Sol bek': 'Defans', 'Ön libero': 'Orta saha', 'Merkez orta saha': 'Orta saha', 'Ofansif orta saha': 'Orta saha', 'Sağ kanat': 'Forvet', 'Sol kanat': 'Forvet', 'Santrfor': 'Forvet' };
const TEAM_LIST = [['A', 'A Takım'], ['U21', 'U21'], ['U19', 'U19']];
function poolOf(kd, p, team) {
  if (!kd) return []; const A = (kd.clubs && kd.clubs[p.n]) || [];
  if (team === 'A') return A;
  if (team === 'U21') { const seen = {}; const out = []; ((kd.res && kd.res[p.n]) || []).concat(A.filter(x => 2026 - x[1] <= 21)).forEach(x => { if (!seen[x[0]]) { seen[x[0]] = 1; out.push(x); } }); return out; }
  if (team === 'U19') return (kd.yth && kd.yth[p.n]) || [];
  if (team === 'FREE') return kd.free || [];
  if (team === 'RET') return kd.ret || [];
  return [];
}
function allPools(kd, p) { const o = []; TEAM_LIST.forEach(t => { poolOf(kd, p, t[0]).forEach(x => o.push(x)); }); return o; }

const ED_IDX = { guc: 5, pot: 6, deger: 7, soz: 8, uyruk: 2, mevki: 3, ayak: 4, forma: 9 };
const ED_POS = ['Kaleci', 'Stoper', 'Sağ bek', 'Sol bek', 'Ön libero', 'Merkez orta saha', 'Ofansif orta saha', 'Sağ kanat', 'Sol kanat', 'Santrfor'];
const ED_LABEL = { guc: 'Güç', pot: 'Potansiyel', deger: 'Piyasa değeri (milyon €)', soz: 'Sözleşme bitiş yılı', uyruk: 'Uyruk', mevki: 'Mevki', ayak: 'Ayak', forma: 'Forma numarası' };
function edGet(row, k) { const v = row[ED_IDX[k]]; if (k === 'deger') return String(Math.round((Number(v) || 0) / 1e5) / 10); return v === undefined || v === null ? '' : String(v); }
function edSet(row, k, v) { if (k === 'guc' || k === 'pot') row[ED_IDX[k]] = Math.max(1, Math.min(20, Math.round(Number(v)) || row[ED_IDX[k]])); else if (k === 'deger') row[7] = Math.max(0, Math.round((Number(String(v).replace(',', '.')) || 0) * 1e6)); else if (k === 'soz') row[8] = String(Math.max(2026, Math.min(2045, parseInt(v, 10) || Number(row[8]) || 2027))); else if (k === 'forma') row[9] = Math.max(0, Math.min(99, parseInt(v, 10) || 0)); else if (k === 'mevki') { if (ED_POS.indexOf(v) >= 0) row[3] = v; } else if (k === 'ayak') { if (['Sağ', 'Sol', 'İki ayak'].indexOf(v) >= 0) row[4] = v; } else if (k === 'uyruk') { if (String(v).trim()) row[2] = String(v).trim(); } }
const ST_KEYS = ['Taktik bilgisi', 'Hücum', 'Savunma', 'Kalecilik', 'Fiziksel çalışma', 'Motivasyon', 'Disiplin', 'İnsan yönetimi', 'Gençlerle çalışma', 'Yetenek değerlendirme', 'Potansiyel değerlendirme', 'Uyum'];
const ST_BIAS = { 'Teknik direktör': { 'Taktik bilgisi': 3, 'Motivasyon': 2, 'İnsan yönetimi': 2 }, 'Yardımcı antrenör': { 'Taktik bilgisi': 1, 'Hücum': 1, 'Savunma': 1 }, 'Kaleci antrenörü': { 'Kalecilik': 5, 'Hücum': -4, 'Savunma': -2, 'Taktik bilgisi': -3 }, 'Kondisyoner': { 'Fiziksel çalışma': 5, 'Taktik bilgisi': -4 }, 'Gözlemci': { 'Yetenek değerlendirme': 4, 'Potansiyel değerlendirme': 4, 'Taktik bilgisi': -3 }, 'Fizyoterapist': { 'Fiziksel çalışma': 3, 'Taktik bilgisi': -5 }, 'Sportif direktör': { 'Yetenek değerlendirme': 3, 'Potansiyel değerlendirme': 2, 'İnsan yönetimi': 3 }, 'Altyapı sorumlusu': { 'Gençlerle çalışma': 4 } };
function genStaff(q) { const it = Number(q[6]) || 8, b = ST_BIAS[q[3]] || {}; return ST_KEYS.map(k => { let v = it * 0.9 + 2 + (b[k] || 0) + (kHash(q[0] + '|' + k) - 0.5) * 4; if (k === 'Kalecilik' && !b[k]) v = 3 + kHash(q[0] + k) * 3; return Math.max(1, Math.min(20, Math.round(v))); }); }
function staffAttrs(q) { return Array.isArray(q[8]) && q[8].length === ST_KEYS.length ? q[8] : genStaff(q); }
const ST_ROLES = ['Başkan', 'Sportif direktör', 'Teknik direktör', 'Yardımcı antrenör', 'Kaleci antrenörü', 'Kondisyoner', 'Analist', 'Fizyoterapist', 'Doktor', 'Gözlemci', 'Altyapı sorumlusu'];
const ST_LIC = ['Yok', 'UEFA C', 'UEFA B', 'UEFA A', 'UEFA Pro'];
const CLUB_F = [['bakiye', 'Kasa bakiyesi (milyon €)', 'tl'], ['borc', 'Toplam borç (milyon €)', 'tl'], ['itibar', 'İtibar', 'n20'], ['tesis', 'Antrenman tesisi', 'n20'], ['altyapi', 'Altyapı', 'n20'], ['gozlem', 'Gözlemci ağı', 'n20'], ['kapasite', 'Stadyum kapasitesi', 'n'], ['stadyum', 'Stadyum', 't'], ['sehir', 'Şehir', 't']];
const CLUB_S = [['tr', 'Transfer bütçesi (milyon €)', 'eur'], ['wg', 'Maaş bütçesi (milyon €/ay)', 'eur']];
function clubGet(info, sObj, k, kind) { const v = kind === 'eur' ? (sObj ? sObj[k] : undefined) : info[k]; if (v === undefined || v === null) return ''; if (kind === 'tl') return String(Math.round(v / 1e5 / 55.93) / 10); if (kind === 'eur') return String(Math.round(v / 1e5) / 10); return String(v); }
function clubVal(v, kind) { if (kind === 'tl') return Math.max(0, Math.round((Number(String(v).replace(',', '.')) || 0) * 1e6 * 55.93)); if (kind === 'eur') return Math.max(0, Math.round((Number(String(v).replace(',', '.')) || 0) * 1e6)); if (kind === 'n20') return Math.max(1, Math.min(20, Math.round(Number(v)) || 1)); if (kind === 'n') return Math.max(0, Math.round(Number(v)) || 0); return String(v); }
function rowsOfClub(kd, club, name) { const o = []; ['clubs', 'res', 'yth'].forEach(sec => { const l = kd[sec] && kd[sec][club]; if (l) l.forEach((r, i) => { if (r[0] === name) o.push({ sec, row: r }); }); }); return o; }
function dropRows(kd, club, name) { ['clubs', 'res', 'yth'].forEach(sec => { const l = kd[sec] && kd[sec][club]; if (!l) return; for (let i = l.length - 1; i >= 0; i--) if (l[i][0] === name) l.splice(i, 1); }); }
function putRow(kd, club, sec, row) { kd[sec] = kd[sec] || {}; kd[sec][club] = kd[sec][club] || []; if (!kd[sec][club].some(r => r[0] === row[0])) kd[sec][club].push(row.slice()); }
const NAV_ICON = {"pano": "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10", "inbox": "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6", "kadro": "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", "heyet": "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "fikstur": "M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18", "tablo": "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01", "finans": "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v12 M15 9.5a3 2.5 0 0 0-3-1.5c-1.7 0-3 .9-3 2s1.3 2 3 2 3 .9 3 2-1.3 2-3 2a3 2.5 0 0 1-3-1.5", "kulup": "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "lig": "M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-1.21 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98 1.21 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0 0 12 0V2z", "ulke": "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z", "turn": "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", "taktik": "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z", "antrenman": "M22 12h-4l-3 9L9 3l-3 9H2", "transfer": "M17 1l4 4-4 4 M3 11V9a4 4 0 0 1 4-4h14 M7 23l-4-4 4-4 M21 13v2a4 4 0 0 1-4 4H3"};
const KO_SLOTS = [900, 1020, 1140, 1200];
const koOf = (i) => KO_SLOTS[Math.floor(u01('ko|' + i) * 4)];
const hhmm = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const DAY_START = 540;
const DAY_END = 1260;
const CLOCK_STEP = 180;
const KITSET = { 'Avrupa kupası': 1, 'Kıtasal kulüp kupası': 1, 'Dünya kulüp turnuvası': 1 };
function contOf(name) { const tur = window.VE_TUR || []; const o = []; tur.forEach((t, i) => { if (KITSET[t.tur] && Array.isArray(t.katilanKulup) && t.katilanKulup.indexOf(name) >= 0) o.push({ t, i }); }); return o; }
const GOALW = { 'Santrfor': 5, 'Sağ kanat': 3.2, 'Sol kanat': 3.2, 'Ofansif orta saha': 3, 'Merkez orta saha': 1.5, 'Ön libero': 0.7, 'Sağ bek': 0.7, 'Sol bek': 0.7, 'Stoper': 0.5, 'Kaleci': 0.02 };
function contProj(ulk, rank) {
  const sl = Number(ulk && ulk.sl) || 0, al = Number(ulk && ulk.al) || 0, kl = Number(ulk && ulk.kl) || 0; if (!rank || !(sl + al + kl)) return '';
  return rank <= sl ? 'Şampiyonlar Ligi' : rank <= sl + al ? 'Avrupa Ligi' : rank <= sl + al + kl ? 'Konferans Ligi' : 'Kıtasal hak yok';
}
function genMatch(key, home, away, hg, ag, kd, sH, sA) {
  const R = (s) => u01(key + '|' + s);
  const squad = (n) => ((kd && kd.clubs && kd.clubs[n]) || []).slice().sort((a, b) => b[5] - a[5]).slice(0, 16);
  const pickP = (n, s) => { const sq = squad(n); if (!sq.length) return null; const w = sq.map(x => (GOALW[x[3]] || 1) * (0.5 + x[5] / 10)); const t = w.reduce((a, b) => a + b, 0); let r = R(s) * t; for (let i = 0; i < sq.length; i++) { r -= w[i]; if (r <= 0) return sq[i]; } return sq[0]; };
  const goals = [];
  [[home, hg, 'h'], [away, ag, 'a']].forEach(([n, g, side]) => { for (let i = 0; i < g; i++) { const sc = pickP(n, side + 'g' + i); let as = pickP(n, side + 'a' + i); if (as && sc && as[0] === sc[0]) as = null; goals.push({ side, club: n, min: 1 + Math.floor(R(side + 'm' + i) * 90), who: sc ? sc[0] : '—', pos: sc ? sc[3] : '', ast: as ? as[0] : '', i }); } });
  goals.sort((a, b) => a.min - b.min); let h = 0, a = 0; goals.forEach(g => { if (g.side === 'h') h++; else a++; g.score = h + '–' + a; });
  const cards = []; [[home, 'h'], [away, 'a']].forEach(([n, side]) => { const k = Math.floor(R(side + 'ycn') * 4); for (let i = 0; i < k; i++) { const p0 = pickP(n, side + 'y' + i); if (p0) cards.push({ side, club: n, min: 5 + Math.floor(R(side + 'ym' + i) * 85), who: p0[0], red: R(side + 'r' + i) < 0.06 }); } });
  cards.sort((x, y) => x.min - y.min);
  const dom = Math.max(0.25, Math.min(0.75, 0.5 + (sH - sA) * 0.035 + (hg - ag) * 0.02 + (R('pos') - 0.5) * 0.08));
  const shH = Math.max(hg + 2, Math.round(8 + hg * 3 + (sH - sA) * 0.6 + R('sh') * 5)), shA = Math.max(ag + 2, Math.round(8 + ag * 3 + (sA - sH) * 0.6 + R('sa') * 5));
  const onH = Math.min(shH, hg + 1 + Math.floor(R('oh') * 4)), onA = Math.min(shA, ag + 1 + Math.floor(R('oa') * 4));
  const r2 = (x) => Math.round(x * 100) / 100;
  const xgH = r2(hg * 0.5 + shH * 0.05 + R('xh') * 0.6), xgA = r2(ag * 0.5 + shA * 0.05 + R('xa') * 0.6);
  const coH = Math.round(3 + shH * 0.3 + R('ch') * 3), coA = Math.round(3 + shA * 0.3 + R('ca') * 3), foH = Math.round(8 + R('fh') * 8), foA = Math.round(8 + R('fa') * 8);
  const row = (k, l, r, fmt) => { const t = (l + r) || 1; return { k, l: fmt ? fmt(l) : String(l), r: fmt ? fmt(r) : String(r), lp: Math.max(4, Math.round(l / t * 100)) + '%', rp: Math.max(4, Math.round(r / t * 100)) + '%' }; };
  const stats = [row('Topla oynama', Math.round(dom * 100), 100 - Math.round(dom * 100), v => v + '%'), row('Toplam şut', shH, shA), row('İsabetli şut', onH, onA), row('Beklenen gol (xG)', xgH, xgA), row('Korner', coH, coA), row('Faul', foH, foA), row('Sarı kart', cards.filter(c => c.side === 'h' && !c.red).length, cards.filter(c => c.side === 'a' && !c.red).length), row('Kırmızı kart', cards.filter(c => c.side === 'h' && c.red).length, cards.filter(c => c.side === 'a' && c.red).length)];
  const best = goals.length ? goals.reduce((m, g) => { m[g.who] = (m[g.who] || 0) + 1; return m; }, {}) : {}; const motm = Object.keys(best).sort((x, y) => best[y] - best[x])[0] || '';
  return { goals, cards, stats, motm };
}
function replayOf(g, key) {
  const R = (s) => u01(key + '|rp|' + s); const fx = (x) => g.side === 'h' ? x : 105 - x; const f1 = (n) => Math.round(n * 10) / 10;
  const p0 = [fx(32 + R(1) * 10), 14 + R(2) * 40], p1 = [fx(52 + R(3) * 10), 12 + R(4) * 44], p2 = [fx(74 + R(5) * 8), 18 + R(6) * 32], p3 = [fx(92 + R(7) * 5), 26 + R(8) * 16];
  const goal = [g.side === 'h' ? 104.2 : 0.8, 34];
  const P = (a) => f1(a[0]) + ' ' + f1(a[1]);
  const ball = 'M ' + P(p0) + ' L ' + P(p1) + ' L ' + P(p2) + ' L ' + P(p3) + ' L ' + P(goal);
  const run = 'M ' + P([p2[0] - (g.side === 'h' ? 14 : -14), p3[1] + 8]) + ' L ' + P(p3);
  const att = g.side === 'h' ? '#C8102E' : '#1F6FD6', def = g.side === 'h' ? '#1F6FD6' : '#C8102E';
  const dots = [[p0, att], [p1, att], [p2, att]].map(d => ({ cx: f1(d[0][0]), cy: f1(d[0][1]), fill: d[1] }));
  for (let i = 0; i < 5; i++) dots.push({ cx: f1(fx(84 + R(20 + i) * 14)), cy: f1(10 + R(30 + i) * 48), fill: def });
  dots.push({ cx: f1(fx(103.5)), cy: 34, fill: '#F2C14E' });
  return { ball, run, dots, min: g.min, who: g.who, ast: g.ast, score: g.score, club: g.club };
}
const AT_TECH = ['Bitiricilik', 'Dribbling', 'İlk dokunuş', 'Orta', 'Pas', 'Uzaktan şut', 'Top kesme', 'Markaj', 'Kafa', 'Teknik', 'Korner', 'Serbest vuruş', 'Penaltı', 'Uzun taç atışı'];
const AT_MENT = ['Karar alma', 'Önsezi', 'Pozisyon alma', 'Liderlik', 'Soğukkanlılık', 'Çalışkanlık', 'Takım oyunu', 'Agresiflik', 'Cesaret', 'Konsantrasyon', 'Kararlılık', 'Yaratıcılık', 'Topsuz hareket', 'Vizyon'];
const AT_PHYS = ['Hız', 'Hızlanma', 'Çeviklik', 'Dayanıklılık', 'Güç', 'Denge', 'Zıplama', 'Doğal form', 'Sakatlık direnci'];
const AT_GK = ['Hava hakimiyeti', 'Alan hakimiyeti', 'İletişim', 'Garip hareketler', 'Top tutma', 'Ayakla oyun', 'Teke tek', 'Refleks', 'Çıkış', 'Elle atış'];
const ALL_AT = AT_TECH.concat(AT_MENT, AT_PHYS, AT_GK);
const kHash = (s) => hash(s) / 4294967296;
const POS_BIAS = {
  'Kaleci': { 'Hava hakimiyeti': 1, 'Alan hakimiyeti': 1, 'İletişim': 1, 'Top tutma': 1, 'Teke tek': 1, 'Refleks': 2, 'Çıkış': 0, 'Elle atış': 0, 'Ayakla oyun': -1, 'Garip hareketler': -1, 'Konsantrasyon': 2, 'Soğukkanlılık': 1, 'Pas': -4, 'Bitiricilik': -9, 'Dribbling': -8, 'Hız': -3, 'Hızlanma': -3, 'Zıplama': 1, 'Çeviklik': 1 },
  'Stoper': { 'Top kesme': 3, 'Markaj': 3, 'Kafa': 3, 'Pozisyon alma': 3, 'Güç': 3, 'Zıplama': 2, 'Cesaret': 2, 'Konsantrasyon': 1, 'Bitiricilik': -5, 'Dribbling': -3, 'Orta': -4, 'Yaratıcılık': -3, 'Vizyon': -2, 'Uzaktan şut': -4, 'Korner': -4, 'Serbest vuruş': -4, 'Hız': -1 },
  'Sağ bek': { 'Orta': 2, 'Top kesme': 1, 'Markaj': 1, 'Hız': 2, 'Hızlanma': 2, 'Dayanıklılık': 3, 'Çalışkanlık': 3, 'Topsuz hareket': 1, 'Bitiricilik': -3, 'Kafa': -2, 'Yaratıcılık': -2, 'Güç': -1 },
  'Sol bek': { 'Orta': 2, 'Top kesme': 1, 'Markaj': 1, 'Hız': 2, 'Hızlanma': 2, 'Dayanıklılık': 3, 'Çalışkanlık': 3, 'Topsuz hareket': 1, 'Bitiricilik': -3, 'Kafa': -2, 'Yaratıcılık': -2, 'Güç': -1 },
  'Ön libero': { 'Top kesme': 3, 'Markaj': 2, 'Pas': 1, 'Pozisyon alma': 3, 'Çalışkanlık': 3, 'Dayanıklılık': 3, 'Güç': 2, 'Takım oyunu': 2, 'Karar alma': 1, 'Bitiricilik': -3, 'Dribbling': -2, 'Orta': -3, 'Hız': -1 },
  'Merkez orta saha': { 'Pas': 3, 'Vizyon': 2, 'Karar alma': 2, 'İlk dokunuş': 2, 'Çalışkanlık': 2, 'Dayanıklılık': 2, 'Takım oyunu': 2, 'Teknik': 1, 'Bitiricilik': -2, 'Kafa': -2, 'Markaj': -1 },
  'Ofansif orta saha': { 'Pas': 3, 'Vizyon': 3, 'Yaratıcılık': 3, 'Teknik': 3, 'Dribbling': 2, 'İlk dokunuş': 3, 'Uzaktan şut': 2, 'Topsuz hareket': 2, 'Önsezi': 2, 'Top kesme': -4, 'Markaj': -4, 'Kafa': -3, 'Güç': -2, 'Pozisyon alma': -1 },
  'Sağ kanat': { 'Hız': 3, 'Hızlanma': 3, 'Dribbling': 3, 'Orta': 3, 'Çeviklik': 2, 'Teknik': 2, 'Topsuz hareket': 1, 'Top kesme': -5, 'Markaj': -5, 'Kafa': -4, 'Güç': -3, 'Zıplama': -2, 'Pozisyon alma': -2 },
  'Sol kanat': { 'Hız': 3, 'Hızlanma': 3, 'Dribbling': 3, 'Orta': 3, 'Çeviklik': 2, 'Teknik': 2, 'Topsuz hareket': 1, 'Top kesme': -5, 'Markaj': -5, 'Kafa': -4, 'Güç': -3, 'Zıplama': -2, 'Pozisyon alma': -2 },
  'Santrfor': { 'Bitiricilik': 4, 'Topsuz hareket': 3, 'Önsezi': 3, 'Soğukkanlılık': 2, 'Kafa': 2, 'Güç': 2, 'Hızlanma': 1, 'Penaltı': 1, 'Top kesme': -6, 'Markaj': -6, 'Orta': -3, 'Korner': -4, 'Uzun taç atışı': -3, 'Pozisyon alma': -1 }
};
function genAttrs(name, mevki, guc, age) {
  const a = {}; const bias = POS_BIAS[mevki] || {}; const gk = mevki === 'Kaleci';
  AT_TECH.concat(AT_MENT, AT_PHYS).forEach(k => {
    let v = guc + (bias[k] || 0) + (kHash(name + '|' + k) - 0.5) * 4;
    if (age >= 30 && ['Hız', 'Hızlanma', 'Çeviklik', 'Zıplama'].indexOf(k) >= 0) v -= (age - 29) * 0.7;
    if (age <= 20 && ['Soğukkanlılık', 'Karar alma', 'Konsantrasyon', 'Liderlik'].indexOf(k) >= 0) v -= 1.5;
    if (age >= 26 && AT_MENT.indexOf(k) >= 0) v += Math.min(1.5, (age - 25) * 0.3);
    if (['Korner', 'Serbest vuruş', 'Penaltı', 'Uzun taç atışı'].indexOf(k) >= 0 && !bias[k]) v -= 2;
    a[k] = Math.max(1, Math.min(20, Math.round(v)));
  });
  AT_GK.forEach(k => { a[k] = gk ? Math.max(1, Math.min(20, Math.round(guc + (bias[k] || 0) + (kHash(name + '|' + k) - 0.5) * 3))) : 1 + Math.floor(kHash(name + '#' + k) * 3); });
  return a;
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
const fmtDate = (iso) => { try { const f = tdRead().date; const p = iso.split('-'); if (f === 'GG.AA.YYYY') return p[2] + '.' + p[1] + '.' + p[0]; if (f === 'AA/GG/YYYY') return p[1] + '/' + p[2] + '/' + p[0]; if (f === 'YYYY-AA-GG') return iso; return new Date(iso + 'T12:00:00Z').toLocaleDateString(loc(), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); } catch (e) { return iso; } };
const fmtShort = (iso) => { try { const f = tdRead().date; const p = iso.split('-'); if (f === 'GG.AA.YYYY') return p[2] + '.' + p[1]; if (f === 'AA/GG/YYYY') return p[1] + '/' + p[2]; if (f === 'YYYY-AA-GG') return p[1] + '-' + p[2]; return new Date(iso + 'T12:00:00Z').toLocaleDateString(loc(), { day: 'numeric', month: 'short', timeZone: 'UTC' }); } catch (e) { return iso; } };
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
    this._hist = [];
    try { window.addEventListener('keydown', (ev) => { if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'e' || ev.key === 'E')) { ev.preventDefault(); this.openEditor(); } else if (ev.key === 'Escape' && this.state.edOpen) this.setState({ edOpen: false }); }); } catch (e) {}
    try { history.pushState({ g: 1 }, ''); window.addEventListener('popstate', () => { if (this._hist.length) { this.goPrev(); try { history.pushState({ g: 1 }, ''); } catch (e) {} } }); } catch (e) {}
    const dr = tdLoad(DRAFT_KEY, null) || {};
    const picks = Array.isArray(dr.kulupler) ? dr.kulupler.filter(Boolean) : []; const dm = Array.isArray(dr.managers) ? dr.managers : [];
    this.sample = picks.length === 0;
    this.items = this.sample ? [{ name: 'Menajer', pick: SAMPLE }] : picks.map((p, i) => { const a = dm[i] || {}; const nm = ((a.ad || '') + ' ' + (a.soyad || '')).trim() || ('Menajer ' + (i + 1)); return { name: nm, first: (a.ad || '').trim() || nm, m: a, pick: p }; });
    this.game = tdLoad(GAME_KEY, null) || {}; this.game.k = this.game.k || {};
    this.state = { mi: 0, view: 'pano', msg: 0, tick: 0, loaded: false, tq: '', tsel: -1, tmode: 'tur', vp: null, back: null, hsort: '', hdir: 1, fsel: -1, rep: null, cg: '', ssel: '', pclub: null, panoOld: false, edOpen: false, edd: {}, edTab: 'kulup', edMsg: '', fopen: '', kpos10: '', knat: '', kcon: '', kpow: '', kteam: 'A', ksort: '', kdir: 1, kpos: '', kage: '', fq: '' };
    this.loadFor(0);
  }
  key() { const p = this.items[this.state.mi].pick; return p.n + '|' + p.c; }
  gs() { const k = this.key(); if (!this.game.k[k] || this.game.k[k].lg !== this.items[this.state.mi].pick.lg) this.game.k[k] = { lg: this.items[this.state.mi].pick.lg, date: START, min: DAY_START, sim: {}, res: {}, read: {} }; return this.game.k[k]; }
  loadFor(mi) { this.setState({ loaded: false }); const p = this.items[mi].pick; loadKD(p.c, ok => { this.setState({ loaded: true, kdOk: ok, tick: this.state.tick + 1 }); }); }
  setState(p, cb) {
    try { const st = this.state; if (p && p.view && st && p.view !== st.view && !this._popping) { this._hist.push({ view: st.view, vp: st.vp, psel: st.psel, psrc: st.psrc, pclub: st.pclub, fsel: st.fsel, ssel: st.ssel, cg: st.cg, tsel: st.tsel, tmode: st.tmode }); if (this._hist.length > 40) this._hist.shift(); } } catch (e) {}
    return super.setState(p, cb);
  }
  goPrev() { const b = this._hist.pop(); if (!b) return; this._popping = true; try { this.setState(Object.assign({ back: null, rep: null }, b)); } finally { this._popping = false; } }
  opApply(op, dir) {
    const kd = window.VE_KD && window.VE_KD[op.c]; if (!kd) return false; const d = dir > 0;
    if (op.t === 'p') { const vals = d ? op.f : op.o; rowsOfClub(kd, op.club, op.name).forEach(x => Object.keys(vals).forEach(k => { if (k === 'A') x.row[10] = Array.isArray(vals.A) ? vals.A.slice() : 0; else edSet(x.row, k, vals[k]); })); return true; }
    if (op.t === 'add') { if (d) putRow(kd, op.club, 'clubs', op.row); else dropRows(kd, op.club, op.row[0]); return true; }
    if (op.t === 'del') { if (d) dropRows(kd, op.club, op.name); else op.rows.forEach(x => putRow(kd, op.club, x.sec, x.row)); return true; }
    if (op.t === 'mv') { const kd2 = window.VE_KD && window.VE_KD[op.toC]; if (!kd2) return false; if (d) { dropRows(kd, op.club, op.name); putRow(kd2, op.toClub, 'clubs', op.rows[0].row); } else { dropRows(kd2, op.toClub, op.name); op.rows.forEach(x => putRow(kd, op.club, x.sec, x.row)); } return true; }
    if (op.t === 'club') { const vals = d ? op.f : op.o; kd.info = kd.info || {}; kd.info[op.club] = kd.info[op.club] || {}; Object.keys(vals).forEach(k => { if (k === 'tr' || k === 'wg') { const it = this.items.find(x => x.pick.n === op.club && x.pick.c === op.c); if (it && it.pick.s) it.pick.s[k] = vals[k]; } else kd.info[op.club][k] = vals[k]; }); return true; }
    if (op.t === 'st') { const vals = d ? op.f : op.o; const lists = [kd.staff && kd.staff[op.club], op.club === 'Serbest' ? kd.sfree : null].filter(Boolean); lists.forEach(l => l.forEach(q => { if (q[0] !== op.name) return; if ('role' in vals) q[3] = vals.role; if ('uyruk' in vals) q[2] = vals.uyruk; if ('soz' in vals) q[4] = vals.soz; if ('lisans' in vals) q[5] = vals.lisans; if ('itibar' in vals) q[6] = vals.itibar; if ('A' in vals) q[8] = Array.isArray(vals.A) ? vals.A.slice() : 0; })); return true; }
    return false;
  }
  applyAll(G) {
    if (!G) return; if (G.patch && !G.ops) { G.ops = []; Object.keys(G.patch).forEach((k, i) => { const e = G.patch[k]; G.ops.push({ id: 'm' + i, t: 'p', c: e.c, club: e.club, name: e.name, f: e.f, o: e.o }); }); delete G.patch; }
    G.ops = G.ops || []; this._applied = this._applied || {}; G.ops.forEach(op => { if (!this._applied[op.id] && this.opApply(op, 1)) this._applied[op.id] = true; });
  }
  addOp(op) { const G = this.gs(); G.ops = G.ops || []; op.id = 'o' + Date.now() + '_' + G.ops.length; G.ops.push(op); G.edited = true; const ok = () => { this.applyAll(G); this.save(); this.setState({ edd: {}, edMsg: 'Kaydedildi.', tick: this.state.tick + 1 }); }; const need = [op.c].concat(op.toC ? [op.toC] : []).filter(c => !(window.VE_KD && window.VE_KD[c])); if (need.length) { let n = need.length; need.forEach(c => loadKD(c, () => { if (--n === 0) ok(); })); } else ok(); }
  undoOp(id) { const G = this.gs(); const i = (G.ops || []).findIndex(o => o.id === id); if (i < 0) return; const op = G.ops[i]; if (this._applied && this._applied[id]) { this.opApply(op, -1); delete this._applied[id]; } G.ops.splice(i, 1); this.save(); this.setState({ tick: this.state.tick + 1, edMsg: 'Geri alındı.' }); }
  edOn() { try { return !!tdRead().ingameEditor; } catch (e) { return false; } }
  openEditor() { const v = this.state.view; const tab = v === 'oyuncu' ? 'oy' : v === 'kisi' ? 'pers' : 'kulup'; this.setState({ edOpen: true, edd: {}, edTab: tab, edMsg: '' }); }
  edSave(force) {
    const st = this.state, tab = force || st.edTab || 'kulup', d = st.edd || {}; const msg = (m) => this.setState({ edMsg: m });
    if (tab === 'oy') { const t = this._edTarget; if (!t) return msg('Önce bir oyuncu profili aç.'); const f = {}, o = {}; Object.keys(ED_IDX).forEach(k => { if (d[k] === undefined) return; const tmp = t.row.slice(); edSet(tmp, k, d[k]); const nv = edGet(tmp, k), ov = edGet(t.row, k); if (nv !== ov) { f[k] = nv; o[k] = ov; } });
      if (d.kulup !== undefined && d.kulup.trim() && d.kulup.trim() !== t.club) { const to = this.clubInfo(d.kulup.trim()); if (!to.c) return msg('Bu isimde bir kulüp bulunamadı.'); const rows = rowsOfClub(window.VE_KD[t.c], t.club, t.name).map(x => ({ sec: x.sec, row: x.row.slice() })); if (Object.keys(f).length) this.addOp({ t: 'p', c: t.c, club: t.club, name: t.name, f, o }); return this.addOp({ t: 'mv', c: t.c, club: t.club, name: t.name, toC: to.c, toClub: d.kulup.trim(), rows }); }
      if (!Object.keys(f).length) return msg('Değişiklik yok.'); return this.addOp({ t: 'p', c: t.c, club: t.club, name: t.name, f, o }); }
    if (tab === 'sil') { const t = this._edTarget; if (!t) return msg('Önce bir oyuncu profili aç.'); const rows = rowsOfClub(window.VE_KD[t.c], t.club, t.name).map(x => ({ sec: x.sec, row: x.row.slice() })); this.setState({ view: 'kadro', edOpen: false }); return this.addOp({ t: 'del', c: t.c, club: t.club, name: t.name, rows }); }
    if (tab === 'ozel') { const t = this._edTarget; if (!t) return msg('Önce bir oyuncu profili aç.'); const cur = this._edAttrs || []; const A = cur.map((v, i) => { const nv = d['a_' + ALL_AT[i]]; return nv === undefined ? v : Math.max(1, Math.min(20, Math.round(Number(nv)) || v)); }); if (A.every((v, i) => v === cur[i])) return msg('Değişiklik yok.'); return this.addOp({ t: 'p', c: t.c, club: t.club, name: t.name, f: { A }, o: { A: Array.isArray(t.row[10]) ? t.row[10].slice() : 0 } }); }
    if (tab === 'kulup') { const ct = this._clubTarget; if (!ct) return; const kd = window.VE_KD[ct.c] || {}; const info = (kd.info && kd.info[ct.club]) || {}; const sObj = ct.own ? (this.items[st.mi].pick.s || null) : null; const f = {}, o = {};
      CLUB_F.concat(ct.own && sObj ? CLUB_S : []).forEach(([k, , kind]) => { if (d[k] === undefined) return; const nv = clubVal(d[k], kind); const ov = kind === 'eur' ? sObj[k] : info[k]; if (nv !== ov) { f[k] = nv; o[k] = ov === undefined ? (kind === 't' ? '' : 0) : ov; } }); if (!Object.keys(f).length) return msg('Değişiklik yok.'); return this.addOp({ t: 'club', c: ct.c, club: ct.club, f, o }); }
    if (tab === 'pers') { const t = this._stTarget; if (!t || t.own) return msg('Düzenlemek için bir personel profili aç (Teknik Heyet › kişi).'); const q = t.row; const f = {}, o = {};
      if (d.role !== undefined && d.role !== q[3]) { f.role = d.role; o.role = q[3]; } if (d.uyruk !== undefined && d.uyruk.trim() && d.uyruk.trim() !== q[2]) { f.uyruk = d.uyruk.trim(); o.uyruk = q[2]; } if (d.soz !== undefined && String(d.soz) !== String(q[4])) { f.soz = String(parseInt(d.soz, 10) || q[4]); o.soz = q[4]; } if (d.lisans !== undefined && d.lisans !== q[5]) { f.lisans = d.lisans; o.lisans = q[5]; } if (d.itibar !== undefined && Number(d.itibar) !== Number(q[6])) { f.itibar = Math.max(1, Math.min(20, Math.round(Number(d.itibar)) || q[6])); o.itibar = q[6]; }
      const cur = staffAttrs(q); const A = cur.map((v, i) => { const nv = d['s_' + ST_KEYS[i]]; return nv === undefined ? v : Math.max(1, Math.min(20, Math.round(Number(nv)) || v)); }); if (A.some((v, i) => v !== cur[i])) { f.A = A; o.A = Array.isArray(q[8]) ? q[8].slice() : 0; }
      if (!Object.keys(f).length) return msg('Değişiklik yok.'); return this.addOp({ t: 'st', c: t.c, club: t.club, name: t.name, f, o }); }
    if (tab === 'yeni') { const ct = this._clubTarget; if (!ct) return; const nm = (d.n_ad || '').trim(); if (!nm) return msg('Oyuncu adı gerekli.'); const yr = parseInt(d.n_yil, 10) || 2006; const mevki = ED_POS.indexOf(d.n_mevki) >= 0 ? d.n_mevki : 'Merkez orta saha'; const g = Math.max(1, Math.min(20, Math.round(Number(d.n_guc)) || 10)); const row = [nm, yr, (d.n_uyruk || ct.c).trim(), mevki, ['Sağ', 'Sol', 'İki ayak'].indexOf(d.n_ayak) >= 0 ? d.n_ayak : 'Sağ', g, Math.max(g, Math.min(20, Math.round(Number(d.n_pot)) || g)), Math.round((Number(String(d.n_deger || '1').replace(',', '.')) || 1) * 1e6), String(parseInt(d.n_soz, 10) || 2028), parseInt(d.n_forma, 10) || 0, 0, '', 0, 0, '', 0, 0, '', '', 0, 0]; return this.addOp({ t: 'add', c: ct.c, club: ct.club, row }); }
  }
  edBuild() {
    const st = this.state, tab = st.edTab || 'kulup', d = st.edd || {}; const on = this.edOn(); const set = (k) => (e) => this.setState({ edd: Object.assign({}, this.state.edd, { [k]: e.target.value }) });
    const F = (k, label, cur, o) => Object.assign({ k, label, val: d[k] !== undefined ? d[k] : cur, isIn: true, isSel: false, isHead: false, opts: [], set: set(k) }, o || {});
    const SEL = (k, label, cur, opts) => F(k, label, cur, { isIn: false, isSel: true, opts });
    const HD = (label) => ({ k: 'h' + label, label, isHead: true, isIn: false, isSel: false, opts: [], val: '', set: () => {} });
    let fields = [], cols = 2, note = '', canSave = true, canDel = false;
    if (tab === 'oy') { const t = this._edTarget; if (!t) { note = 'Düzenlemek için bir oyuncu profilini aç (Kadro › oyuncu), sonra Ctrl+E’ye bas.'; canSave = false; } else { note = t.name; fields = Object.keys(ED_IDX).map(k => F(k, ED_LABEL[k], edGet(t.row, k), k === 'mevki' ? { isIn: false, isSel: true, opts: ED_POS } : k === 'ayak' ? { isIn: false, isSel: true, opts: ['Sağ', 'Sol', 'İki ayak'] } : {})).concat([F('kulup', 'Kulüp (transfer için yeni kulüp adı)', t.club)]); canDel = true; } }
    else if (tab === 'ozel') { const t = this._edTarget; if (!t) { note = 'Düzenlemek için bir oyuncu profilini aç.'; canSave = false; } else { cols = 4; note = t.name; const cur = this._edAttrs || []; const gk = t.row[3] === 'Kaleci'; fields = []; [['TEKNİK', AT_TECH], ['ZİHİNSEL', AT_MENT], ['FİZİKSEL', AT_PHYS]].concat(gk ? [['KALECİLİK', AT_GK]] : []).forEach(([h, arr]) => { fields.push(HD(h)); arr.forEach(k => fields.push(F('a_' + k, k, String(cur[ALL_AT.indexOf(k)])))); }); } }
    else if (tab === 'kulup') { const ct = this._clubTarget; const kd = ct && window.VE_KD && window.VE_KD[ct.c]; if (!ct || !kd) { note = 'Kulüp verisi yüklenemedi.'; canSave = false; } else { const info = (kd.info && kd.info[ct.club]) || {}; const sObj = ct.own ? (this.items[st.mi].pick.s || null) : null; note = ct.club; fields = CLUB_F.map(([k, l, kind]) => F(k, l, clubGet(info, null, k, kind))); if (sObj) fields = fields.concat(CLUB_S.map(([k, l, kind]) => F(k, l, clubGet(info, sObj, k, kind)))); } }
    else if (tab === 'pers') { const t = this._stTarget; if (!t || t.own) { note = t && t.own ? 'Kendi teknik direktör kaydın düzenlenemez.' : 'Düzenlemek için bir personel profili aç (Teknik Heyet › kişi).'; canSave = false; } else { cols = 4; const q = t.row; note = q[0]; fields = [SEL('role', 'Görev', q[3], ST_ROLES), F('uyruk', 'Uyruk', q[2]), F('soz', 'Sözleşme bitiş yılı', String(q[4] || '')), SEL('lisans', 'Lisans', q[5], ST_LIC), F('itibar', 'İtibar', String(q[6]))]; const cur = staffAttrs(q); fields.push(HD('ÖZELLİKLER')); ST_KEYS.forEach((k, i) => fields.push(F('s_' + k, k, String(cur[i])))); } }
    else if (tab === 'yeni') { const ct = this._clubTarget; note = ct ? ct.club : ''; fields = [F('n_ad', 'Ad Soyad', ''), F('n_yil', 'Doğum yılı', '2006'), F('n_uyruk', 'Uyruk', ct ? ct.c : ''), SEL('n_mevki', 'Mevki', 'Merkez orta saha', ED_POS), SEL('n_ayak', 'Ayak', 'Sağ', ['Sağ', 'Sol', 'İki ayak']), F('n_guc', 'Güç', '10'), F('n_pot', 'Potansiyel', '12'), F('n_deger', 'Piyasa değeri (milyon €)', '1'), F('n_soz', 'Sözleşme bitiş yılı', '2028'), F('n_forma', 'Forma numarası', '0')]; }
    const G = this.gs(); const list = ((G && G.ops) || []).slice().reverse().map(op => ({ txt: (op.t === 'add' ? 'Yeni oyuncu · ' + op.row[0] : op.t === 'del' ? 'Silindi · ' + op.name : op.t === 'mv' ? 'Transfer · ' + op.name : op.t === 'club' ? 'Kulüp · ' + op.club : op.t === 'st' ? 'Personel · ' + op.name : 'Oyuncu · ' + op.name) + (op.t === 'mv' ? ' → ' + op.toClub : '') , sub: (op.t === 'p' || op.t === 'st' || op.t === 'club') ? Object.keys(op.f).map(k => k === 'A' ? 'Özellikler' : (ED_LABEL[k] || k) + ': ' + op.o[k] + ' → ' + op.f[k]).join(', ') : op.club, undo: () => this.undoOp(op.id) }));
    const TABS = [['oy', 'Oyuncu'], ['ozel', 'Oyuncu özellikleri'], ['kulup', 'Kulüp'], ['pers', 'Personel'], ['yeni', 'Yeni oyuncu'], ['liste', 'Düzenlemeler']];
    return { on, off: !on, tab, isList: tab === 'liste', isForm: tab !== 'liste', tabs: TABS.map(t => ({ label: t[1], bg: tab === t[0] ? 'var(--td-accent,#C8102E)' : 'rgba(var(--td-fg-rgb,255,255,255),0.07)', col: tab === t[0] ? '#fff' : 'var(--td-text2,#DCE2F0)', pick: () => this.setState({ edTab: t[0], edd: {}, edMsg: '' }) })), fields, cols, note, hasNote: !!note, canSave, canDel, msg: st.edMsg || '', hasMsg: !!st.edMsg, list, hasList: list.length > 0, noList: !list.length, save: () => this.edSave(), del: () => this.edSave('sil'), close: () => this.setState({ edOpen: false, edd: {}, edMsg: '' }) };
  }
  openView(view, vp) {
    const cu = this.state; const back = { view: cu.view, vp: cu.vp, psel: cu.psel, psrc: cu.psrc, pclub: cu.pclub, fsel: cu.fsel, ssel: cu.ssel, cg: cu.cg };
    const go = () => this.setState({ view, vp, back, cg: '', tick: this.state.tick + 1 });
    if (vp && vp.c && !(window.VE_KD && window.VE_KD[vp.c])) loadKD(vp.c, () => go()); else go();
  }
  clubInfo(n, c, lg) {
    const k = (window.VE_DUN && window.VE_DUN._kulupler && window.VE_DUN._kulupler[n]) || []; c = c || k[0] || ''; lg = lg || k[1] || '';
    if (c && !lg) { const kd = window.VE_KD && window.VE_KD[c]; if (kd && kd.ligs) Object.keys(kd.ligs).forEach(l => { if (kd.ligs[l].indexOf(n) >= 0) lg = l; }); }
    return { n, c, lg };
  }
  openClub(n, c, lg) { const vp = this.clubInfo(n, c, lg); if (!vp.c) return; this.openView('kulup', vp); }
  openCountry(c) { if (c) this.openView('ulke', { n: '', c, lg: '' }); }
  openLeague(c, lg) { if (c) this.openView('lig', { n: '', c, lg: lg || '' }); }
  openPlayer(x, pclub) { const cu = this.state; const back = { view: cu.view, vp: cu.vp, psel: cu.psel, psrc: cu.psrc, pclub: cu.pclub, fsel: cu.fsel, ssel: cu.ssel, cg: cu.cg }; this.setState({ view: 'oyuncu', psel: x[0], pclub: pclub || null, psrc: cu.kteam || 'A', back, cg: '' }); }
  goBackNav(def) { const b = this.state.back; if (b) this.setState({ view: b.view, vp: b.vp, psel: b.psel, psrc: b.psrc, pclub: b.pclub, fsel: b.fsel, ssel: b.ssel, cg: b.cg, back: null }); else if (this._hist.length) this.goPrev(); else this.setState({ view: def || 'pano', vp: null }); }
  save() { tdSave(GAME_KEY, this.game); }
  model() {
    const st = this.state; const it = this.items[st.mi]; const p = it.pick; const kd = (window.VE_KD && window.VE_KD[p.c]) || null;
    try { this.applyAll(this.gs()); } catch (e) {}
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
    const M = this.model(); const G = this.gs(); let guard = 0; if (G.min === undefined) G.min = DAY_START;
    { const my0 = this.nextMyRound(M, G); const mToday = my0 >= 0 && M.dates[my0] === G.date && !G.sim[my0];
      if (mToday && G.min < koOf(my0)) { G.min = untilMatch ? koOf(my0) : Math.min(koOf(my0), G.min + CLOCK_STEP); this.save(); this.setState({ tick: this.state.tick + 1 }); return; }
      if (!mToday && !untilMatch && G.min + CLOCK_STEP <= DAY_END) { G.min += CLOCK_STEP; this.save(); this.setState({ tick: this.state.tick + 1 }); return; } }
    while (guard++ < MAX_DAYS) {
      const my = this.nextMyRound(M, G);
      const matchToday = my >= 0 && M.dates[my] === G.date;
      if (matchToday && !G.sim[my]) break;
      G.date = addDays(G.date, 1); G.min = DAY_START;
      M.dates.forEach((d, i) => { if (d < G.date && !G.sim[i]) { const mine = M.rounds[i].some(([h, a]) => h === M.p.n || a === M.p.n); if (!mine || G.sim[i] === undefined) this.simRound(M, G, i); } });
      if (!untilMatch && --days <= 0) break;
      const nm = this.nextMyRound(M, G); if (untilMatch && nm >= 0 && M.dates[nm] === G.date) { G.min = koOf(nm); break; }
    }
    this.save(); this.setState({ tick: this.state.tick + 1 });
  }
  nextMyRound(M, G) { for (let i = 0; i < M.rounds.length; i++) { if (G.sim[i]) continue; if (M.rounds[i].some(([h, a]) => h === M.p.n || a === M.p.n)) return i; } return -1; }
  renderVals() {
    const M = this.model(); const G = this.gs(); const { st, it, p, squad, league, rounds, dates } = M; const s = p.s; const has = s !== undefined;
    const my = this.nextMyRound(M, G); const clock = G.min === undefined ? DAY_START : G.min; const matchDay = my >= 0 && dates[my] === G.date && !G.sim[my] && clock >= koOf(my);
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
    const nav = [['pano', 'Ana Sayfa', ''], ['inbox', 'Gelen Kutusu', unread ? String(unread) : ''], ['kadro', 'Kadro', ''], ['heyet', 'Teknik Heyet', ''], ['fikstur', 'Fikstür', ''], ['tablo', 'Tablo', ''], ['finans', 'Finans', ''], ['kulup', 'Kulüp', ''], ['lig', 'Lig', ''], ['ulke', 'Ülke', ''], ['turn', 'Turnuvalar', ''], ['taktik', 'Taktik', 'Yakında'], ['antrenman', 'Antrenman', 'Yakında'], ['transfer', 'Transfer', 'Yakında']].map(n => { const on = st.view === n[0]; const dis = n[2] === 'Yakında'; return { label: n[1], icon: NAV_ICON[n[0]] || NAV_ICON.pano, badge: n[2], pressed: on ? 'true' : 'false', dis: dis ? 'true' : 'false', bar: 'transparent', bg: on ? 'linear-gradient(180deg, #EBCB80, #B88A2E)' : 'transparent', fg: on ? '#1A1305' : (dis ? 'var(--td-mut2,#8C96B2)' : 'var(--td-text,#F4F6FB)'), bd: on ? '#F3DB9C' : 'transparent', cur: dis ? 'not-allowed' : 'pointer', pick: () => { if (!dis) this.setState({ view: n[0], vp: null, back: null, cg: '', rep: null }); } }; });
    const vlist = { kisi: 1, pano: 1, inbox: 1, kadro: 1, fikstur: 1, tablo: 1, finans: 1, kulup: 1, lig: 1, ulke: 1, turn: 1 };
    const msgRows = vis.map((m, i) => ({ from: m.from, date: fmtShort(m.date), subject: m.subject, weight: G.read[m.id] ? '500' : '800', pressed: i === mi ? 'true' : 'false', bar: !G.read[m.id] ? 'var(--td-accent,#C8102E)' : 'transparent', bg: i === mi ? 'rgba(var(--td-fg-rgb,255,255,255),0.06)' : 'transparent', pick: () => { G.read[m.id] = 1; this.save(); this.setState({ msg: i }); } }));
    if (cur && !G.read[cur.id] && st.view === 'inbox') { G.read[cur.id] = 1; this.save(); }
    const team = st.kteam || 'A'; const pool = poolOf(M.kd, p, team); const fq = (st.fq || '').toLocaleLowerCase('tr-TR');
    const ageR = { '19': [0, 19], '23': [20, 23], '29': [24, 29], '30': [30, 99] }; const thisYear = 2026;
    let fl = pool.filter(x => (!st.kpos10 || x[3] === st.kpos10) && (!st.kpos || POS_GROUP[x[3]] === st.kpos) && (!st.kage || (2026 - x[1] >= ageR[st.kage][0] && 2026 - x[1] <= ageR[st.kage][1])) && (!st.knat || (st.knat === 'yerli' ? x[2] === p.c : x[2] !== p.c)) && (!st.kcon || (st.kcon === 'bu' ? Number(x[8]) <= thisYear : st.kcon === 'bir' ? Number(x[8]) === thisYear + 1 : Number(x[8]) >= thisYear + 2)) && (!st.kpow || (st.kpow === '16' ? x[5] >= 16 : st.kpow === '13' ? x[5] >= 13 && x[5] <= 15 : st.kpow === '10' ? x[5] >= 10 && x[5] <= 12 : x[5] < 10)) && (!fq || (x[0] + ' ' + x[2] + ' ' + (x[17] || '')).toLocaleLowerCase('tr-TR').indexOf(fq) >= 0));
    const SK = { no: x => x[9] || 0, name: x => x[0], pos: x => POS_ORDER[x[3]], age: x => -x[1], nat: x => x[2], pow: x => x[5], pot: x => x[6], val: x => x[7] || 0, end: x => Number(x[8]) || 0 };
    if (st.ksort && SK[st.ksort]) { const f = SK[st.ksort], d = st.kdir || 1; fl = fl.slice().sort((a, b) => { const x = f(a), y = f(b); return (typeof x === 'string' ? x.localeCompare(y, 'tr') : x - y) * d || (b[5] - a[5]); }); }
    else fl = fl.slice().sort((a, b) => (POS_ORDER[a[3]] - POS_ORDER[b[3]]) || (b[5] - a[5]));
    const sorted = fl;
    const heads = [['no', '#'], ['name', 'OYUNCU'], ['pos', 'MEVKİ'], ['age', 'YAŞ'], ['nat', 'UYRUK'], ['pow', 'GÜÇ'], ['pot', 'POT.'], ['val', 'DEĞER'], ['end', 'SÖZLEŞME']].map(h => ({ l: h[1], arrow: st.ksort === h[0] ? ((st.kdir || 1) > 0 ? ' ▲' : ' ▼') : '', col: st.ksort === h[0] ? 'var(--td-text,#F4F6FB)' : 'var(--td-mut2,#8C96B2)', pick: () => this.setState({ ksort: h[0], kdir: st.ksort === h[0] ? -(st.kdir || 1) : ((h[0] === 'name' || h[0] === 'pos' || h[0] === 'nat' || h[0] === 'end') ? 1 : -1) }) }));
    const chip = (label, on, fn, cnt) => ({ label, cnt: cnt === undefined ? '' : String(cnt), bg: on ? 'var(--td-accent,#C8102E)' : 'rgba(var(--td-fg-rgb,255,255,255),0.07)', col: on ? '#fff' : 'var(--td-text2,#DCE2F0)', pick: fn });
    const mkG = (title, key, opts, curKey, onPick) => { const curV = curKey === 'kteam' ? team : (st[key] || ''); const op = opts.find(o => o[0] === curV) || opts[0]; const open = st.fopen === key; return { title, cur: op[1], open, active: curKey === 'kteam' ? false : !!curV, toggle: () => this.setState({ fopen: open ? '' : key }), chips: opts.map(o => ({ label: o[1], cnt: '', bg: o[0] === curV ? 'rgba(var(--td-accent-rgb,200,16,46),0.28)' : 'transparent', col: 'var(--td-text,#F4F6FB)', pick: () => onPick(o[0]) })) }; };
    const grpOf = (title, key, opts) => mkG(title, key, opts, key, (v) => this.setState({ [key]: v, fopen: '' }));
    const fgroups = [
      mkG('TAKIM', 'kteam', TEAM_LIST.map(t => [t[0], t[1] + ' (' + poolOf(M.kd, p, t[0]).length + ')']), 'kteam', (v) => this.setState({ kteam: v, ksort: '', fopen: '' })),
      grpOf('MEVKİ GRUBU', 'kpos', [['', 'Hepsi'], ['Kaleci', 'Kaleci'], ['Defans', 'Defans'], ['Orta saha', 'Orta saha'], ['Forvet', 'Forvet']]),
      grpOf('MEVKİ', 'kpos10', [['', 'Hepsi'], ['Kaleci', 'Kaleci'], ['Stoper', 'Stoper'], ['Sağ bek', 'Sağ bek'], ['Sol bek', 'Sol bek'], ['Ön libero', 'Ön libero'], ['Merkez orta saha', 'Merkez orta saha'], ['Ofansif orta saha', 'Ofansif orta saha'], ['Sağ kanat', 'Sağ kanat'], ['Sol kanat', 'Sol kanat'], ['Santrfor', 'Santrfor']]),
      grpOf('YAŞ', 'kage', [['', 'Tüm yaşlar'], ['19', '19 ve altı'], ['23', '20–23'], ['29', '24–29'], ['30', '30+']]),
      grpOf('UYRUK', 'knat', [['', 'Hepsi'], ['yerli', 'Yerli'], ['yabanci', 'Yabancı']]),
      grpOf('SÖZLEŞME', 'kcon', [['', 'Hepsi'], ['bu', 'Bu sezon biten'], ['bir', 'Gelecek yıl biten'], ['uzun', 'Uzun vadeli']]),
      grpOf('GÜÇ', 'kpow', [['', 'Hepsi'], ['16', '16+'], ['13', '13–15'], ['10', '10–12'], ['0', '10 altı']])
    ];
    const anyF = !!(st.kpos10 || st.kpos || st.kage || st.knat || st.kcon || st.kpow || st.fq);
    const clearF = () => this.setState({ fopen: '', kpos10: '', kpos: '', kage: '', knat: '', kcon: '', kpow: '', fq: '' });
    const squadRows = sorted.map(x => ({ pick: () => this.openPlayer(x, null), no: x[9] || '', name: x[0], pos: x[3], age: 2026 - x[1], nat: x[2], pow: x[5], pot: x[6], col: powCol(x[5]), val: x[7] ? money(x[7]) : '—', end: x[8] || '—' }));
    const fixKey = (f) => f.i + '|' + f.h + '|' + f.a;
    const fixtures = myFix.map((f, i) => { const done = !!G.sim[f.i]; const r = G.res[fixKey(f)]; const mine = f.h === p.n ? 0 : 1; let res = '', col = 'var(--td-text3,#C9D0E2)', ico = '', icoBg = 'transparent'; if (done && r) { res = r[0] + ' – ' + r[1]; const d = mine === 0 ? r[0] - r[1] : r[1] - r[0]; col = d > 0 ? 'var(--td-green,#4FB286)' : d < 0 ? 'var(--td-accent2,#FF6B76)' : 'var(--td-gold,#F2C14E)'; ico = d > 0 ? '✓' : d < 0 ? '✕' : '='; icoBg = d > 0 ? 'var(--td-green,#4FB286)' : d < 0 ? '#E5484D' : '#E5B93C'; } const selI = st.fsel >= 0 ? st.fsel : -1; return { n: i + 1, date: fmtDate(f.date), time: hhmm(koOf(f.i)), lg: p.lg || '—', home: f.h, away: f.a, res, col, ico, icoBg, hasIco: !!ico, bg: i === selI ? 'rgba(var(--td-fg-rgb,255,255,255),0.10)' : f.i === my ? 'rgba(var(--td-accent-rgb,200,16,46),0.10)' : 'transparent', pick: () => this.setState({ fsel: i, rep: null }), goH: () => this.openClub(f.h, p.c, p.lg), goA: () => this.openClub(f.a, p.c, p.lg) }; });
    const playedIdx = myFix.map((f, i) => i).filter(i => G.sim[myFix[i].i] && G.res[fixKey(myFix[i])]);
    const fsi = (st.fsel >= 0 && playedIdx.indexOf(st.fsel) >= 0) ? st.fsel : (playedIdx.length ? playedIdx[playedIdx.length - 1] : -1);
    let fd = { has: false, title: '', score: '', goals: [], stats: [], cards: [], motm: '', note: '' };
    if (fsi >= 0) {
      const f = myFix[fsi], r = G.res[fixKey(f)]; const gm = genMatch(fixKey(f), f.h, f.a, r[0], r[1], M.kd, M.strength(f.h), M.strength(f.a));
      fd = { has: true, title: f.h + ' – ' + f.a, score: r[0] + ' – ' + r[1], sub: fmtDate(f.date) + ' · ' + (p.lg || ''), home: f.h, away: f.a,
        goals: gm.goals.map(g => ({ min: g.min + "'", who: g.who, ast: g.ast ? '(' + g.ast + ')' : '', club: g.club, score: g.score, col: g.side === 'h' ? 'var(--td-accent2,#FF6B76)' : 'var(--td-blue,#8FB8FF)', pick: () => this.setState({ rep: Object.assign(replayOf(g, fixKey(f)), { open: true }) }) })),
        cards: gm.cards.map(c => ({ min: c.min + "'", who: c.who, club: c.club, ico: c.red ? '🟥' : '🟨' })), stats: gm.stats, motm: gm.motm,
        noGoals: !gm.goals.length, noCards: !gm.cards.length, note: 'Dakikalar, golcüler ve istatistikler sonuçtan türetilmiş özettir (maç motoru olay kaydı yok).' };
    }

    const tb = {}; league.forEach(n => { tb[n] = { n, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }; });
    Object.keys(G.res).forEach(k => { const [r, h, a] = k.split('|'); const [x, y] = G.res[k]; if (!tb[h] || !tb[a]) return; tb[h].p++; tb[a].p++; tb[h].gf += x; tb[h].ga += y; tb[a].gf += y; tb[a].ga += x; if (x > y) { tb[h].w++; tb[a].l++; } else if (x < y) { tb[a].w++; tb[h].l++; } else { tb[h].d++; tb[a].d++; } });
    const table = Object.values(tb).map(t => Object.assign(t, { pts: t.w * 3 + t.d, gd: t.gf - t.ga })).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.n.localeCompare(b.n)).map((t, i) => ({ pick: () => this.openClub(t.n, p.c, p.lg), pos: i + 1, name: t.n, w: t.n === p.n ? '800' : '500', bg: t.n === p.n ? 'rgba(var(--td-accent-rgb,200,16,46),0.12)' : 'transparent', p: t.p, w2: t.w, d: t.d, l: t.l, gf: t.gf, ga: t.ga, gd: (t.gd > 0 ? '+' : '') + t.gd, pts: t.pts }));
    const myPos = table.findIndex(r => r.name === p.n) + 1;
    const nx = my >= 0 ? { opp: rounds[my].find(([h, a]) => h === p.n || a === p.n).filter(x => x !== p.n)[0], home: rounds[my].find(([h]) => h === p.n) ? true : false, date: dates[my] } : null;
    const finRows = has ? [{ label: 'MALİ DURUM', value: FIN[s.fin], color: FIN_COLOR[s.fin] }, { label: 'TRANSFER BÜTÇESİ', value: money(s.tr), color: 'var(--td-text,#F4F6FB)' }, { label: 'MAAŞ BÜTÇESİ', value: money(s.wg) + ' / ay', color: 'var(--td-text,#F4F6FB)' }, { label: 'YÖNETİMİN SABRI', value: PAT_LABEL[s.pat], color: 'var(--td-text,#F4F6FB)' }] : [];
    const tabs = this.items.map((x, i) => { const on = i === st.mi; return { name: x.name, pressed: on ? 'true' : 'false', border: on ? 'var(--td-accent,#C8102E)' : 'rgba(var(--td-fg-rgb,255,255,255),0.14)', bg: on ? 'rgba(var(--td-accent-rgb,200,16,46),0.14)' : 'transparent', pick: () => { this.setState({ mi: i, msg: 0, view: 'inbox' }); this.loadFor(i); } }; });
    const out = {
      crestBg: 'hsl(' + hue + ' 52% 34%)', crestText: initialsOf(p.n), clubName: p.n, 
      tabs, goPrev: () => this.goPrev(), mgrInit: String((this.items[st.mi].name || 'M')).trim().slice(0, 1).toLocaleUpperCase('tr-TR'), hasUnread: unread > 0, goInbox: () => this.setState({ view: 'inbox', vp: null, back: null }), mainBd: (st.view === 'pano' && !st.panoOld) ? 'none' : '1px solid rgba(var(--td-fg-rgb,255,255,255),0.12)', mainBg: (st.view === 'pano' && !st.panoOld) ? 'transparent' : 'rgba(var(--td-panel-rgb,15,21,41),0.78)', backOp: this._hist.length > 0 ? '1' : '0.4', hasTabs: this.items.length > 1, dateText: fmtDate(G.date), timeText: hhmm(clock), matchDay, notMatchDay: !matchDay,
      simMatch: () => { this.simRound(M, G, my); G.date = addDays(G.date, 1); G.min = DAY_START; M.dates.forEach((d, i) => { if (d < G.date && !G.sim[i]) this.simRound(M, G, i); }); this.save(); this.setState({ view: 'fikstur', tick: st.tick + 1 }); },
      nextDay: () => this.advance(1, false), toMatch: () => this.advance(0, true),
      nav, noData: st.loaded && !squad.length, vInbox: st.view === 'inbox', vKadro: st.view === 'kadro', vFikstur: st.view === 'fikstur', vHeyet: st.view === 'heyet', vTablo: st.view === 'tablo', vFinans: st.view === 'finans',
      msgs: msgRows, hasMsg: !!cur, cur: cur || { from: '', subject: '', paras: [], facts: [], hasFacts: false },
      edit: this.edBuild(),
    edOpen: !!st.edOpen, edited: !!G.edited, edBtn: this.edOn(), openEd: () => this.openEditor(), fd, hasFd: fd.has, noFd: !fd.has, rep: st.rep && st.rep.open ? st.rep : null, hasRep: !!(st.rep && st.rep.open), closeRep: () => this.setState({ rep: null }), squad: squadRows, noSquad: !squadRows.length, heads, fgroups, anyF, clearF, fq: st.fq || '', setFq: (e) => this.setState({ fq: e.target.value }), shown: squadRows.length + ' / ' + pool.length, fixtures, noFix: !fixtures.length, table, fin: finRows, noFin: !has,
      hasNext: !!nx, noNext: !nx, next: nx ? { opp: nx.opp, where: nx.home ? 'Ev sahibi' : 'Deplasman', date: fmtDate(nx.date) + ' · ' + hhmm(koOf(nx.i)), days: diffDays(G.date, nx.date) <= 0 ? 'Bugün' : diffDays(G.date, nx.date) + ' gün sonra' } : { opp: '', where: '', date: '', days: '' },
      summary: [{ k: 'Takım gücü (en iyi 11)', v: avg11 ? avg11.toFixed(1) : '—' }, { k: 'Lig sırası', v: myPos && league.length ? myPos + ' / ' + league.length : '—' }, { k: 'Kadro', v: squad.length ? String(squad.length) : '—' }, { k: 'Sezon hedefi', v: has ? EXP_LABEL[s.exp] : '—' }, { k: 'Kıtasal', v: (contOf(p.n).map(x => x.t.ad).slice(0, 2).join(', ')) || contProj((M.kd && M.kd.ulke) || {}, league.map(n => [n, M.strength(n)]).sort((a, b) => b[1] - a[1]).findIndex(x => x[0] === p.n) + 1) || '—' }]
    };
    return Object.assign(out, this.extra(M, G, { squad, table, myFix, avg11, lines, best, ages, has, s, my, myPos, league, rounds, dates }));
  }
  extra(M, G, c) {
    const st = this.state, v = st.view; const vpOn = !!(st.vp && (v === 'kulup' || v === 'lig' || v === 'ulke')); const p = vpOn ? st.vp : M.p; const kd = vpOn ? ((window.VE_KD && window.VE_KD[st.vp.c]) || null) : M.kd; const info = (kd && kd.info && kd.info[p.n]) || {}; const ulk = (kd && kd.ulke) || {}; const tur = window.VE_TUR || [];
    const s = vpOn ? undefined : c.s, has = vpOn ? false : c.has; const squad = vpOn ? ((kd && kd.clubs && kd.clubs[p.n]) || []) : c.squad; const LG = vpOn ? ((kd && kd.ligs && kd.ligs[p.lg]) || []) : c.league;
    const N = (x) => (x === undefined || x === null || x === '') ? null : x;
    const row = (k, val) => N(val) === null ? null : { k, v: String(val) };
    const rowsOf = (arr) => arr.filter(Boolean);
    const bar = (label, val, max, color) => N(val) === null ? null : { label, val: String(val), pct: Math.max(3, Math.min(100, val / max * 100)) + '%', color: color || powCol(val * 20 / max) };
    const it = (a, b, cc, o) => Object.assign({ a: String(a), b: String(b), c: cc === undefined ? '' : String(cc), w: '500', bg: 'transparent', cur: 'default', pick: () => {} }, o || {});
    const card = (title, o) => Object.assign({ title, chips: [], rows: [], bars: [], items: [], note: '', span: 'auto' }, o || {});
    const out = { cols: 3, hasKpis: false, kpis: [], cards: [], vPano: v === 'pano' && !st.panoOld, gridCols: (v === 'pano' && !st.panoOld) ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) 240px', asideDisp: (v === 'pano' && !st.panoOld) ? 'none' : 'flex', backPano: () => this.setState({ panoOld: false }), isOldPano: v === 'pano' && !!st.panoOld, vCards: (v === 'pano' && !!st.panoOld) || v === 'kulup' || v === 'lig' || v === 'ulke' || v === 'oyuncu' || v === 'kisi', headLinks: [], backLabel: 'Kadroya dön', cgroups: [], hasCg: false, hasHead: false, headTitle: '', headSub: '', goBack: () => this.setState({ view: 'kadro' }), staffRows: [], hTabs: [], hHeads: [], noStaff: false, vTurn: v === 'turn', tq: st.tq || '', setTq: (e) => this.setState({ tq: e.target.value }), tList: [], tTitle: '', tCards: [],
      tModes: [['tur', 'Turnuvalar'], ['odul', 'Ödüller'], ['derbi', 'Derbiler'], ['sehir', 'Şehirler'], ['bolge', 'Bölgeler'], ['medya', 'Medya'], ['sakatlik', 'Sakatlıklar'], ['hava', 'Hava durumu'], ['para', 'Para birimleri'], ['dil', 'Diller'], ['kita', 'Kıtalar'], ['tanim', 'Tanımlar'], ['etap', 'Etap isimleri'], ['sozlesme', 'Sözleşme türleri']].map(t => ({ label: t[1], cnt: '', bg: (st.tmode || 'tur') === t[0] ? 'var(--td-accent,#C8102E)' : 'rgba(var(--td-fg-rgb,255,255,255),0.07)', col: (st.tmode || 'tur') === t[0] ? '#fff' : 'var(--td-text2,#DCE2F0)', pick: () => this.setState({ tmode: t[0], tq: '' }) })), goKulup: () => this.setState({ view: 'kulup', vp: null, back: null, cg: '' }), goLig: () => this.setState({ view: 'lig', vp: null, back: null, cg: '' }), goUlke: () => this.setState({ view: 'ulke', vp: null, back: null, cg: '' }), ligName: M.p.lg || '—', ulkeName: M.p.c || '—', mgrName: this.items[st.mi].name };
    const neutral = 'rgba(var(--td-fg-rgb,255,255,255),0.08)', fg = 'var(--td-text,#F4F6FB)';
    const stad = (kd && kd.stad && kd.stad[p.n]) || {}; const fin = (x) => x ? money(x / 55.93) : null;
    const ROLE = ['Başkan', 'Sportif direktör', 'Teknik direktör', 'Yardımcı antrenör', 'Kaleci antrenörü', 'Kondisyoner', 'Analist', 'Fizyoterapist', 'Doktor', 'Gözlemci', 'Altyapı sorumlusu'];
    const mg = this.items[st.mi]; const ma = (mg && mg.m) || {}; const myear = parseInt(String(ma.dogum || ma.dogumTarihi || '').slice(-4), 10);
    const meRow = vpOn ? null : [mg ? mg.name : 'Menajer', myear > 1900 ? myear : 0, ma.uyruk || ma.ulke || '—', 'Teknik direktör', '', ma.lisans || '—', ma.itibar || '—', ''];
    const staffSorted = (meRow ? [meRow] : []).concat(((kd && kd.staff && kd.staff[p.n]) || []).filter(q => q[3] !== 'Teknik direktör')).sort((a, b) => (ROLE.indexOf(a[3]) < 0 ? 99 : ROLE.indexOf(a[3])) - (ROLE.indexOf(b[3]) < 0 ? 99 : ROLE.indexOf(b[3])) || b[6] - a[6]);
    const lineBars = c.lines.map(l => bar(l[0], l[1].toFixed(1), 20, powCol(l[1])));
    const lgRec = tur.find(t => t.ad === p.lg && t.ulke === p.c) || null;
    const lgIdx = lgRec ? tur.indexOf(lgRec) : -1;
    const openT = (idx) => () => this.setState({ view: 'turn', tsel: idx });
    const winners = (txt, max) => String(txt || '').split('\n').filter(Boolean).slice(0, max || 40).map(l => { const q = l.split(' · '); return it(q[0] || '', q[1] || '', q[2] || ''); });
    const fmtMoney = (x, pb) => (pb === '₺' || !pb) ? money(x / 55.93) : Number(x).toLocaleString() + ' ' + pb;
    if (v !== 'oyuncu') this._edTarget = null;
    if (v !== 'kisi') this._stTarget = null;
    this._clubTarget = p.n ? { c: p.c, club: p.n, own: !vpOn } : { c: M.p.c, club: M.p.n, own: true };
    const contL = contOf(p.n);
    const projTxt = vpOn ? '' : contProj(ulk, (c.league || []).map(n => [n, M.strength(n)]).sort((a, b) => b[1] - a[1]).findIndex(x => x[0] === p.n) + 1);
    const contCard = () => card('KITASAL TURNUVALAR', { rows: projTxt ? [{ k: 'Güç sırasına göre hak', v: projTxt }] : [], items: contL.map(x => it(x.t.kita || 'Kıtasal', x.t.ad, x.t.tur, { cur: 'pointer', pick: openT(x.i) })), note: contL.length ? '' : (info.hd_kitasal ? 'Kıtasal hedef: ' + info.hd_kitasal : 'Bu kulüp kıtasal turnuva katılımcı listesinde yok.') });
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
      const upcoming = c.myFix.filter(f => !G.sim[f.i]).slice(0, 5).map(f => it(fmtShort(f.date), f.h === p.n ? f.a : f.h, f.h === p.n ? 'Ev' : 'Dep', { cur: 'pointer', pick: () => this.openClub(f.h === p.n ? f.a : f.h, p.c, p.lg) }));
      const near = (() => { const i = Math.max(0, Math.min(c.table.length - 7, c.myPos - 4)); return c.table.slice(i, i + 7).map(r => it(r.pos, r.name, r.pts + ' P', { cur: 'pointer', pick: () => this.openClub(r.name, p.c, p.lg), w: r.name === p.n ? '800' : '500', bg: r.name === p.n ? 'rgba(var(--td-accent-rgb,200,16,46),0.14)' : 'transparent' })); })();
      const top = squad.slice().sort((a, b) => b[5] - a[5]).slice(0, 8).map(x => it(x[5], x[0], x[3], { cur: 'pointer', pick: () => this.openPlayer(x, null) }));
      const bk = [['≤20', 0, 20], ['21–23', 21, 23], ['24–26', 24, 26], ['27–29', 27, 29], ['30–32', 30, 32], ['33+', 33, 99]].map(b => ({ l: b[0], n: c.ages.filter(a => a >= b[1] && a <= b[2]).length })); const mx = Math.max(1, ...bk.map(b => b.n));
      const nat = {}; squad.forEach(x => { nat[x[2]] = (nat[x[2]] || 0) + 1; }); const home = nat[p.c] || 0; const natTop = Object.keys(nat).sort((a, b) => nat[b] - nat[a]).slice(0, 5);
      const ends = squad.filter(x => x[8]).sort((a, b) => a[8] - b[8]).slice(0, 6).map(x => it(x[8], x[0], x[5], { cur: 'pointer', pick: () => this.openPlayer(x, null) }));
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
        contCard(),
        card('YÖNETİM BEKLENTİSİ', { rows: rowsOf([has ? row('Sezon hedefi', EXP_LABEL[s.exp]) : null, row('Ulusal kupa hedefi', info.hd_kupa), row('Kıtasal hedef', info.hd_kitasal), has ? row('Yönetimin sabrı', PAT_LABEL[s.pat]) : null, row('Mali hedef', info.hd_mali), row('Transfer politikası', info.hd_transfer)]) })
      ];
    } else if (v === 'kulup') {
      out.cols = 2;
      const colors = [info.e_ana, info.e_ikinci].filter(Boolean).map(x => ({ t: x, bg: x, fg: '#FFFFFF' }));
      const keys = [['ku_lig', 'Lig şampiyonluğu'], ['ku_kupa', 'Ulusal kupa'], ['ku_superkupa', 'Süper kupa'], ['ku_kitasal', 'Kıtasal kupa'], ['ku_dunya', 'Dünya kulüpler kupası']];
      out.cards = [
        card('KİMLİK', { chips: colors, rows: rowsOf([row('Kuruluş', info.kurulus), row('Şehir', info.sehir), row('Stadyum', info.stadyum), row('Kapasite', info.kapasite ? Number(info.kapasite).toLocaleString() : null), row('Ortalama seyirci', info.tf_ortSeyirci ? Number(info.tf_ortSeyirci).toLocaleString() : null), row('Ezeli rakip', info.rakip), row('İtibar', info.itibar ? info.itibar + ' / 20' : null), row('Mali durum', info.maliDurum)]) }),
card('FİNANS', { rows: rowsOf([row('Mali durum', info.maliDurum), row('Kasa bakiyesi', fin(info.bakiye)), row('Toplam borç', fin(info.borc)), row('1 yıl içinde vadesi gelen borç', fin(info.kisaBorc)), row('Borç faizi', info.faiz ? '%' + info.faiz : null), row('Mali kısıtlama', info.kisitlama), row('Transfer bütçesi', fin(info.transfer)), row('Maaş bütçesi', info.maasButce ? fin(info.maasButce) + ' / ay' : null), row('Yayın geliri (yıllık)', fin(info.yayin)), row('Sponsor geliri (yıllık)', fin(info.sponsor)), row('Bilet geliri (yıllık)', fin(info.bilet)), row('Zengin sahip / yatırımcı', info.zengin)]) }),
        card('STADYUM', { rows: rowsOf([row('Ad', stad.ad || info.stadyum), row('Kapasite', (stad.kapasite || info.kapasite) ? Number(stad.kapasite || info.kapasite).toLocaleString() : null), row('Koltuklu kapasite', stad.oturmali ? Number(stad.oturmali).toLocaleString() : null), row('Zemin', stad.zemin), row('Çatı', stad.cati), row('Saha ölçüsü (m)', stad.boyut), row('Açılış yılı', stad.acilis), row('UEFA kategorisi', stad.uefa), row('Mülkiyet', stad.sahip), row('Zemin ısıtması', stad.isitma), row('Sponsorlu ad', stad.sponsorAd), row('Ortalama seyirci', (stad.ortSeyirci || info.tf_ortSeyirci) ? Number(stad.ortSeyirci || info.tf_ortSeyirci).toLocaleString() : null), row('Rekor seyirci', stad.rekSeyirci ? Number(stad.rekSeyirci).toLocaleString() : null)]), bars: [bar('Ev sahibi avantajı', stad.avantaj, 20), bar('Atmosfer', stad.atmosfer, 20)].filter(Boolean) }),
        card('TESİSLER VE YÖNETİM', { rows: rowsOf([row('Yönetim profili', info.profil), row('Taraftar beklentisi', info.taraftar), row('Tanınırlık', info.tanin), row('İtibar', info.itibar ? info.itibar + ' / 20' : null)]), bars: [bar('Antrenman tesisi', info.tesis, 20), bar('Altyapı', info.altyapi, 20), bar('Gözlemci ağı', info.gozlem, 20)].filter(Boolean) }),
        card('TEKNİK HEYET', { items: staffSorted.slice(0, 10).map(q => it(q[3], q[0], q[5] === 'Yok' ? '' : q[5])), note: staffSorted.length > 10 ? '+' + (staffSorted.length - 10) + ' kişi' : '' }),
        card('KUPALAR', { rows: keys.filter(k => info[k[0]]).map(k => ({ k: k[1], v: String(info[k[0]]) })).concat(String(info.kupaGecmisi || '').split('\n').filter(Boolean).map(l => { const q = l.split(' · '); return { k: q[0], v: q.slice(1).join(' · ') }; })) }),
        card('REKORLAR', { rows: rowsOf([row('En büyük galibiyet', info.rkGalibiyet), row('En ağır yenilgi', info.rkYenilgi), row('En çok maç', info.rkMacOyuncu), row('En çok gol', info.rkGolOyuncu), row('Sezonda en çok gol', info.rkSezonGol), row('Sezonda en çok puan', info.rkSezonPuan), row('Rekor seyirci', info.rkSeyirci ? Number(info.rkSeyirci).toLocaleString() : null), row('Rekor transfer (alınan)', info.rkTransferAlinan), row('Rekor transfer (satılan)', info.rkTransferSatilan), row('En uzun yenilmezlik', info.rkYenilmez), row('En uzun galibiyet serisi', info.rkSeri)]) }),
        card('TARAFTAR', { rows: rowsOf([row('Taraftar sayısı (milyon)', info.tf_sayi), row('Organize gruplar', info.tf_ultra), row('Kimlik', info.tf_kimlik), row('Sosyal medya (milyon)', info.tf_sosyal)]), bars: [bar('Tribün atmosferi', info.tf_atmosfer, 20), bar('Sadakat', info.tf_sadakat, 20), bar('Yönetime baskı', info.tf_baski, 20), bar('Genç taraftar', info.tf_genc, 20), bar('Deplasman desteği', info.tf_deplasman, 20)].filter(Boolean) }),
        card('TAKTİKSEL ÖZELLİKLER', { rows: rowsOf([row('Diziliş', info.tk_dizilis), row('Oyun stili', info.tk_stil), row('Hücum yönü', info.tk_hucum), row('Felsefe', info.tk_felsefe)]), bars: [bar('Tempo', info.tk_tempo, 20), bar('Pres', info.tk_pres, 20), bar('Savunma hattı', info.tk_cizgi, 20), bar('Genişlik', info.tk_genislik, 20), bar('Set parçası', info.tk_setparca, 20)].filter(Boolean) }),
        card('KULÜP HEDEFLERİ', { rows: rowsOf([row('Lig hedefi', info.hd_ana), row('Ulusal kupa hedefi', info.hd_kupa), row('Kıtasal hedef', info.hd_kitasal), row('Mali hedef', info.hd_mali), row('Transfer politikası', info.hd_transfer), row('Hedef puan', info.hd_puan), row('Yönetim sabrı (sezon)', info.hd_sabir), row('Uzun vadeli plan', info.hd_plan)]) }),
        card('AKADEMİ', { rows: rowsOf([row('Ad', info.ak_ad), row('Kuruluş', info.ak_kurulus), row('Sporcu sayısı', info.ak_sporcu), row('Yaş grupları', info.ak_yaslar), row('Okul / eğitim', info.ak_okul), row('Öne çıkan yetişenler', info.ak_mezun)]), bars: [bar('Öğretim kalitesi', info.ak_kalite, 20), bar('Antrenör kadrosu', info.ak_antrenor, 20), bar('Tesis kalitesi', info.ak_tesis, 20)].filter(Boolean) }),
        contCard(),
        card('KITASAL KUPA PUANLARI', { rows: rowsOf([row('5 sezon toplamı', info.ksToplam), row('En iyi derece', info.ksEnIyi), row('Son 10 yılda katılım', info.ksKatilim)]), bars: ['2025/26', '2024/25', '2023/24', '2022/23', '2021/22'].map((z, i) => bar(z, info['ks_' + i], 30, 'var(--td-blue,#8FB8FF)')).filter(Boolean) })
      ].filter(cd => cd.rows.length || cd.bars.length || cd.items.length || cd.chips.length);
      if (vpOn && squad.length) out.cards.unshift(card('KADRO', { items: squad.slice().sort((a, b) => b[5] - a[5]).slice(0, 14).map(x => it(x[5], x[0], x[3], { cur: 'pointer', pick: () => this.openPlayer(x, { n: p.n, c: p.c }) })), note: squad.length > 14 ? '+' + (squad.length - 14) + ' oyuncu' : '' }));
      if (!out.cards.length) out.cards = [card('KULÜP', { note: 'Bu kulüp için ayrıntılı bilgi yok.' })];
    } else if (v === 'lig') {
      out.cols = 2;
      const lg = lgRec || {};
      out.cards = [
        card('LİG BİLGİSİ', { rows: rowsOf([row('Lig', p.lg), row('Ülke', p.c), row('Kademe', lg.kademe), row('İtibar', lg.itibar ? lg.itibar + ' / 20' : null), row('Takım sayısı', lg.takim || LG.length), row('Format', lg.devre), row('Doğrudan yükselen', lg.dogrudan), row('Play-off ile yükselen', lg.playoff), row('Düşen', lg.dusen), row('Şampiyonluk ödülü', lg.odul ? fmtMoney(lg.odul, lg.odulPB) : null), row('Video hakem', lg.var), row('Katılım', lg.katilim)]) }),
        card('REKORLAR', { rows: rowsOf([row('En çok şampiyon olan', lg.trk_enCokSampiyon), row('En büyük galibiyet', lg.trk_enBuyukGalibiyet), row('Tüm zamanların en çok gol atanı', lg.trk_enCokGolAtan), row('En çok maça çıkan', lg.trk_enCokMac), row('Bir edisyonda en çok gol', lg.trk_sezonGol), row('Bir takımın en çok puanı', lg.trk_sezonPuan), row('En yüksek seyirci', lg.trk_enCokSeyirci ? Number(lg.trk_enCokSeyirci).toLocaleString() : null)]) }),
        card('GEÇMİŞ KAZANANLAR', { items: winners(lg.gecmisKazananlar, 40), note: lg.gecmisKazananlar ? 'Yıl · şampiyon · ikinci' : 'Geçmiş kazananlar verisi yok.', span: 'auto' }),
        card('TAKIMLAR', { chips: LG.map(n => ({ t: n, bg: n === p.n ? 'rgba(var(--td-accent-rgb,200,16,46),0.25)' : neutral, fg, pick: () => this.openClub(n, p.c, p.lg) })) })
      ].filter(cd => cd.rows.length || cd.bars.length || cd.items.length || cd.chips.length || cd.note);
    } else if (v === 'heyet') {
      const hteam = st.hteam || 'club'; const hlist = hteam === 'free' ? ((kd && kd.sfree) || []).slice().sort((a, b) => b[6] - a[6]) : staffSorted;
      out.hTabs = [['club', 'Kulüp personeli', staffSorted.length], ['free', 'Serbest personel', ((kd && kd.sfree) || []).length]].map(t => ({ label: t[1], cnt: String(t[2]), bg: hteam === t[0] ? 'var(--td-accent,#C8102E)' : 'rgba(var(--td-fg-rgb,255,255,255),0.07)', col: hteam === t[0] ? '#fff' : 'var(--td-text2,#DCE2F0)', pick: () => this.setState({ hteam: t[0] }) }));
      const HS = { name: q => q[0], role: q => (ROLE.indexOf(q[3]) < 0 ? 99 : ROLE.indexOf(q[3])), age: q => -(q[1] || 0), nat: q => q[2], lic: q => String(q[5]), rep: q => Number(q[6]) || 0, end: q => Number(q[4]) || 0 };
      const hl2 = st.hsort && HS[st.hsort] ? hlist.slice().sort((x, y) => { const a1 = HS[st.hsort](x), b1 = HS[st.hsort](y); return (typeof a1 === 'string' ? a1.localeCompare(b1, 'tr') : a1 - b1) * (st.hdir || 1); }) : hlist;
      out.hHeads = [['name', 'İSİM'], ['role', 'GÖREV'], ['age', 'YAŞ'], ['nat', 'UYRUK'], ['lic', 'LİSANS'], ['rep', 'İTİBAR'], ['end', 'SÖZLEŞME']].map(h => ({ l: h[1], arrow: st.hsort === h[0] ? ((st.hdir || 1) > 0 ? ' ▲' : ' ▼') : '', col: st.hsort === h[0] ? 'var(--td-text,#F4F6FB)' : 'var(--td-mut2,#8C96B2)', pick: () => this.setState({ hsort: h[0], hdir: st.hsort === h[0] ? -(st.hdir || 1) : ((h[0] === 'rep') ? -1 : 1) }) }));
      out.staffRows = hl2.map(q => ({ name: q[0], role: q[3], age: q[1] ? 2026 - q[1] : '—', nat: q[2], lic: q[5], rep: q[6], col: powCol(q[6]), end: q[4] || '—', pick: () => { const cu = this.state; this.setState({ view: 'kisi', ssel: q[0], back: { view: cu.view, vp: cu.vp, hsort: cu.hsort }, cg: '' }); }, goN: () => this.openCountry(q[2]) })); out.noStaff = !out.staffRows.length;
    } else if (v === 'kisi') {
      const q = ((kd && kd.staff && kd.staff[p.n]) || []).concat((kd && kd.sfree) || []).find(z => z[0] === st.ssel) || (st.ssel === (this.items[st.mi] || {}).name ? meRow : null);
      if (q) {
        this._stTarget = { c: p.c, club: ((kd && kd.staff && kd.staff[p.n]) || []).indexOf(q) >= 0 ? p.n : 'Serbest', name: q[0], row: q, own: q === meRow };
        out.hasHead = true; out.headTitle = q[0]; out.headSub = q[3] + ' · ' + (q[1] ? (2026 - q[1]) + ' yaş · ' : '') + q[2];
        const sa = staffAttrs(q); const gp = (a0, b0) => ST_KEYS.slice(a0, b0).map((k, i) => bar(k, sa[a0 + i], 20));
        out.cols = 3; out.cards = [card('KİMLİK', { rows: rowsOf([row('Ad Soyad', q[0]), row('Görev', q[3]), row('Doğum yılı', q[1] || null), row('Yaş', q[1] ? 2026 - q[1] : null), row('Uyruk', q[2]), row('Tanınırlık', q[7])]) }), card('SÖZLEŞME VE LİSANS', { rows: rowsOf([row('Sözleşme bitişi', q[4]), row('Lisans', q[5])]) }), card('İTİBAR', { bars: [bar('İtibar', q[6], 20)].filter(Boolean) }), card('ANTRENÖRLÜK', { bars: gp(0, 5).filter(Boolean) }), card('YÖNETİM', { bars: gp(5, 9).filter(Boolean) }), card('DEĞERLENDİRME', { bars: gp(9, 12).filter(Boolean) })];
      } else out.cards = [card('KİŞİ', { note: 'Kişi bulunamadı.' })];
    } else if (v === 'oyuncu') {
      const pcl = st.pclub; const kdP = pcl ? ((window.VE_KD && window.VE_KD[pcl.c]) || null) : kd; const x = (pcl ? ((kdP && kdP.clubs && kdP.clubs[pcl.n]) || []) : poolOf(kd, p, st.psrc || 'A')).find(z => z[0] === st.psel) || (pcl ? null : allPools(kd, p).find(z => z[0] === st.psel)) || null;
      if (x) {
        const age = 2026 - x[1]; const gen = genAttrs(x[0], x[3], x[5], age); const real = Array.isArray(x[10]) ? x[10] : null; const ks = AT_TECH.concat(AT_MENT, AT_PHYS, AT_GK);
        const A = {}; ks.forEach((k, i) => { A[k] = (real && real[i] > 0) ? real[i] : gen[k]; });
        this._edTarget = { c: pcl ? pcl.c : p.c, club: pcl ? pcl.n : p.n, name: x[0], row: x }; this._edAttrs = ALL_AT.map(k => A[k]); out.hasHead = true; out.headTitle = x[0]; out.headSub = x[3] + ' · ' + age + ' yaş · ' + x[2]; out.headLinks = [{ label: pcl ? pcl.n : p.n, pick: () => this.openClub(pcl ? pcl.n : p.n, pcl ? pcl.c : p.c, '') }, { label: x[2], pick: () => this.openCountry(x[2]) }].concat(x[18] && x[18] !== x[2] ? [{ label: x[18], pick: () => this.openCountry(x[18]) }] : []);
        out.hasKpis = true;
        out.kpis = [{ label: 'GÜÇ', value: String(x[5]), color: powCol(x[5]), sub: '1–20' }, { label: 'POTANSİYEL', value: String(x[6]), color: powCol(x[6]), sub: '1–20' }, { label: 'DEĞER', value: x[7] ? money(x[7]) : '—', color: fg, sub: 'piyasa değeri' }, { label: 'SÖZLEŞME', value: x[8] || '—', color: fg, sub: 'bitiş yılı' }, { label: 'AYAK', value: x[4], color: fg, sub: 'tercih' }, { label: 'FORMA', value: x[9] ? '#' + x[9] : '—', color: fg, sub: 'numara' }];
        const grp = (title, arr) => card(title, { bars: arr.map(k => bar(k, A[k], 20)).filter(Boolean) });
        const hist = String(x[11] || '').split('\n').filter(Boolean).map(l2 => { const q = l2.split(' · '); return it(q[0] || '', q[1] || '', q[2] || ''); });
        const ex = (x[20] && typeof x[20] === 'object') ? x[20] : {}; const dvx = Array.isArray(ex.dv) ? ex.dv : [];
        const MEVL = ['Kaleci', 'Stoper', 'Sağ bek', 'Sol bek', 'Ön libero', 'Merkez orta saha', 'Ofansif orta saha', 'Sağ kanat', 'Sol kanat', 'Santrfor'];
        const NEAR = { 0: [], 1: [4, 2, 3], 2: [3, 7, 5], 3: [2, 8, 5], 4: [1, 5], 5: [4, 6], 6: [5, 7, 8, 9], 7: [2, 8, 6, 9], 8: [3, 7, 6, 9], 9: [6, 7, 8] };
        const own = MEVL.indexOf(x[3]); const mvA = Array.isArray(x[19]) && x[19].some(v => v > 0) ? x[19] : null;
        const mvBars = MEVL.map((m, i) => bar(m, mvA ? (mvA[i] > 0 ? mvA[i] : 3) : (i === own ? 20 : ((NEAR[own] || []).indexOf(i) >= 0 ? 13 : (own === 0 || i === 0 ? 2 : 7))), 20)).filter(Boolean);
        const itb = Math.max(1, Math.min(20, Math.round(x[5] * 0.9))); const tan = x[5] >= 15 ? 'Dünya çapında' : x[5] >= 13 ? 'Kıtasal' : x[5] >= 10 ? 'Ulusal' : x[5] >= 7 ? 'Bölgesel' : 'Yerel';
        const ret = team0 => team0 === 'RET'; const isRet = (st.psrc === 'RET');
        const maasAy = x[7] ? Math.max(268, Math.round(x[7] * 0.008 / 100) * 100) : 0;
        const idRows = rowsOf([row('Ad Soyad', x[0]), row('Lakap', x[17]), row('Doğum yılı', x[1]), row('Yaş', age), row('Uyruk', x[2]), row('İkinci uyruk', x[14]), row('Mevki', x[3]), row('Tercih edilen ayak', x[4]), row('Boy', x[15] ? x[15] + ' cm' : null), row('Kilo', x[16] ? x[16] + ' kg' : null), row('Forma numarası', x[9] ? '#' + x[9] : null), row('Milli takım', x[18])]);
        const moneyRows = rowsOf([row('Piyasa değeri', x[7] ? money(x[7]) : null), row('Aylık maaş (tahmini)', maasAy ? money(maasAy) : null), row('Serbest kalma bedeli (tahmini)', x[7] ? money(x[7] * 2) : null), row('Sözleşme bitişi', x[8]), row('Kiralık kulüp', ex.kt), row('Kiralık bitişi', ex.kb), row('Kiralık maaşı', ex.km ? money(ex.km) : null)]);
        const repBars = [bar('Ülke itibarı', itb, 20), bar('Dünya itibarı', Math.max(1, itb - 4), 20), bar('Oyundaki itibar', itb, 20)].filter(Boolean);
        const dv = [['Öfke kontrolü', dvx[0] || 12], ['Olay çıkarma eğilimi', dvx[1] || 6], ['Küfür etme', 6], ['Rakibe saldırma', 6], ['Hakeme itiraz', 6], ['Kasıtlı faul', dvx[2] || 6], ['Rakibi tahrik etme', 6], ['Seyirciyle tartışma', 6], ['Kırmızı kart eğilimi', 6]].map(a2 => bar(a2[0], a2[1], 20, a2[0] === 'Öfke kontrolü' ? undefined : 'var(--td-accent2,#FF6B76)'));
        const tr = [['Pres yapmayı sever', 10], ['Uzun topu tercih eder', 10], ['Kısa pası tercih eder', 10], ['Kanatlara açılır', 10], ['Uzaktan şut eğilimi', 10], ['Top sürme eğilimi', 10], ['Takım içi liderlik', 10], ['Büyük maç oyuncusu', dvx[3] || 10], ['Riskli pas eğilimi', 10]].map(a2 => bar(a2[0], a2[1], 20));
        const planRows = rowsOf([row('Emeklilik sonrası plan', 'Teknik direktör'), row('Yedek plan', 'TV yorumcusu'), row('Tanınırlık', tan), isRet ? row('Son kulübü', x[21]) : null, isRet ? row('Emeklilik yılı', x[22]) : null]);
        out.cards = [card('KİMLİK', { rows: idRows }), card('SÖZLEŞME VE PARA', { rows: moneyRows }), card('İTİBAR VE TANINIRLIK', { bars: repBars, rows: planRows }), grp('TEKNİK', AT_TECH), grp('ZİHİNSEL', AT_MENT), grp('FİZİKSEL', AT_PHYS)].concat(x[3] === 'Kaleci' ? [grp('KALECİLİK', AT_GK)] : [], [
          card('MEVKİ SKORLARI', { bars: mvBars }), card('SAHA İÇİ DAVRANIŞ', { bars: dv, note: dvx.length ? '' : 'Kişisel davranış değerleri editördeki varsayılanlardır.' }), card('OYUN TERCİHLERİ', { bars: tr, note: 'Taktik tercihleri editördeki varsayılan değerlerdir.' }),
          card('KARİYER GEÇMİŞİ', { items: hist, note: hist.length ? '' : 'Kariyer geçmişi verisi yok (bu oyuncu otomatik üretildi).', span: '1 / -1' }),
          card('MİLLİ TAKIM', { rows: x[12] ? [{ k: 'A milli maç', v: String(x[12]) }, { k: 'A milli gol', v: String(x[13] || 0) }] : [], note: x[12] ? '' : 'A milli takıma çıkmadı.' })
        ]);
      } else out.cards = [card('OYUNCU', { note: 'Oyuncu bulunamadı.' })];
    } else if (v === 'ulke') {
      out.cols = 2;
      const lgs = tur.map((t, i) => ({ t, i })).filter(x => x.t.ulke === p.c && (x.t.tur === 'Lig' || x.t.tur === 'Yabancı lig')).sort((a, b) => (a.t.kademe || 99) - (b.t.kademe || 99));
      const cups = tur.map((t, i) => ({ t, i })).filter(x => x.t.ulke === p.c && (x.t.tur === 'Ulusal kupa' || x.t.tur === 'Süper kupa'));
      const clubsN = Object.keys((kd && kd.info) || {}).length;
      out.cards = [
        card('ÜLKE BİLGİSİ', { rows: rowsOf([row('Ülke', p.c), row('Konfederasyon', ulk.konf), row('Ülke sıralaması', ulk.sira), row('Katsayı puanı', ulk.puan), row('FIFA sırası', ulk.fifaSira), row('FIFA puanı', ulk.fifaPuan), row('Futbol itibarı', ulk.itibar ? ulk.itibar + ' / 20' : null), row('Oyuncular için çekicilik', ulk.cekicilik ? ulk.cekicilik + ' / 20' : null), row('Çifte vatandaşlık', ulk.cifte), row('Kayıtlı kulüp sayısı', clubsN || null)]) }),
        card('KITASAL KONTENJAN', { rows: rowsOf([row('Şampiyonlar Ligi', ulk.sl), row('Avrupa Ligi', ulk.al), row('Konferans Ligi', ulk.kl)]) }),
        card('YABANCI OYUNCU KURALLARI', { rows: rowsOf([row('Kadroda yabancı sınırı', ulk.kadroYabanci), row('Sahada yabancı sınırı', ulk.sahaYabanci), row('Kimler yabancı sayılır', ulk.kimlerYabanci), row('Yerli oyuncu şartı', ulk.yerliSart), row('Alt ligler', ulk.altLig)]) }),
        card('LİGLER', { items: lgs.map(x => it('Kademe ' + (x.t.kademe || '—'), x.t.ad, x.t.takim ? x.t.takim + ' takım' : '', { cur: 'pointer', pick: () => this.openLeague(p.c, x.t.ad), w: x.t.ad === p.lg ? '800' : '500' })), note: lgs.length ? 'Ayrıntı için bir lige tıkla.' : (kd ? '' : 'Bu ülke için veri yok.') }),
        card('KUPALAR', { items: cups.map(x => it(x.t.tur, x.t.ad, x.t.takim ? x.t.takim + ' takım' : '', { cur: 'pointer', pick: openT(x.i) })) }),
        card('REGEN (ALT YAPIDAN GENÇLER)', { rows: rowsOf([row('Çıkış tarihi', ulk.regenTarih), row('Kulüp başına yıllık', ulk.regenSayi), row('Kalite', ulk.regenKalite ? ulk.regenKalite + ' / 20' : null), row('Yaş', ulk.regenYas)]) })
      ].filter(cd => cd.rows.length || cd.items.length || cd.chips.length);
    } else if (v === 'turn' && (st.tmode || 'tur') !== 'tur') {
      const DUN = window.VE_DUN || {}; const mode = st.tmode; const recs = DUN[mode] || []; const LB = (DUN._lbl && DUN._lbl[mode]) || {};
      const lab = (k) => { const l = LB[k] || k; return l.replace(/\s*\(.*?\)\s*$/, '').toLocaleLowerCase('tr-TR').replace(/^./, c => c.toLocaleUpperCase('tr-TR')); };
      const q = (st.tq || '').toLocaleLowerCase('tr-TR');
      const nm = (r) => r.ad || r.baslik || '';
      let hit = recs.map((r, i) => i); if (q) hit = hit.filter(i => JSON.stringify(recs[i]).toLocaleLowerCase('tr-TR').indexOf(q) >= 0);
      else if (mode === 'derbi' || mode === 'sehir' || mode === 'bolge') hit.sort((a, b) => ((recs[b].ulke === p.c) - (recs[a].ulke === p.c)));
      const sel = (st.dsel !== undefined && st.dsel >= 0 && st.dsel < recs.length && st.dmode === mode) ? st.dsel : (hit[0] !== undefined ? hit[0] : -1);
      out.tList = hit.slice(0, 120).map(i => { const r = recs[i]; const on = i === sel; return { isHead: false, isItem: true, title: '', name: nm(r), sub: [r.tur, r.ulke, r.kapsam].filter(Boolean).join(' · '), pressed: on ? 'true' : 'false', bar: on ? 'var(--td-accent,#C8102E)' : 'transparent', bg: on ? 'rgba(var(--td-accent-rgb,200,16,46),0.12)' : 'transparent', pick: () => this.setState({ dsel: i, dmode: mode }) }; });
      if (sel >= 0) {
        const r = recs[sel]; out.tTitle = nm(r); const rows = []; const items = [];
        Object.keys(r).forEach(k => { if (k === 'ad' || k === 'baslik' || k === 'kaynakNot') return; const val = r[k]; if (k === 'gecmisKazananlar' || String(val).indexOf('\n') >= 0) { String(val).split('\n').filter(Boolean).forEach(l2 => { const qq = l2.split(' · '); items.push(it(qq[0] || '', qq[1] || '', qq[2] || '')); }); } else rows.push({ k: lab(k), v: String(val) }); });
        out.tCards = [card('GENEL', { rows }), card('KAYITLAR', { items: items.slice(0, 150), note: items.length > 150 ? '+' + (items.length - 150) : '' }), card('KAYNAK', { note: r.kaynakNot || '' })].filter(cd => cd.rows.length || cd.items.length || cd.note);
      } else out.tCards = [card('GENEL', { note: 'Kayıt yok.' })];
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
    if (v === 'kulup' || v === 'ulke') {
      const DUN = window.VE_DUN || {};
      if (v === 'kulup') { const ds = (DUN.derbi || []).filter(d => d.takim1 === p.n || d.takim2 === p.n); if (ds.length) out.cards.push(card('DERBİLER', { items: ds.map(d => { const opp = d.takim1 === p.n ? d.takim2 : d.takim1; return it(d.onem || '—', opp, d.tur || '', { cur: 'pointer', pick: () => this.openClub(opp, d.ulke, '') }); }) })); }
      else {
        const ds = (DUN.derbi || []).filter(d => d.ulke === p.c); if (ds.length) out.cards.push(card('DERBİLER', { items: ds.slice(0, 12).map(d => it(d.takim1, d.takim2, String(d.onem || '—'), { cur: 'pointer', pick: () => this.openClub(d.takim1, d.ulke, '') })), note: ds.length > 12 ? '+' + (ds.length - 12) : '' }));
        const bs = (DUN.bolge || []).filter(d => d.ulke === p.c); if (bs.length) out.cards.push(card('BÖLGELER', { items: bs.slice(0, 12).map(d => it(d.ad, '', '')), note: bs.length > 12 ? '+' + (bs.length - 12) : '' }));
        const ss = (DUN.sehir || []).filter(d => d.ulke === p.c); if (ss.length) out.cards.push(card('ŞEHİRLER', { chips: ss.slice(0, 40).map(d => ({ t: d.ad, bg: neutral, fg })), note: ss.length > 40 ? '+' + (ss.length - 40) : '' }));
      }
    }
    if (vpOn) { out.hasHead = true; out.headTitle = p.n || p.lg || p.c; out.headSub = [v === 'kulup' ? (p.lg || '') : '', p.c].filter(Boolean).join(' · '); out.headLinks = v === 'kulup' ? [{ label: p.lg || '—', pick: () => this.openLeague(p.c, p.lg) }, { label: p.c, pick: () => this.openCountry(p.c) }] : (v === 'lig' ? [{ label: p.c, pick: () => this.openCountry(p.c) }] : []); }
    if (out.hasHead) { out.goBack = () => this.goBackNav('kadro'); out.backLabel = st.back ? 'Geri' : 'Kadroya dön'; }
    if (v === 'pano') {
      const total = squad.reduce((a, x) => a + (x[7] || 0), 0);
      const wageTRY = has ? s.wg * 55.93 : (info.maasButce ? info.maasButce / 12 : 0);
      const incTRY = ((Number(info.yayin) || 0) + (Number(info.sponsor) || 0) + (Number(info.bilet) || 0)) / 12;
      const lvl = (x) => !x ? '—' : x >= 15 ? 'Yüksek' : x >= 9 ? 'Orta' : 'Düşük';
      const stars = Math.max(0, Math.min(5, Math.round((Number(info.itibar) || 0) / 4)));
      const nx = c.myFix.filter(f => !G.sim[f.i])[0]; const opp = nx ? (nx.h === p.n ? nx.a : nx.h) : '';
      const crestOf = (n2) => ({ bg: 'hsl(' + (hash(n2) % 360) + ' 52% 34%)', t: initialsOf(n2) });
      const oi = c.table.findIndex(r => r.name === p.n); const st0 = Math.max(0, Math.min(c.table.length - 5, oi - 2));
      const lrows = c.table.slice(st0, st0 + 5).map(r => ({ pos: r.pos, name: r.name, o: r.p, g: r.w2, b: r.d, m: r.l, av: r.gd, pts: r.pts, bg: r.name === p.n ? 'linear-gradient(90deg, #E8C777, #C9A040)' : 'transparent', fg: r.name === p.n ? '#1A1305' : 'var(--td-text,#F4F6FB)', w: r.name === p.n ? '800' : '500', pick: () => this.openClub(r.name, p.c, p.lg) }));
      const parts = String(info.tk_dizilis || '4-3-3').split('-').map(Number).filter(n => n > 0); const lines = [1].concat(parts.length ? parts : [4, 3, 3]); const dots = [];
      lines.forEach((m, i) => { for (let j = 0; j < m; j++) dots.push({ cx: Math.round((j + 1) * 100 / (m + 1)), cy: Math.round(56 - i * (46 / Math.max(1, lines.length - 1))), fill: i === 0 ? '#F2C14E' : '#B3202E' }); });
      const played = c.myFix.filter(f => G.sim[f.i] && G.res[f.i + '|' + f.h + '|' + f.a]).slice(-5);
      const form = played.map(f => { const r = G.res[f.i + '|' + f.h + '|' + f.a]; const d = f.h === p.n ? r[0] - r[1] : r[1] - r[0]; return { t: d > 0 ? 'G' : d < 0 ? 'M' : 'B', bg: d > 0 ? '#2E9E5B' : d < 0 ? '#E5484D' : '#6B7280' }; });
      while (form.length < 5) form.push({ t: '–', bg: 'rgba(var(--td-fg-rgb,255,255,255),0.10)' });
      const top3 = squad.slice().sort((a, b) => b[5] - a[5]).slice(0, 3).map(x => ({ no: x[9] || '', init: initialsOf(x[0]), name: x[0], pos: x[3], pow: x[5], bg: 'hsl(' + (hash(x[0]) % 360) + ' 40% 32%)', col: powCol(x[5]), pick: () => this.openPlayer(x, null) }));
      const go = (vw) => () => this.setState({ view: vw, vp: null, back: null, cg: '' });
      out.pano = {
        crestBg: 'hsl(' + (hash(p.n) % 360) + ' 52% 34%)', crestText: initialsOf(p.n), club: p.n, lg: p.lg || '—',
        kpis: [{ k: 'Kadro değeri', v: total ? money(total) : '—', c: 'rgba(104,80,210,0.55)', bd: 'rgba(150,130,255,0.65)', ic: '#B7A8FF', icon: NAV_ICON.kadro }, { k: 'Maaş gideri', v: wageTRY ? money(wageTRY / 55.93) + ' / ay' : '—', c: 'rgba(30,140,80,0.5)', bd: 'rgba(80,200,130,0.6)', ic: '#7FE0A8', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v12 M15 9.5a3 2.5 0 0 0-3-1.5c-1.7 0-3 .9-3 2s1.3 2 3 2 3 .9 3 2-1.3 2-3 2a3 2.5 0 0 1-3-1.5' }, { k: 'Bütçe', v: has ? money(s.tr) : (info.transfer ? fin(info.transfer) : '—'), c: 'rgba(30,110,214,0.5)', bd: 'rgba(100,170,255,0.65)', ic: '#8FC0FF', icon: 'M18 20V10 M12 20V4 M6 20v-6' }, { k: 'Kulüp itibarı', v: '★'.repeat(stars) + '☆'.repeat(5 - stars), c: 'rgba(224,176,80,0.38)', bd: 'rgba(224,176,80,0.75)', ic: '#F3DB9C', icon: NAV_ICON.lig }],
        venue: (info.stadyum ? info.stadyum : '') + (info.kapasite ? ' (' + Number(info.kapasite).toLocaleString() + ')' : ''), hasVenue: !!info.stadyum, incPct: (incTRY || wageTRY) ? Math.round(incTRY / Math.max(incTRY, wageTRY) * 100) + '%' : '0%', expPct: (incTRY || wageTRY) ? Math.round(wageTRY / Math.max(incTRY, wageTRY) * 100) + '%' : '0%', hasNext: !!nx, noNext: !nx, opp, oppBg: crestOf(opp || '?').bg, oppT: crestOf(opp || '?').t, nextWhen: nx ? fmtDate(nx.date) + ' · ' + hhmm(koOf(nx.i)) : '', nextWhere: nx ? (nx.h === p.n ? 'Ev sahibi' : 'Deplasman') : '', nextRound: nx ? String(c.myFix.indexOf(nx) + 1) : '', goFix: go('fikstur'),
        lrows, goTab: go('tablo'),
        form: info.tk_dizilis || '4-3-3', dots, style: info.tk_stil || '—', pres: lvl(Number(info.tk_pres)), tempo: lvl(Number(info.tk_tempo)), goClub: go('kulup'),
        ready: String(squad.length), total: String(squad.length), goKadro: go('kadro'),
        formChips: form, goFin: go('finans'),
        bank: info.bakiye ? fin(info.bakiye) : '—', inc: incTRY ? fin(incTRY) : '—', exp: wageTRY ? fin(wageTRY) : '—', net: (incTRY && wageTRY) ? ((incTRY - wageTRY) >= 0 ? '+' : '−') + fin(Math.abs(incTRY - wageTRY)) : '—', netCol: (incTRY - wageTRY) >= 0 ? 'var(--td-green,#4FB286)' : 'var(--td-accent2,#FF6B76)',
        top3, up: c.myFix.filter(f => !G.sim[f.i]).slice(0, 3).map(f => ({ date: fmtShort(f.date), init: initialsOf(f.h === p.n ? f.a : f.h), bg: 'hsl(' + (hash(f.h === p.n ? f.a : f.h) % 360) + ' 50% 34%)', opp: f.h === p.n ? f.a : f.h, ha: f.h === p.n ? '(E)' : '(D)', lg: p.lg || '—', pick: () => this.openClub(f.h === p.n ? f.a : f.h, p.c, p.lg) })),
        detail: () => this.setState({ panoOld: true, cg: '' })
      };
    }
    // ekrana sığacak şekilde kart grupları
    const GM = { pano: { 'FORM VE SIRADAKİ MAÇLAR': 'Genel', 'LİG TABLOSU': 'Genel', 'EN İYİ OYUNCULAR': 'Genel', 'KITASAL TURNUVALAR': 'Genel', 'KUPA VİTRİNİ': 'Genel', 'YÖNETİM BEKLENTİSİ': 'Genel', 'HATLARA GÖRE GÜÇ': 'Kadro', 'YAŞ DAĞILIMI': 'Kadro', 'UYRUK DAĞILIMI': 'Kadro', 'SÖZLEŞMELER': 'Kadro', 'BÜTÇE VE TESİSLER': 'Kadro' },
      kulup: { 'KADRO': 'Kimlik', 'KİMLİK': 'Kimlik', 'FİNANS': 'Kimlik', 'STADYUM': 'Kimlik', 'TESİSLER VE YÖNETİM': 'Kimlik', 'TEKNİK HEYET': 'Tarihçe', 'KUPALAR': 'Tarihçe', 'REKORLAR': 'Tarihçe', 'TARAFTAR': 'Tarihçe', 'TAKTİKSEL ÖZELLİKLER': 'Hedef ve oyun', 'KULÜP HEDEFLERİ': 'Hedef ve oyun', 'AKADEMİ': 'Hedef ve oyun', 'KITASAL KUPA PUANLARI': 'Hedef ve oyun', 'KITASAL TURNUVALAR': 'Hedef ve oyun', 'DERBİLER': 'Hedef ve oyun' },
      oyuncu: { 'KİMLİK': 'Genel', 'SÖZLEŞME VE PARA': 'Genel', 'İTİBAR VE TANINIRLIK': 'Genel', 'TEKNİK': 'Özellikler', 'ZİHİNSEL': 'Özellikler', 'FİZİKSEL': 'Özellikler', 'KALECİLİK': 'Özellikler', 'MEVKİ SKORLARI': 'Davranış', 'SAHA İÇİ DAVRANIŞ': 'Davranış', 'OYUN TERCİHLERİ': 'Davranış', 'KARİYER GEÇMİŞİ': 'Kariyer', 'MİLLİ TAKIM': 'Kariyer' } };
    out.cgroups = [];
    if (GM[v] && !(v === 'pano' && !st.panoOld)) { const names = []; out.cards.forEach(cd => { const g = GM[v][cd.title] || 'Diğer'; if (names.indexOf(g) < 0) names.push(g); }); const sel = names.indexOf(st.cg) >= 0 ? st.cg : names[0];
      out.cgroups = names.length > 1 ? names.map(n => ({ label: n, cnt: '', bg: n === sel ? 'var(--td-accent,#C8102E)' : 'rgba(var(--td-fg-rgb,255,255,255),0.07)', col: n === sel ? '#fff' : 'var(--td-text2,#DCE2F0)', pick: () => this.setState({ cg: n }) })) : [];
      out.cards = out.cards.filter(cd => (GM[v][cd.title] || 'Diğer') === sel); out.hasCg = out.cgroups.length > 0; if (v === 'oyuncu') { out.cards.forEach(cd => { if (cd.span === '1 / -1') cd.span = 'auto'; }); if (out.cards.length === 4) out.cols = 4; } }
    return out;
  }
}
