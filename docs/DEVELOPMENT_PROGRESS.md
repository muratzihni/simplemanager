# DEVELOPMENT_PROGRESS
## Bu oturum
Tamamlanan: canlı veri yükleme düzeltmesi; kadro filtre/sıralama; U21/U19; tam oyuncu profili; dünya verisi; TD = oyuncu; tarih biçimi ayarı oyuna bağlandı; ayar E2E testi (3 PASS).
Değişen: design/OyunMerkezi.dc.html, VeriEditoru.dc.html, design/kd/*.json, tests/e2e/*, docs/*.
Test: settings_e2e → theme/cur/date PASS; scale/contrast/lang NOT TESTED.
## Durum raporu
| Kontrol | Durum |
|---|---|
| Ekran tasarlandı / kodlandı | Evet (mevcut ekranlar) · Spec'in çoğu: Hayır |
| Oyun içinde açıldı | Evet (tarayıcıda, yerel sunucu) |
| Butonlar test edildi | Kısmen (elle/ekran görüntüsü) |
| Veritabanına bağlandı | Evet (kd verisi) |
| Ayarlar etkisi test edildi | 3 / 91 |
| Kayıt/yükleme test edildi | Hayır |
| Regresyon testi geçti | Yalnızca settings_e2e (3 ayar) + pytest |
Çalıştırma: bkz. QA_TEST_PLAN.md.
