# Veri sağlayıcı karşılaştırması

> Tarih: 2026-11-01. Fiyat, limit ve lisans bilgileri **web aramasından** alınan özetlere dayanır; resmî sayfalar
> bu ortamdan açılamadığı için **doğrulanmamıştır**. Karar vermeden önce resmî fiyat ve kullanım koşullarını okuyun.

| | API-Football (api-sports.io) | football-data.org | Sportmonks |
|---|---|---|---|
| Ücretsiz plan | 100 istek/gün, tüm uç noktalar ([rehber](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide)); bir kaynak 10 istek/dk diyor | 12 yarışma, 10 çağrı/dk, gecikmeli skor ([özet](https://www.thestatsapi.com/blog/football-data-org-free-tier-limits-2026)) | Yalnızca Danimarka Superliga ve İskoçya Premiership ([ana sayfa](https://www.sportmonks.com/football-api/)) |
| Ücretli | Pro $19/ay 7.500 istek/gün, Ultra $29 75.000, Mega $39 150.000 ([rehber](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide), [karşılaştırma](https://highlightly.net/blogs/best-football-apis-in-2026)) | Standart ~€49/ay, 30 yarışma (üçüncü taraf: [karşılaştırma](https://www.thestatsapi.com/blog/thestatsapi-vs-football-data-org)) | 14 gün deneme; Advanced €69/ay, All-In €129/ay ([fiyatlar](https://www.sportmonks.com/football-api/plans-pricing)) |
| Transfer/kiralık | Var (belgelere göre; canlı doğrulanmadı) | Doğrulanamadı (adaptör sunmuyor kabul eder) | Doğrulanamadı |
| Sakatlık / ceza | Sakatlık var; ceza için doğrudan uç nokta yok, `injuries` nedenlerinden çıkarılıyor (**doğrulanmadı**) | Doğrulanamadı | Doğrulanamadı |
| Ticari kullanım / yeniden dağıtım | **Doğrulanamadı** (ücretsiz planlar geliştirme/test içindir) | **Doğrulanamadı** | **Doğrulanamadı** |
| Adaptör | Yazıldı (canlı doğrulanmadı) | Yazıldı (canlı doğrulanmadı) | **Yazılmadı** |

## Öneri (ön)

Gereksinimler (transfer, kiralık, sakatlık, dünya kapsamı, düşük maliyet) için **API-Football** en uygun aday görünüyor.
football-data.org yedek/çapraz doğrulama için kadro ve teknik direktör verisinde işe yarar ama sakatlık/transfer sunmaz.
Karar için şunlar **gerçek denemeyle** doğrulanmalı: Süper Lig kapsamı, kiralık/transfer türleri, sakatlık nedenleri, plan limitleri,
ve en önemlisi **oyunda kullanım/yeniden dağıtım hakkı** (sağlayıcıdan yazılı onay ya da şartların net okunması).

## İstek bütçesi tahmini (API-Football, varsayım: 20 oyuncu/sayfa)

Bir kulüp için yaklaşık: kadro 2 sayfa + `players/squads` 1 + `transfers` 1 + `coachs` 1 = **5 istek**. Lig başına 1 `teams` + 1 `injuries`.
- Süper Lig (18 kulüp): ~92 istek (ücretsiz planın günlük 100 limitinin altında, kıl payı)
- Beş büyük lig (~96 kulüp): ~480 istek
- ~7.000 kulüp (tüm dünya): ~35.000 istek: Pro planla ~5 günde ilk yükleme, sonra artımlı güncelleme

## Transfermarkt

Transfermarkt otomatik toplu veri çekmeyi yasaklar; bu motor Transfermarkt'tan kazıma yapmaz. Yalnızca lisanslı API'ler kullanılır.
