# Mevcut projeye entegrasyon planı

## Mevcut durum
`simplemanager` deposunda oyun şu an **tarayıcıda çalışan tasarım prototipi** (`design/*.dc.html`). Kulüp verisi
(`design/_kaynak_kulup_modeli.js`) gömülü veri + tahmini değerlerden türetiliyor. UE5/C++ oyunu henüz yok.

## Veri akışı
```
[Sağlayıcı API'leri] --(anahtar yalnızca burada)--> [fmdata veri servisi] --> SQLite (çalışma DB)
                                                          |
                                      validate -> publish (sürümlü anlık görüntü + doğrulama raporu)
                                                          v
                                   [Kendi sunucun / CDN]  <-- oyun yalnızca buradan indirir (anahtar yok)
```

## Oyuna bağlanış (sonraki adımlar, YAPILMADI)
1. `fmdata export-json`: yayınlanan sürümden Kulüp Seçimi / Veri Editörü'nün beklediği biçimde kulüp, kadro, itibar çıktısı üretmek
   (tahmini değerlerin yerine gerçek veriyi koymak). Tarayıcı prototipi için JSON; ileride UE5/C++ için doğrudan SQLite.
2. "Futbol Veritabanı" ana menü ekranı: güncel sürümü indir, ülke/lig seç, doğrulama raporunu göster, önceki sürüme dön.
3. Yeni kariyerde sürüm ve başlangıç tarihi seçimi: `squads.squad_at(club, tarih)` o tarihteki kadroyu verir;
   gerçek sakatlık/ceza içe aktarımı isteğe bağlı (`rules.availability`).
4. Kariyer başlayınca seçilen sürümün anlık görüntüsü kariyer kaydına kopyalanır; gerçek dünya değişiklikleri kariyere işlemez.

## Lisans kontrol listesi (yayından önce)
- [ ] Sağlayıcının ticari kullanım ve yeniden dağıtım şartları okundu; `data_sources.allows_redistribution` buna göre ayarlandı.
- [ ] Oyuncu fotoğrafları ve kulüp logoları ayrı lisans gerektirir (bu motor görsel indirmez).
- [ ] Gerçek kulüp/oyuncu adlarının oyunda ticari kullanımı için marka/kişilik hakları ayrıca değerlendirildi.
- [ ] `publish --for-distribution` komutu, hak doğrulanmamış kaynak içeren sürümü reddeder.
