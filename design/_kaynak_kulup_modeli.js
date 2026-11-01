// ===== Kulüp modeli (ortak): gerçek hayattaki itibar + türetilen finans, tesis ve beklenti değerleri =====
// REAL: kendi değerlendirmem (1–20); listede olmayan kulüpler ülke itibarı, kademe ve stadyum büyüklüğünden tahmin edilir.
const CM_REAL = {
  'Türkiye': { 'Galatasaray': 16, 'Fenerbahçe': 16, 'Beşiktaş': 14, 'Trabzonspor': 13, 'Başakşehir': 11, 'Göztepe': 10, 'Samsunspor': 10, 'Konyaspor': 9, 'Kasımpaşa': 9, 'Çaykur Rizespor': 9, 'Alanyaspor': 9, 'Eyüpspor': 8, 'Gaziantep FK': 8, 'Gençlerbirliği': 8, 'Amedspor': 8, 'Kocaelispor': 7, 'Çorum FK': 6, 'Erzurumspor FK': 6,
    'Antalyaspor': 8, 'Bursaspor': 8, 'Kayserispor': 8, 'Sivasspor': 8, 'Fatih Karagümrük': 7, 'İstanbulspor': 6, 'Bodrum FK': 6, 'Boluspor': 6, 'Manisa FK': 6, 'Pendikspor': 6, 'Ümraniyespor': 6, 'Bandırmaspor': 5, 'Esenler Erokspor': 5, 'Keçiörengücü': 5, 'Sarıyer': 5, 'Vanspor FK': 5, 'Batman Petrolspor': 4, 'Iğdır FK': 4, 'Mardin 1969': 4, 'Muğlaspor': 4 },
  'İngiltere': { 'Manchester City': 20, 'Arsenal': 19, 'Liverpool': 19, 'Manchester United': 18, 'Chelsea': 18, 'Tottenham Hotspur': 17, 'Newcastle United': 16, 'Aston Villa': 16, 'Brighton & Hove Albion': 13, 'Everton': 13, 'Bournemouth': 12, 'Brentford': 12, 'Crystal Palace': 12, 'Fulham': 12, 'Leeds United': 12, 'Nottingham Forest': 12, 'Sunderland': 10, 'Coventry City': 9, 'Ipswich Town': 9, 'Hull City': 8 },
  'İspanya': { 'Real Madrid': 20, 'Barcelona': 20, 'Atlético Madrid': 18, 'Athletic Bilbao': 14, 'Real Betis': 14, 'Real Sociedad': 14, 'Sevilla': 14, 'Valencia': 14, 'Villarreal': 14, 'Celta Vigo': 11, 'Espanyol': 10, 'Osasuna': 10, 'Getafe': 9, 'Rayo Vallecano': 9, 'Alavés': 8, 'Deportivo A Coruña': 8, 'Elche': 8, 'Levante': 8, 'Málaga': 8, 'Racing Santander': 7 },
  'İtalya': { 'Inter Milan': 19, 'Juventus': 18, 'AC Milan': 18, 'Napoli': 17, 'Atalanta': 16, 'Roma': 16, 'Lazio': 15, 'Bologna': 13, 'Fiorentina': 13, 'Como': 11, 'Torino': 11, 'Genoa': 10, 'Udinese': 10, 'Cagliari': 9, 'Parma': 9, 'Sassuolo': 9, 'Lecce': 8, 'Monza': 8, 'Venezia': 8, 'Frosinone': 7 },
  'Almanya': { 'Bayern Munich': 20, 'Borussia Dortmund': 18, 'Bayer Leverkusen': 17, 'RB Leipzig': 16, 'Eintracht Frankfurt': 14, 'VfB Stuttgart': 14, 'SC Freiburg': 12, 'Borussia Mönchengladbach': 12, 'Union Berlin': 11, 'Werder Bremen': 11, 'Hamburger SV': 11, 'TSG Hoffenheim': 11, '1. FC Köln': 11, 'Schalke 04': 11, 'Mainz 05': 10, 'FC Augsburg': 9, 'SV Elversberg': 6, 'SC Paderborn': 6 },
  'Fransa': { 'Paris Saint-Germain': 19, 'Marseille': 15, 'Lyon': 14, 'Monaco': 14, 'Lille': 13, 'Lens': 12, 'Nice': 12, 'Rennes': 12, 'Strasbourg': 11, 'Brest': 9, 'Toulouse': 9, 'Auxerre': 8, 'Lorient': 8, 'Paris FC': 8, 'Angers': 7, 'Le Havre': 7, 'Troyes': 7, 'Le Mans': 6 },
  'Hollanda': { 'Ajax': 16, 'PSV Eindhoven': 16, 'Feyenoord': 15, 'AZ': 12, 'Twente': 10, 'Utrecht': 9, 'Go Ahead Eagles': 8, 'Groningen': 8, 'Heerenveen': 8, 'NEC': 8, 'Sparta Rotterdam': 8, 'PEC Zwolle': 7, 'ADO Den Haag': 6, 'Excelsior': 6, 'Fortuna Sittard': 6, 'Willem II': 6, 'Cambuur': 5, 'Telstar': 5 },
  'Portekiz': { 'Benfica': 16, 'Porto': 16, 'Sporting CP': 16, 'Braga': 13, 'Vitória de Guimarães': 10, 'Famalicão': 8, 'Estoril': 7, 'Gil Vicente': 7, 'Rio Ave': 7, 'Arouca': 6, 'Casa Pia': 6, 'Estrela da Amadora': 6, 'Marítimo': 6, 'Moreirense': 6, 'Nacional': 6, 'Santa Clara': 6, 'Alverca': 5, 'Académico de Viseu': 4 },
  'Belçika': { 'Club Brugge': 14, 'Anderlecht': 13, 'Antwerp': 11, 'Genk': 11, 'Gent': 11, 'Standard Liège': 11, 'Union SG': 11, 'Cercle Brugge': 8, 'Charleroi': 7, 'Mechelen': 7, 'OH Leuven': 7, 'Sint-Truiden': 7, 'Westerlo': 7, 'Kortrijk': 6, 'Zulte Waregem': 6, 'Beveren': 5, 'Lommel': 5, 'La Louvière': 4 },
  'İskoçya': { 'Celtic': 14, 'Rangers': 13, 'Aberdeen': 9, 'Heart of Midlothian': 9, 'Hibernian': 8, 'Dundee United': 7, 'Motherwell': 7, 'Dundee': 6, 'Kilmarnock': 6, 'Falkirk': 5, 'St Johnstone': 5, 'St Mirren': 5 },
  'Avusturya': { 'Red Bull Salzburg': 13, 'Rapid Wien': 10, 'Sturm Graz': 10, 'LASK': 8, 'Austria Wien': 8, 'Wolfsberger AC': 7, 'SV Ried': 5, 'TSV Hartberg': 5, 'Grazer AK': 5, 'WSG Tirol': 4, 'Rheindorf Altach': 4, 'Austria Lustenau': 4 },
  'İsviçre': { 'BSC Young Boys': 10, 'FC Basel': 10, 'Grasshopper Club Zurich': 7, 'FC Zürich': 7, 'FC Lugano': 7, 'Servette FC': 7, 'FC Sion': 7, 'FC St. Gallen': 7, 'FC Lausanne-Sport': 6, 'FC Luzern': 6, 'FC Thun': 6, 'FC Vaduz': 4 },
  'Yunanistan': { 'Olympiacos': 12, 'AEK Athens': 11, 'Panathinaikos': 11, 'PAOK': 11, 'Aris': 7, 'Asteras Tripolis': 5, 'Atromitos': 5, 'OFI': 5, 'Panetolikos': 5, 'A.E. Kifisia': 4, 'Iraklis': 4, 'Levadiakos': 4, 'Volos': 4, 'Kalamata': 3 },
  'Rusya': { 'Zenit Saint Petersburg': 12, 'CSKA Moscow': 11, 'Krasnodar': 11, 'Spartak Moscow': 11, 'Dynamo Moscow': 10, 'Lokomotiv Moscow': 10, 'Rostov': 7, 'Rubin Kazan': 7, 'Krylia Sovetov Samara': 6, 'Akhmat Grozny': 6, 'Baltika Kaliningrad': 6, 'Orenburg': 5, 'Dynamo Makhachkala': 4, 'Akron Tolyatti': 4, 'Fakel Voronezh': 4, 'Rodina Moscow': 3 },
  'Ukrayna': { 'Shakhtar Donetsk': 12, 'Dynamo Kyiv': 12, 'Zorya Luhansk': 6, 'Karpaty Lviv': 5, 'Kryvbas Kryvyi Rih': 5, 'Polissya Zhytomyr': 5 },
  'Brezilya': { 'Flamengo': 14, 'Palmeiras': 14, 'Atlético Mineiro': 12, 'Botafogo': 12, 'Corinthians': 12, 'São Paulo': 12, 'Cruzeiro': 11, 'Fluminense': 11, 'Grêmio': 11, 'Internacional': 11, 'Athletico Paranaense': 10, 'Bahia': 10, 'Santos': 10, 'Vasco da Gama': 10, 'Red Bull Bragantino': 9, 'Coritiba': 7, 'Chapecoense': 6, 'Mirassol': 6, 'Remo': 6, 'Vitória': 6 },
  'Arjantin': { 'River Plate': 14, 'Boca Juniors': 13, 'Racing': 10, 'Independiente': 9, 'San Lorenzo': 9, 'Estudiantes': 9, 'Vélez Sarsfield': 9, 'Talleres': 8, 'Rosario Central': 8, 'Lanús': 8, 'Newell\'s Old Boys': 8, 'Argentinos Juniors': 7, 'Huracán': 7, 'Belgrano': 7, 'Banfield': 6 },
  'ABD': { 'Inter Miami CF': 11, 'LA Galaxy': 10, 'Los Angeles FC': 10, 'Seattle Sounders FC': 9, 'Atlanta United FC': 8, 'New York City FC': 8, 'Columbus Crew': 8, 'FC Cincinnati': 8 },
  'Meksika': { 'América': 11, 'Tigres UANL': 11, 'Monterrey': 11, 'Guadalajara': 10, 'Cruz Azul': 10, 'UNAM': 9, 'Toluca': 9, 'Pachuca': 9, 'León': 8, 'Santos Laguna': 7 },
  'Suudi Arabistan': { 'Al-Hilal': 12, 'Al-Nassr': 12, 'Al-Ittihad': 11, 'Al-Ahli': 11, 'Al-Qadsiah': 8, 'Al-Shabab': 8, 'Al-Ettifaq': 7 },
  'Danimarka': { 'Copenhagen': 10, 'Midtjylland': 8, 'Brøndby': 8, 'Nordsjælland': 6 },
  'İsveç': { 'Malmö FF': 8, 'AIK': 7, 'Djurgårdens IF': 7, 'Hammarby IF': 7, 'BK Häcken': 7, 'IFK Göteborg': 7 },
  'Norveç': { 'Bodø/Glimt': 9, 'Molde': 8, 'Rosenborg': 8, 'Brann': 7 },
  'Polonya': { 'Legia Warsaw': 8, 'Lech Poznań': 8, 'Raków Częstochowa': 7, 'Jagiellonia Białystok': 7, 'Pogoń Szczecin': 6 },
  'Çekya': { 'Slavia Prague': 10, 'Sparta Prague': 10, 'Viktoria Plzeň': 8 },
  'Hırvatistan': { 'Dinamo Zagreb': 10, 'Hajduk Split': 8, 'Rijeka': 6 },
  'Sırbistan': { 'Red Star Belgrade': 10, 'Partizan': 8 },
  'Romanya': { 'FCSB': 8, 'CFR Cluj': 7, 'Universitatea Craiova': 7, 'Rapid București': 7, 'Dinamo București': 6 },
  'Macaristan': { 'Ferencváros': 8 },
  'Japonya': { 'Vissel Kobe': 9, 'Kawasaki Frontale': 9, 'Yokohama F. Marinos': 9, 'Urawa Red Diamonds': 9, 'Kashima Antlers': 9, 'Sanfrecce Hiroshima': 8 },
  'Güney Kore': { 'Jeonbuk Hyundai Motors': 8, 'Ulsan HD': 8, 'FC Seoul': 7 },
  'Katar': { 'Al-Sadd': 8, 'Al-Duhail': 7 },
  'Mısır': { 'Al Ahly': 11, 'Zamalek': 9, 'Pyramids': 8 },
  'Fas': { 'Wydad AC': 8, 'Raja CA': 8, 'AS FAR': 7, 'RS Berkane': 7 },
  'Cezayir': { 'CR Belouizdad': 6, 'MC Alger': 6, 'USM Alger': 6, 'JS Kabylie': 6 },
  'Tunus': { 'Espérance de Tunis': 8, 'Club Africain': 6, 'Étoile du Sahel': 6 },
  'Güney Afrika': { 'Mamelodi Sundowns': 9, 'Orlando Pirates': 8, 'Kaizer Chiefs': 8 },
  'Kolombiya': { 'Atlético Nacional': 8, 'Millonarios': 7 },
  'Uruguay': { 'Peñarol': 9, 'Nacional': 9 },
  'Şili': { 'Colo-Colo': 8, 'Universidad de Chile': 7, 'Universidad Católica': 7 },
  'Avustralya': { 'Sydney FC': 6, 'Melbourne City': 6 }
};
const CM_FIN = ['Çok güçlü', 'Güçlü', 'Dengeli', 'Sıkıntılı', 'İflasın eşiğinde'];
const CM_FIN_MUL = [1.4, 1.1, 0.8, 0.4, 0.1];
function cmHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const cmR = (s, salt) => (cmHash(salt + '|' + s) % 10000) / 10000;
const cmClamp = (v, a, b) => v < a ? a : v > b ? b : v;
// ctx: { leagues(country) -> [{name, clubs:[...]}], stad(club) -> [stadyum, kapasite, şehir] | undefined, ulke(country) -> 1..20, rival(club), nick(club) }
function makeClubModel(ctx) {
  const cache = {};
  function leagueClubs(country, li) {
    const key = country + '|' + li; if (cache[key]) return cache[key];
    const lgs = ctx.leagues(country) || []; const lg = lgs[li]; if (!lg) return (cache[key] = []);
    const ulv = ctx.ulke(country); const ul = ulv === undefined ? 6 : ulv; const real = CM_REAL[country] || null;
    const caps = lg.clubs.map(n => { const s = ctx.stad(n); return s ? s[1] : null; }); const have = caps.filter(x => x != null).sort((a, b) => a - b);
    const mul = Math.pow(1.17, ul - 14);
    const list = lg.clubs.map((n, idx) => {
      let rep;
      if (real && real[n] !== undefined) rep = real[n];
      else {
        const base = Math.round(ul - 2.4 * li - 4); const h = cmR(n, 'r');
        const pct = caps[idx] != null && have.length > 1 ? have.filter(x => x < caps[idx]).length / (have.length - 1) : 0.35 + 0.3 * h;
        rep = cmClamp(base - 1 + Math.round(Math.pow(0.7 * pct + 0.3 * h, 1.4) * 6), 1, 20);
        if (real) rep = Math.min(rep, li === 0 ? 7 : 5);
      }
      return { n: n, c: country, li: li, lg: lg.name, rep: rep };
    });
    const sorted = list.slice().sort((a, b) => b.rep - a.rep || a.n.localeCompare(b.n, 'tr'));
    sorted.forEach((x, i) => {
      const fr = i / Math.max(1, sorted.length); x.exp = fr < 0.12 ? 0 : fr < 0.35 ? 1 : fr < 0.7 ? 2 : 3;
      const h2 = cmR(x.n, 'p'); x.pat = h2 < 0.3 ? 0 : h2 < 0.8 ? 1 : 2;
      const sc = x.rep + (cmR(x.n, 'f') - 0.5) * 5 + (ul - 14) * 0.25; x.fin = sc >= 17 ? 0 : sc >= 12 ? 1 : sc >= 6 ? 2 : sc >= 3 ? 3 : 4;
      const st = ctx.stad(x.n); x.stad = st ? st[0] : '—'; x.cap = st ? st[1] : (Math.round((x.rep * x.rep * 190 + 800) / 100) * 100); x.city = st ? st[2] : '—'; x.estCap = !st;
      x.tr = Math.round(50000 * Math.pow(1.46, x.rep) * CM_FIN_MUL[x.fin] * mul); x.wg = Math.round(20000 * Math.pow(1.48, x.rep) * mul);
      const f = k => cmClamp(Math.round(x.rep * 0.8 + (ul - 14) * 0.15 + (cmR(x.n, k) - 0.5) * 4), 1, 20); x.f1 = f('t'); x.f2 = f('a'); x.f3 = cmClamp(f('g') - 1, 1, 20);
    });
    return (cache[key] = list);
  }
  // Veri Editörü kaydı için alanlar (para birimi: ₺; 1 € = 55,93 ₺)
  function record(x) {
    const TRY = 55.93; const rev = Math.round(x.wg * 12 / 0.6); const f = [0.4, 0.2, 0.08, 0.01, 0][x.fin]; const dbt = [0.1, 0.3, 0.6, 1.2, 2.5][x.fin];
    const fame = x.rep >= 17 ? 'Dünya çapında' : x.rep >= 14 ? 'Kıtasal' : x.rep >= 11 ? 'Ulusal' : x.rep >= 6 ? 'Bölgesel' : 'Yerel';
    const h = cmR(x.n, 'z');
    return { sehir: x.city === '—' ? '' : x.city, stadyum: x.stad === '—' ? '' : x.stad, kapasite: x.cap, rakip: ctx.rival(x.n) || 'Yok', itibar: x.rep, tanin: fame,
      maliDurum: CM_FIN[x.fin], bakiye: Math.round(rev * f * TRY), borc: Math.round(rev * dbt * TRY), kisaBorc: Math.round(rev * dbt * 0.25 * TRY), faiz: Math.round((3 + x.fin * 1.5) * 10) / 10,
      kisitlama: x.fin === 4 ? 'Harcama limiti' : 'Yok', transfer: Math.round(x.tr * TRY), maasButce: Math.round(x.wg * TRY), yayin: Math.round(rev * 0.4 * TRY), sponsor: Math.round(rev * 0.25 * TRY), bilet: Math.round(rev * 0.2 * TRY),
      zengin: x.fin === 0 && h < 0.3 ? 'Var · sürekli destek' : x.fin <= 1 && h < 0.2 ? 'Var · ara sıra destek' : 'Yok', profil: ['Sabırlı', 'Normal', 'Acımasız'][x.pat],
      taraftar: ['Şampiyonluk', 'Yüksek', 'Orta', 'Düşük'][x.exp], tesis: x.f1, altyapi: x.f2, gozlem: x.f3 };
  }
  return { leagueClubs: leagueClubs, record: record };
}
