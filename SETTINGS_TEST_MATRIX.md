# SETTINGS_TEST_MATRIX

Kaynak: `design/Ayarlar.dc.html` (91 ayar). Test: `tests/e2e/settings_e2e.js` (Playwright, gerçek tarayıcı; ayar UI'dan değiştirilir → kaydedilir → Oyun Merkezi'nde ölçülür → sayfa yeniden açılır → varsayılana dönülür). Son sonuç: `tests/e2e/last_result.json`.

PASS yalnızca otomatik testle kanıtlanmış olanlara yazıldı. Diğerleri NOT TESTED; "kaydediliyor" yalnızca Ayarlar ekranının değeri `td-ayarlar-v1` içine yazdığını, oyunun bunu okuduğu anlamına GELMEZ.

**Platform notu:** Bu proje şu an tarayıcıda çalışan HTML prototipidir; Windows .exe, V-Sync, FPS sınırı, çözünürlük, tam ekran vb. gerçek render/ses ayarları bu ortamda uygulanamaz/ölçülemez → BLOCKED.

| Ayar (anahtar) | Ad | Varsayılan | Kaydediliyor | Oyun Merkezi'nde tüketen kod | Otomatik test | Sonuç | Bilinen hata / not |
|---|---|---|---|---|---|---|---|
| mode | Görüntü modu | Tam ekran | evet | — | — | BLOCKED | Ses/render altsistemi yok (HTML prototip); .exe motoru gerekli |
| res | Çözünürlük | 1920×1080 | evet | — | — | BLOCKED | Ses/render altsistemi yok (HTML prototip); .exe motoru gerekli |
| gfx | Grafik kalitesi | Yüksek | evet | — | — | BLOCKED | Ses/render altsistemi yok (HTML prototip); .exe motoru gerekli |
| theme | Tema | Koyu | evet | tdPrefs | settings_e2e.js | PASS | uygulandı + yeniden açılışta korundu + varsayılana döndü |
| scale | Arayüz ölçeği | 100 | evet | tdPrefs | — | NOT TESTED | Ayarlar kaydediyor ve tdPrefs html{zoom} uyguluyor; otomasyon testi yazılmadı. |
| fps | Kare hızı sınırı | 60 | evet | — | — | BLOCKED | Ses/render altsistemi yok (HTML prototip); .exe motoru gerekli |
| vsync | Dikey senkronizasyon | true | evet | — | — | BLOCKED | Ses/render altsistemi yok (HTML prototip); .exe motoru gerekli |
| vMaster | Ana ses | 80 | evet | — | — | BLOCKED | Ses/render altsistemi yok (HTML prototip); .exe motoru gerekli |
| vMusic | Müzik | 60 | evet | — | — | BLOCKED | Ses/render altsistemi yok (HTML prototip); .exe motoru gerekli |
| vCrowd | Tribün ambiyansı | 75 | evet | — | — | BLOCKED | Ses/render altsistemi yok (HTML prototip); .exe motoru gerekli |
| vUi | Arayüz sesleri | 50 | evet | — | — | BLOCKED | Ses/render altsistemi yok (HTML prototip); .exe motoru gerekli |
| view | Maç gösterimi | Spiker modu | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| speed | Maç hızı | Normal | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| commSpeed | Spiker hızı | Normal | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| goalFlash | Golde spiker metni yanıp sönsün | true | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| flashLen | Yanıp sönme süresi | Normal (3 sn) | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| goalSides | Hangi gollerde | Tüm goller | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| replayOn | Tekrarlar | true | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| replay | Tekrar gösterilecek anlar |  | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| replaySpeed | Tekrar hızı | Ağır çekim | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| bgSim | Arka plan ligleri | Dengeli | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| cur | Para birimi | ₺ TL | evet | money() | settings_e2e.js | PASS | uygulandı + yeniden açılışta korundu + varsayılana döndü |
| wage | Maaş gösterimi | Aylık | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| temp | Sıcaklık | °C | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| height | Boy | cm | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| weight | Kilo | kg | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| short | Kısa mesafe | Metre | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| long | Uzun mesafe | Kilometre | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| date | Tarih biçimi | GG.AA.YYYY | evet | fmtDate/fmtShort | settings_e2e.js | PASS | uygulandı + yeniden açılışta korundu + varsayılana döndü |
| autosave | Otomatik kayıt | Her hafta | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| saveCount | Tutulacak otomatik kayıt | 5 | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| lang | Dil | Türkçe | evet | tdI18n/loc() | — | NOT TESTED | Çeviri katmanı çalışıyor (elle doğrulandı); seçici otomasyonu BLOCKED. |
| stopOn | Devam ederken dur |  | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| market | Transfer piyasası | Gerçekçi | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| foreign | Yabancı oyuncu kuralları | true | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| ingameEditor | Oyun içi editör | false | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funMode | Eğlence modu | false | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funRed | Kırmızı kart | Var | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funYellow | Sarı kart | Var | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funOffside | Ofsayt | Var | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funVar | VAR | Turnuvaya göre | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funPenalty | Penaltı | Normal | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funThrow | Taç | Normal taç | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funPlayersOnPitch | Sahadaki oyuncu sayısı | 11\ | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funSubs | Oyuncu değişikliği | 5 | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funLen | Maç süresi | 90 dk | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funDraw | Beraberlik | Normal | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funGoal | Gol değeri | Normal | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funScoring | Maçların gol eğilimi | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funReferee | Hakemler | Normal | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funHome | Ev sahibi avantajı | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funCrowd | Seyirci | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funWeather | Hava durumu | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funInjury | Sakatlık | Var | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funFatigue | Yorulma | Var | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funPoints | Galibiyet puanı | 3 puan | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funRelegation | Küme düşme ve yükselme | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funFixtures | Lig fikstürü | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funCups | Kupa eşleşmeleri | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funFixedDraw | Kura | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funPlayers | Oyuncu özellikleri | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funGrowth | Gelişim hızı | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funAging | Yaşlanma | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funRetire | Emeklilik | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funMorale | Moral | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funForm | Form | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funYouth | Altyapıdan çıkan oyuncular | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funNationality | Uyruklar | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funRep | İtibarlar | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funEco | Ekonomik durum | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funWages | Maaşlar | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funIncome | Gelirler | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funFFP | Mali kurallar | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funStadium | Stadyumlar | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funFree | Bonservis | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funFees | Transfer ücretleri | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funWindow | Transfer dönemi | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funContract | Sözleşme görüşmeleri | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funSquad | Kadro sınırı | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funAI | Diğer kulüpler | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funSack | Kovulma | Var | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funBoard | Yönetim beklentileri | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funPress | Basın | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funJobs | İş teklifleri | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| funManagerRep | Menajer itibarı | Gerçek | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| cb | Renk körü modu | Kapalı | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| shapes | Renklerin yanında işaret göster | false | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| contrast | Yüksek kontrast | false | evet | tdPrefs | — | NOT TESTED | tdPrefs uyguluyor; otomasyon testi yazılmadı. |
| motion | Hareketi azalt | false | evet | tdPrefs | — | NOT TESTED | tdPrefs uyguluyor; otomasyon testi yazılmadı. |
| db | Veritabanı |  | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
| folder | Kayıt klasörü |  | evet | — | — | NOT TESTED | Oyun tarafında tüketen kod doğrulanmadı |
