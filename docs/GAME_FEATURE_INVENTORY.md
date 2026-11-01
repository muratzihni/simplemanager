# GAME_FEATURE_INVENTORY
Durumlar: NOT STARTED / IN PROGRESS / IMPLEMENTED / TESTED / BLOCKED. **TESTED = otomatik veya kayıtlı elle test kanıtı var.** Çoğu özellik yalnızca IMPLEMENTED (elle/playwright ekran görüntüsüyle açıldığı görüldü, regresyon testi yok).

**Gerçek durum:** Proje Windows .exe / UE5 değil; Claude Design tuvalinde çalışan HTML tabanlı prototip (`design/*.dc.html`) + Python veri motoru (`data-engine/`) + veri (`data/`). Gerçek .exe derlemesi bu Linux ortamında yapılamıyor → BLOCKED.

| Alan | Özellik | Durum | Not |
|---|---|---|---|
| Başlangıç | Kulüp/lig/ülke seçimi, Veri Editörü | IMPLEMENTED | önceden vardı; editör 397.499 oyuncu sayıyor (elle sayıldı) |
| Başlangıç | Karşılama ekranı (Merhaba) | IMPLEMENTED | |
| Başlangıç | Yönetim karşılama/hedef/bütçe mesajları | IMPLEMENTED | Gelen kutusu mesajları (m1..); basın toplantısı, hazırlık programı, ilk antrenman: NOT STARTED |
| Dashboard | Pano: sıra, sıradaki maç, takım özeti, kadro değeri… | IMPLEMENTED | morale/kondisyon/sakat/ceza/yönetim güveni: NOT STARTED (veri modeli yok) |
| Navigasyon | Sol menü (Pano, Gelen Kutusu, Kadro, Teknik Heyet, Fikstür, Tablo, Finans, Kulüp, Lig, Ülke, Turnuvalar) | IMPLEMENTED | Taktik/Antrenman/Transfer "Yakında" olarak işaretli (bağlantısız menü yok ama özellik yok) |
| Navigasyon | Menü kapanır/açılır, geri-ileri geçmişi | NOT STARTED | |
| Kadro | A/U21/U19/Serbest/Emekli, sıralama, filtre, arama | IMPLEMENTED | elle+Playwright ekran görüntüsü; otomatik regresyon yok |
| Kadro | Kiralık, sözleşmesi bitecek, sakat, ceza, transfer listesi, karşılaştırma, kaptan, forma no, rol, hiyerarşi | NOT STARTED | |
| Oyuncu profili | Kimlik, para, itibar, 47 özellik, mevki skoru, davranış, tercih, geçmiş, milli | IMPLEMENTED | istatistik/sakatlık/disiplin/antrenman/gelişim grafiği/moral/kondisyon: NOT STARTED |
| Taktik | Diziliş, roller, talimatlar, maça aktarım | NOT STARTED | Maç motoru (`MacMotoru.dc.html`) var; Oyun Merkezi'ne bağlı DEĞİL |
| Antrenman / Gelişim | tümü | NOT STARTED | |
| Transfer / Scouting | tümü | NOT STARTED | veri (serbest oyuncular) var, işlem yok |
| Maç Merkezi | oynat/sonuç | IN PROGRESS | Oyun Merkezi Poisson ile hızlı sonuç üretiyor; MacMotoru'na bağlı değil |
| Fikstür/Tablo | çift devreli fikstür, tablo | IMPLEMENTED | sonuç kaydı td-oyun-v1'de |
| Teknik ekip | liste, kullanıcı = TD | IMPLEMENTED | işe alma/çıkarma NOT STARTED |
| Finans | mali özet | IMPLEMENTED | gelir/gider kalemleri, sponsor, projeksiyon NOT STARTED |
| Dünya futbolu | turnuva/ödül/derbi/şehir tarayıcı | IMPLEMENTED | |
| Altyapı, Sağlık, Yönetim kurulu, Medya | tümü | NOT STARTED | |
| Kaydet/Yükle | oyun ilerlemesi td-oyun-v1 | IN PROGRESS | otomatik kayıt dosyası/yedek yok |
| Ayarlar | 91 ayar ekranı | IMPLEMENTED | oyuna etkisi: 3 ayar TESTED, kalanı NOT TESTED/BLOCKED → SETTINGS_TEST_MATRIX.md |
| i18n | 18 dil (+TR) | IMPLEMENTED | anadil doğrulaması yok |
