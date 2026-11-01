# Dünya oyuncu ve personel veritabanı (kurgusal, otomatik üretildi) · v1.1

7.053 kulüp · 366.589 oyuncu · 85.448 personel (Süper Lig'de elle yazılan ~460 oyuncu/158 personel ayrıca `data/real_memory/` altında).
Veri editörünün üreticisiyle (`squadFor`, `staffFor`, `freeFor`, `retiredFor`) üretildi; aynı kulüp her zaman aynı kadroyu verir.

Takımlar: A takım (25) · Rezerv (20, itibarı 9 ve üstü kulüpler) · U19 (22) · Serbest oyuncu havuzu (ülke başına 8–300) · Emekli oyuncular (ülke başına 8–400).
Personel: kulüp başına 9–14 kişi + ülke başına serbest antrenör/personel havuzu.

Dosyalar: `oyuncular/<ülke>.json.gz`, `personel/<ülke>.json.gz` (gzip'li JSON dizisi).
Oyuncu satırı (24 sütun): ad, doğum (gg.aa.yyyy), uyruk, uyruk2, mevki, ayak, boy, kilo, forma no, piyasa değeri (avro), sözleşme bitişi, güç (1–20), potansiyel (1–20), milli takım, milli maç, milli gol, lakap, gerçek (0/1), kulüp, kulüp ülkesi, takım, emekli (0/1), son kulüp, emeklilik yılı.
Personel satırı (11 sütun): ad, doğum, uyruk, görev, kulüp, sözleşme bitişi, lisans, itibar (1–20), tanınırlık, gerçek (0/1), kulüp ülkesi.
47 oyuncu özelliği dosyada yok; editördeki `genAttrs` ile güç ve mevkiden hesaplanır.
