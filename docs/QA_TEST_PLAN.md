# QA_TEST_PLAN
Mevcut otomasyon: `tests/e2e/settings_e2e.js` (ayar→davranış), `data-engine` pytest (104 test, 2 canlı atlandı), `data/db/manifest_tool.py verify` (DB dondurma).
Çalıştırma: `node tests/e2e/settings_e2e.js <design-klasörü> <kd-parça-klasörü> <id-haritası.json>` (Playwright gerekir; kd*.js parçaları repoda yok, `design/kd/*.json`'dan üretilir).
Planlanan: ekran açılış/geri/filtre/sıralama testleri (kadro), kayıt-yükleme, uçtan uca 30 adımlı senaryo (taktik/transfer/antrenman yok → şimdilik uygulanamaz = BLOCKED).
Bilinen sınır: GUI .exe ve gerçek ses/render testi bu ortamda yapılamaz.
