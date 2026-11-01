# Turnuva ve ödül verisi şeması (JSON dizisi; her eleman bir kayıt)
Bulunamayan alanı HİÇ yazma; uydurma/tahmin yok. Bir bilgiyi ancak web aramasında gördüysen yaz. Türkçe metin. Her kayıtta "ad" (aşağıdaki listedeki gibi), "kaynaklar": [site alanadları], "tarih": veri tarihi.

TURNUVA alanları:
 trk_enCokSampiyon (metin "Takım · sayı"), trk_enBuyukGalibiyet (metin "Skor · Takımlar · yıl"), trk_enCokGolAtan (metin "Oyuncu · gol sayısı", turnuva tüm zamanlar), trk_enCokMac (metin "Oyuncu · maç sayısı"), trk_sezonGol (sayı: bir sezon/turnuvada atılan en çok gol (toplam, tüm takımlar)), trk_sezonPuan (sayı: bir takımın tek sezonda en çok puanı; ligler için), trk_enCokSeyirci (sayı: bir maçta en yüksek seyirci),
 gecmisKazananlar (çok satırlı metin, \n ile ayır; her satır "Yıl/Sezon · Şampiyon · İkinci". Mümkünse tüm edisyonlar; 40'tan fazlaysa son 40.)

ÖDÜL alanları:
 od_enCok (metin "Kişi · sayı"), od_enGenc (metin "Kişi · yaş · yıl"), od_enYasli (metin), od_ardisik (metin "Kişi · kaç kez üst üste · yıllar"), od_rekorDeger (metin: rekor puan/gol vb.), od_ilkKazanan (metin "Kişi · yıl"),
 gecmisKazananlar (çok satırlı; her satır "Yıl/Sezon · Kazanan · Takım". Mümkünse son 30 edisyon.)
