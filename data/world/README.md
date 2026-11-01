# Dünya oyuncu ve personel veritabanı (kurgusal, otomatik üretildi)

7.053 kulüp · 176.325 oyuncu · 83.182 personel. Veri editörünün kadro üreticisiyle (`squadFor` / `staffFor`) üretildi; aynı kulüp her zaman aynı kadroyu verir.
Gerçek kişi değildir (Süper Lig'deki elle yazılan kayıtlar hariç, onlar `data/real_memory/` altında).

Dosyalar: `oyuncular/<ülke>.json.gz`, `personel/<ülke>.json.gz` (gzip'li JSON dizisi).

Oyuncu satırı (19 sütun): ad, doğum (gg.aa.yyyy), uyruk, uyruk2, mevki, ayak, boy, kilo, forma no, piyasa değeri (avro), sözleşme bitişi, güç (1–20), potansiyel (1–20), milli takım, milli maç, milli gol, lakap, gerçek (0/1), kulüp.
Personel satırı (10 sütun): ad, doğum, uyruk, görev, kulüp, sözleşme bitişi, lisans, itibar (1–20), tanınırlık, gerçek (0/1).
47 oyuncu özelliği dosyada yok; editördeki `genAttrs` ile güç ve mevkiden hesaplanır.
