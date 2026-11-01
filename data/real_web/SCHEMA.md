# Gerçek veri toplama şeması (her takım için bir JSON nesnesi)
Çıktı dosyası: bir JSON dizisi; her eleman bir takım. Anahtar adları AYNEN şunlardır. Bulunamayan alanı HİÇ yazma (uydurma, tahmin yazma). Türkçe metin.

Kimlik: "ad" (editördeki ad, aşağıda verilen listedeki gibi), "kaynaklar": ["alanadi.com", ...] (kullandığın siteler), "tarih": "veri tarihi, örn. 2025/26 sezon başı".

REKOR (metin ya da sayı):
 rkGalibiyet (metin: "8-0 · Rakip · Yıl"), rkYenilgi (metin), rkMacOyuncu ("Ad · sayı"), rkGolOyuncu ("Ad · sayı"), rkSezonGol (sayı), rkSezonPuan (sayı, lig sezonunda en çok puan), rkSeyirci (sayı), rkTransferAlinan ("Oyuncu · bedel · yıl"), rkTransferSatilan, rkYenilmez (sayı: en uzun yenilmezlik maç), rkSeri (sayı: en uzun galibiyet serisi)
 (milli takım için rkSezonGol, rkSezonPuan, rkTransferAlinan, rkTransferSatilan YOK.)

FORMA (hex #RRGGBB; renk adından en yakın standart değeri seç):
 e_ana, e_ikinci, e_sort, e_corap, e_desen   (ev)
 d_ana, d_ikinci, d_sort, d_corap, d_desen   (deplasman)
 a_ana, a_ikinci, a_sort, a_corap, a_desen   (alternatif/3. forma)
 desen yalnızca şunlardan biri: "Düz", "Dikey çizgili", "Yatay şeritli", "Yarı yarıya", "Çapraz şerit", "Kareli", "Desenli". En güncel (2025/26) formalar; bulamazsan klasik ev/deplasman renkleri.

KUPA (sayılar):
 kulüp: ku_lig, ku_kupa (ulusal kupa), ku_superkupa, ku_kitasal (UEFA/CONMEBOL vb. kıtasal kupalar toplamı), ku_dunya
 milli: ku_dunya (Dünya Kupası), ku_kita (kıta şampiyonası), ku_diger
 kupaGecmisi: çok satırlı metin, her satır "Turnuva · yıllar" (örn. "Süper Lig · 1959, 1962, ..."), \n ile ayır.

TARAFTAR (kulüp+milli): tf_sayi (milyon, sayı), tf_ulke (kendi ülkesindeki pay %), tf_ultra (organize grup adları, metin), tf_kimlik (metin), tf_sosyal (sosyal medya takipçisi milyon).
 1–20 öznel puanlar (tf_atmosfer, tf_sadakat, tf_baski, tf_genc, tf_deplasman, tf_olay): sadece okuduğun kaynaklardan makul çıkarım yapabiliyorsan yaz; ayrıca "tahmini": ["tf_atmosfer", ...] listesine ekle.

TAKTİK: tk_dizilis ("4-3-3","4-2-3-1","4-4-2","3-5-2","3-4-3","5-3-2","4-1-4-1"), tk_stil ("Pozisyonel / top hâkimiyeti","Kontra atak","Yüksek pres","Direkt oyun","Dengeli","Savunma ağırlıklı"), tk_hucum ("Kanatlardan","Ortadan","Karma"), tk_felsefe (kısa metin; mevcut teknik direktörün adı ve sistemi dahil), 1–20: tk_tempo, tk_pres, tk_cizgi, tk_genislik, tk_setparca (tahmini listesine ekle).

HEDEF: hd_ana (kulüp: "Şampiyonluk","Avrupa kupası","Üst sıralar","Orta sıra","Küme düşmemek","Yükselme"; milli: "Gelişim","Elemeleri geç","Gruptan çık","Çeyrek final","Yarı final","Şampiyonluk"), hd_kupa ("Şampiyonluk","Yarı final","Çeyrek final","Fark etmez"), hd_kitasal ("Şampiyonlar Ligi şampiyonluğu","Şampiyonlar Ligi gruptan çıkmak","Avrupa Ligi","Konferans Ligi","Yok"), hd_mali ("Kâr","Dengeli","Zarar kabul"), hd_transfer ("Yıldız transfer","Genç yetenek","Altyapıdan","Tecrübeli oyuncu","Karma"), hd_puan (sayı), hd_sabir (sezon, sayı), hd_plan (metin). Bunlar yönetimin açıklamalarına ve son sezon konumuna dayanan çıkarımdır; "tahmini" listesine ekle.

AKADEMİ/ENSTİTÜ: ak_ad (kulüp akademisi/tesis ya da federasyon gelişim merkezi adı), ak_kurulus (yıl), ak_sporcu (sayı), ak_yaslar ("U9–U19"), ak_okul ("Yok","Anlaşmalı okul","Kendi okulu","Yatılı"), ak_mezun (öne çıkan yetişenler, metin); 1–20: ak_kalite, ak_antrenor, ak_tesis (tahmini listesine ekle).

STADYUM (yalnızca kulüp için ayrı nesne "stadyum": {...}): ad, kapasite, acilis (yıl), sponsorAd, isitma ("Var"/"Yok"), rekSeyirci, ortSeyirci.

Kural: bir bilgiyi ancak bir web aramasında gördüysen yaz. Emin değilsen o alanı çıkar. Sayıların birimine dikkat et. Hiçbir şeyi tahminle doldurma (yukarıda "tahmini" işaretli 1–20 alanlar hariç).
