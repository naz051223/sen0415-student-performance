# Student Performance

SEN0415 için Grafana paneli. Bir Grafana sorgusundan öğrenci puanlarını alır, ortalama ve başarı oranını hesaplar, puanları sıralar. Geçme barajı panel ayarından değiştirilebilir. Geçenler ve baraj altında kalanlar panelde filtrelenebilir. Özet kartları sorgudaki tüm geçerli kayıtları kapsar.

## Derleme

Node.js ile proje klasöründe `node build.mjs` veya `npm run build` çalıştır. Derleme çıktıları `dist/`, `dist-trend/` ve `dist-score-data/` klasörlerine yazılır. Paket kurulumu gerekmez.

`node --test` ile geçme barajı, geçersiz puanlar, sıralama ve sorgu hatası kontrollerini çalıştır.

## Grafana'da deneme

**Windows, taşınabilir Grafana.** [Resmi Grafana indirme sayfasından](https://grafana.com/grafana/download?edition=oss&platform=windows) Windows **Standalone Windows Binaries** arşivini edin ve çıkar. İçinde `bin` klasörü bulunan dizini kullan.

```powershell
node build.mjs
.\start-grafana.ps1 -GrafanaHome 'C:\grafana'
```

`http://127.0.0.1:3100/d/student-performance/student-performance` adresini aç. TestData ve dashboard otomatik yüklenir. Demo panelinde Huriye Kayadelen ve Tuba Nazlı İpekyüz görünür. Yerel veri dosyaları `.grafana-local/` altında tutulur.

**Ubuntu 22.04 ve Docker Desktop.** Windows’ta Docker Desktop’ı WSL 2 motoruyla başlat. **Settings → Resources → WSL Integration** altında Ubuntu 22.04’ü etkinleştir. Ubuntu terminalinde proje klasörüne geçip şu komutları çalıştır.

```bash
npm run build
npm test
docker compose up -d
```

Ardından `http://localhost:3000/d/student-performance/student-performance` adresini aç.

## Bonus özellikler

- **Student Performance.** Grafana TestData sorgusunun puanlarından özet ve sıralama üretir. Sonuç filtresi ve geçme barajı ayarı bulunur. Dar panelde özet kartları alt alta dizilir.
- **Student Score Data.** Yeni veri kaynağı eklentisi, birlikte gelen kurgusal JSON dosyasını okur ve ilk/son hafta seçenekleriyle filtreler. Sonuçları Grafana veri çerçevesi olarak döndürür. Dosya ve sorgu hataları Grafana’da görünür.
- **Student Performance Trend.** İkinci panel, aynı haftanın puanlarını ortalayıp bir sonraki haftanın sınıf ortalamasını tahmin eder. Tarayıcıda doğrusal regresyon ile son gözlemi karşılaştırır. Dördüncü haftadan başlayarak önceki haftalarla her bir haftayı tahmin eder ve iki yöntemin ortalama mutlak hatasını gösterir. Hatası daha düşük olan yöntemle bir sonraki hafta tahmin edilir. Bu karşılaştırma ayrı bir son test kümesi kullanmaz. Veri, gerçek öğrenci sonuçlarını temsil etmez.
- **Canlı sinyal.** Grafana Live’ın `plugin/testdata/random-2s-stream` kanalından WebSocket ile yaklaşık iki saniyede bir simüle edilmiş ölçüm alır. Ölçümler tahmin panelinin eğitim verisine katılmaz.
- **Testler.** `npm test` ile filtre, geçme barajı, tahmin, veri kaynağı ve hata durumları denetlenir.

### Elle kurulum

Grafana'nın yerel geliştirme yapılandırmasında her derleme dizininin içeriğini eklenti dizininde kendi kimliğiyle adlandırılmış klasöre yerleştir.

| Derleme dizini | Eklenti kimliği |
| --- | --- |
| `dist/` | `kultur-studentperformance-panel` |
| `dist-trend/` | `kultur-studenttrend-panel` |
| `dist-score-data/` | `kultur-studentscore-datasource` |

Yerel deneme örneğinde bu üç kimliği `GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS` ayarında virgülle ayır. Elle kurulumda aşağıdaki adımlar ana panelin kurulmasını sağlar. Üç görselleştirmenin otomatik kurulumu için Docker Compose veya Windows başlatma betiğini kullan.

1. **Connections → Data sources** altında **TestData** ekle.
2. Bir dashboard oluştur. Veri kaynağı olarak **TestData**, görselleştirme olarak **Student Performance** seç.
3. Sorguda **CSV Content** senaryosunu seçip `demo/students.csv` içeriğini yapıştır.
4. **Grup üyeleri** alanına ad ve soyadları gir. **Geçme barajı** varsayılan olarak 60'tır. Dashboard'u kaydet.

Sorgu, zorunlu sayısal `score` ve isteğe bağlı metin `student` alanı döndürür. Geçme barajına eşit puanlar geçer. Boş, sonlu olmayan ve 0–100 dışındaki puanlar hesaplardan çıkarılır. Demo tamamen örnek verilerden oluşur.

## CATS teslimi

- `kultur-studentperformance-panel.zip` — Proje kaynak kodu ve kurulum dosyaları
- `student-performance-grafana.jpg` — Grup üyelerinin adlarının göründüğü Grafana ekran görüntüsü
- `student-performance-demo.mp4` — 1 dakika 10 saniyelik demo videosu
