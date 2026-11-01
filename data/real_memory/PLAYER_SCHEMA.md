# Oyuncu + personel şeması (bellekten yazım; web erişimi yok)
Çıktı: {"kulup": "<editördeki kulüp adı>", "oyuncular": [...], "personel": [...]}  — kulüp başına bir nesne; dosya bu nesnelerin JSON dizisi.

Her kayıtta zorunlu "gercek": true  = gerçekten var olduğunu bildiğin kişi (adı, doğum tarihi, uyruğu, mevkisi bildiğin ölçüde doğru),
                           false = kadroyu tamamlamak için KURGUSAL dolgu (uydurma isim; gerçek kişi adı kullanma).
Tek bir kural: Bildiğin gerçek kişiler için kesin bilmediğin alanı doğru göstermek yerine mantıklı tahmin yaz ama "tahmini": ["alan", ...] listesine ekle. Gerçek olmayan kişiyi gerçek diye işaretleme. Bilgi tarihini "tarih" alanına yaz (örn. "2025/26 başı bilgisi"). Güncel kadroyu bilmiyorsan en son bildiğin kadroyu yaz ve tarihini belirt.

OYUNCU (kulüp başına 24–28 kişi; 3 kaleci dahil; genç/rezerv oyuncular dahil):
 ad, dogum ("gg.aa.yyyy"), uyruk (Türkçe ülke adı, örn. "Türkiye","Brezilya","Nijerya"), uyruk2 (varsa), 
 mevki: yalnızca şunlardan biri: Kaleci, Stoper, Sağ bek, Sol bek, Ön libero, Merkez orta saha, Ofansif orta saha, Sağ kanat, Sol kanat, Santrfor
 ayak: "Sağ" | "Sol" | "İki ayak", boy (cm), kilo (kg), forma (forma no), 
 deger_eur (piyasa değeri avro, sayı), sozlesme ("gg.aa.yyyy", tahmini olabilir), 
 guc (1–20: dünya futbolu ölçeğinde şimdiki seviye; Süper Lig yıldızı 13–15, düzenli ilk 11 9–12, yedek 6–8, genç/rezerv 4–6), pot (1–20: potansiyel, guc'tan küçük olamaz),
 milliTakim (A milli maça çıktıysa ülke adı, yoksa boş), milliMac, milliGol (biliyorsan), lakap (varsa),
 gercek, tahmini.

PERSONEL (kulüp başına 6–9 kişi): teknik direktör, 1–2 yardımcı antrenör, kaleci antrenörü, kondisyoner, fizyoterapist, gözlemci (scout), sportif direktör, başkan.
 ad, dogum, uyruk, gorev: yalnızca şunlardan biri: Teknik direktör, Yardımcı antrenör, Kaleci antrenörü, Kondisyoner, Gözlemci, Fizyoterapist, Altyapı sorumlusu, Sportif direktör, Başkan, Doktor, Analist
 sozlesme (gg.aa.yyyy), lisans ("UEFA Pro","UEFA A","UEFA B","Yok"), itibar (1–20), tanin ("Yerel","Bölgesel","Ulusal","Kıtasal","Dünya çapında"), gercek, tahmini.
