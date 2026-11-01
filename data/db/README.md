# Kesinleştirilmiş veritabanı: Varsayılan Veritabanı v1.2

Oyun başlangıcında (Ülke ve Lig Seçimi) seçilebilen tek veritabanıdır; Ayarlar'da veritabanı satırı kilitlidir.
İçerik: 7.053 kulüp · 397.499 oyuncu · 85.606 personel · 77 temsilci (tarih: 01.11.2026).

`DATABASE.json` her veri dosyasının SHA-256 özetini tutar. Veri değiştiyse `python3 data/db/manifest_tool.py verify` fark bildirir.
Yeni sürüm gerekiyorsa sürümü bilerek yükseltip `build` çalıştırın (v1.2, v2.0…).

## Sürüm geçmişi
- v1.2: Open Football (Apache-2.0) verisi eklendi: 72.930 gerçek isimli oyuncu (özellikler, kulüp geçmişi, milli takım, sözleşme), 1.747 kulübün tesis/finans/seyirci/renk bilgisi, 157 ligin kademe ve yükselme/düşme sayıları (367.052 → 397.499 oyuncu). Eşleşen kulüplerde kurgusal ve elle yazılan kadrolar gerçek kadrolarla değiştirildi.
- v1.1: aynı adlı kulüplerin eksik kadroları eklendi; rezerv ve U19 takımları, serbest ve emekli oyuncu havuzları, serbest personel eklendi (174.038 → 397.499 oyuncu).
- v1.0: ilk kesinleştirme (174.038 oyuncu, 81.959 personel).

## Canlı yükleme (v1.2.1)
Tasarım çalışma zamanı dinamik `fetch('kd/…json')` dosyalarını paketlemediği için veri dosyaları
artifact **varlıkları** (`/_blob/<id>`) olarak yüklenir: `kd0-4.js` (171 ülke + turnuvalar) ve `op1-5.js`
(Open Football oyuncuları). Sayfalar bunları `<script>` ile enjekte eder (yedek: fetch + metin).
`design/kd/*.json` ve `design/ve-op-*.json` kaynak olarak kalır.
