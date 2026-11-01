# Dünya oyuncu ve personel veritabanı: üretilmiş kısım (kurgusal) · v1.2

7.053 kulüp için 324.563 üretilmiş oyuncu ve 85.448 personel. Gerçek isimli 72.930 oyuncu (Open Football, Apache-2.0) bu dosyalarda değil, `design/ve-op-*.js` içinde; eşleşen kulüplerde kurgusal kadro üretilmedi.
Veri editörünün üreticisiyle (`squadFor`, `staffFor`, `freeFor`, `retiredFor`) üretildi; aynı kulüp her zaman aynı kadroyu verir.

Takımlar: A takım (25 ya da eksik kısmı) · Rezerv (20, itibarı 9 ve üstü) · U19 (22) · Serbest oyuncu havuzu · Emekli oyuncular. Personel: kulüp başına 9–14 kişi + ülke başına serbest havuz.

Dosyalar: `oyuncular/<ülke>.json.gz`, `personel/<ülke>.json.gz`.
Oyuncu satırı (24 sütun): ad, doğum (gg.aa.yyyy), uyruk, uyruk2, mevki, ayak, boy, kilo, forma no, piyasa değeri (avro), sözleşme bitişi, güç (1–20), potansiyel (1–20), milli takım, milli maç, milli gol, lakap, gerçek (0/1), kulüp, kulüp ülkesi, takım, emekli (0/1), son kulüp, emeklilik yılı.
Personel satırı (11 sütun): ad, doğum, uyruk, görev, kulüp, sözleşme bitişi, lisans, itibar (1–20), tanınırlık, gerçek (0/1), kulüp ülkesi.
