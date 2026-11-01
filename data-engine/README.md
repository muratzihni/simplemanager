# fmdata: futbol veri motoru

Gerçek futbol verilerini (lig, kulüp, kadro, teknik direktör, transfer, kiralık, sakatlık, ceza) sağlayıcı API'lerinden toplayıp,
doğrulayıp oyunun yerel **SQLite** veritabanına aktaran motor. Yalnızca Python standart kütüphanesi kullanır (3.11+).

## DURUM (dürüst özet)

| Parça | Durum |
|---|---|
| Şema + geçişler (21 tablo, FK, kısıt, tetikleyici) | Yazıldı, testli |
| HTTP istemcisi (hız sınırı, yeniden deneme, geri çekilme, önbellek, sayfalama) | Yazıldı, testli (yerel gerçek HTTP sunucusuyla dahil) |
| Oyuncu kimlik eşleştirme (mükerrer önleme) | Yazıldı, testli |
| İçe aktarma hattı (idempotent, değişiklik geçmişi, çelişki işaretleme) | Yazıldı, testli |
| Kiralık sistemi (iki kadroda aynı anda yok, bonservis sahibi ayrı) | Yazıldı, testli |
| Sakatlık / ceza uygunluğu, oyun içi disiplin simülasyonu | Yazıldı, testli |
| Zamanlayıcı (yönetici ayarlı), yayınlama / geri alma | Yazıldı, testli |
| Adaptörler: football-data.org, API-Football | Belgelenmiş yanıt biçimine göre yazıldı, **canlı API ile DOĞRULANMADI** |
| Sportmonks adaptörü | **Yazılmadı** (doğrulayamayacağım kod yazmadım) |
| Oyun içi "Futbol Veritabanı" arayüzü | **Yapılmadı** |
| "Maç sonrası" otomatik tetikleyiciler | **Yapılmadı** (fikstür/maç bitiş sinyali gerekir) |
| Gerçek veriyle uçtan uca test | **YAPILMADI**: geliştirme ortamında sağlayıcılara ağ erişimi ve API anahtarı yoktu |

Otomatik testler (69 test, 2'si canlı test olarak atlanır) **sentetik** verilerle motorun mantığını doğrular.
Sağlayıcılarla gerçek uyum, yalnızca `tests/live` geçince söylenebilir.

## Kurulum

```bash
cd data-engine
python3 --version            # 3.11 veya üzeri
python3 -m unittest discover -s tests -t .        # birim testleri
```

## API anahtarları (oyun .exe'sine ASLA girmez)

Anahtarlar yalnızca veri toplama sunucusunda ortam değişkeni olarak tutulur; veritabanına, önbelleğe, günlüğe yazılmaz.

```bash
export FMDATA_API_FOOTBALL_KEY=...              # API-Football
export FMDATA_FOOTBALL_DATA_ORG_TOKEN=...       # football-data.org
```

Oyun yalnızca **yayınlanmış anlık görüntüyü** (snapshot) indirir; sağlayıcıyla konuşmaz.

## Kullanım

```bash
python3 -m fmdata.cli providers
python3 -m fmdata.cli --db fmdata.sqlite migrate
# tek lig, tek sezon (önce bununla başla)
python3 -m fmdata.cli --db fmdata.sqlite import --provider api-football --league 203 --season 2026-27
python3 -m fmdata.cli --db fmdata.sqlite report
python3 -m fmdata.cli --db fmdata.sqlite validate
# tek adımı yenile
python3 -m fmdata.cli --db fmdata.sqlite refresh transfers --provider api-football --league 203 --season 2026-27
# zamanlama (cron / Windows Görev Zamanlayıcı ile her saat çalıştır; vadesi gelenleri yapar)
python3 -m fmdata.cli --db fmdata.sqlite run-due --provider api-football --league 203 --season 2026-27 --schedule docs/schedule.example.json
# yayın
python3 -m fmdata.cli --db fmdata.sqlite publish --out-dir dist --description "2026-11-01"
python3 -m fmdata.cli --db fmdata.sqlite publish --out-dir dist --for-distribution   # hak doğrulanmamışsa reddeder
python3 -m fmdata.cli --db fmdata.sqlite rollback
```

Lig kodları sağlayıcıya özeldir (API-Football'da Süper Lig `203` olarak biliniyor; **canlı doğrulanmadı**).

## Mimari

```
fmdata/
  db/migrations/0001_init.sql   şema
  http_client.py                hız sınırı, geri çekilme, önbellek, sayfalama
  providers/                    Provider arayüzü + adaptörler (yeni kaynak = yeni dosya)
  identity.py                   ad normalizasyonu, oyuncu eşleştirme
  importer.py                   hat: lig -> kulüp -> kadro -> transfer/kiralık -> sakatlık -> ceza -> doğrulama
  squads.py                     kadro üyeliği, kiralık başlangıç/bitiş, tarihe göre kadro
  rules.py                      maç uygunluğu, disiplin kuralları
  validators.py                 bütünlük raporu
  scheduler.py                  yönetici ayarlı zamanlama
  cli.py                        komutlar
```

## Veri ilkeleri

- Kaynakta olmayan alan **NULL** kalır (uydurulmaz). Kiralık opsiyon/zorunlu alım/geri çağırma/maaş paylaşımı doğrulanamazsa `unknown`/NULL.
- Her kayıtta `source_id`, `last_checked_at`, `verification_status`, `confidence` bulunur.
- `verified` kayıtlar kaynak farklı değer verirse ezilmez; `import_errors`'a `conflict` olarak yazılır.
- Tahmini sakatlık dönüşü kesin sayılmaz: tarih geçse de dönüş onaylanmadıysa oyuncu `doubtful` olur.
- Gerçek dünya cezası kart sayısından **üretilmez**; yalnızca sağlayıcının bildirdiği ceza içe aktarılır. Oyun içi cezalar `origin='game_simulated'` ile ayrı hesaplanır.
- Kariyer başladıktan sonra gerçek dünya değişiklikleri kariyere sızmaz: kariyer, seçilen yayın sürümünün anlık görüntüsünü kopyalar.
