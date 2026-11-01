# Kesinleştirilmiş veritabanı: Varsayılan Veritabanı v1.1

Oyun başlangıcında (Ülke ve Lig Seçimi) seçilebilen tek veritabanıdır; Ayarlar'da veritabanı satırı kilitlidir.
İçerik: 7.053 kulüp · 367.052 oyuncu · 85.606 personel · 77 temsilci (tarih: 01.11.2026).

`DATABASE.json` her veri dosyasının SHA-256 özetini tutar. Veri değiştiyse `python3 data/db/manifest_tool.py verify` fark bildirir.
Yeni sürüm gerekiyorsa sürümü bilerek yükseltip `build` çalıştırın (v1.1, v2.0…).

## Sürüm geçmişi
- v1.1: aynı adlı kulüplerin eksik kadroları eklendi; rezerv ve U19 takımları, serbest ve emekli oyuncu havuzları, serbest personel eklendi (174.038 → 367.052 oyuncu).
- v1.0: ilk kesinleştirme (174.038 oyuncu, 81.959 personel).
