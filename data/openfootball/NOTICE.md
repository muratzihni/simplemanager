# Open Football verisi (üçüncü taraf)

Kaynak: https://github.com/ZOXEXIVO/open-football (Apache License 2.0, Artemov Ivan). Alınan sürüm: 1.8.190, `src/database/src/data/database.db` (gzip'li JSON).

Bu depoya aktarılanlar:
- `design/ve-op-*.js`: 72.930 oyuncu (ad, doğum tarihi, uyruk, mevki puanları, mevcut/potansiyel yetenek, özellikler, kulüp geçmişi, milli takım maç/gol, sözleşme, piyasa değeri, kiralık, Transfermarkt kimliği). Yalnızca kulübü bizim kulüp listemizle eşleşen oyuncular alındı.
- `real4.json`: 1.747 kulübün tesis, finans, ortalama seyirci, renk, rakip ve felsefe bilgisi; 157 ligin kademe, yükselme/düşme sayısı ve itibarı.
- `cmatch.json`: onların kulüp kimliği → bizim kulüp adı eşlemesi (ad benzerliği ile; 1.780 kulüp). Yanlış eşleşme olabilir.
- `convert_of.py`, `convert_of2.py`, `cmap.json`: dönüştürme betikleri.

Apache-2.0 gereği kaynak ve lisans belirtilmiştir. Verinin kendisi Transfermarkt kimlikleri taşıdığı için büyük olasılıkla oradan türetilmiştir; altındaki verinin hakkı hakkında bir şey söylenemez. Değerler 2025/26 sezonuna aittir, 01.11.2026 kadroları değildir.
