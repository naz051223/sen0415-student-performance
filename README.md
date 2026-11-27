# Student Performance

SEN0415 grup projesi, Grafana'da öğrenci puanlarını ve sınıfın haftalık eğilimini gösterir. Demo verileri kurgusaldır.

**Developed by Huriye Kayadelen & Tuba Nazlı İpekyüz**

[Grup projesinin GitHub deposu](https://github.com/naz051223/sen0415-student-performance)

## Grup üyeleri ve iş dağılımı

| Üye | Geliştirdiği Grafana eklentileri ve proje görevleri |
| --- | --- |
| Huriye Kayadelen | **Student Performance** ana paneli (`kultur-studentperformance-panel`). Puan hesapları, filtreleme, sıralama, medyan ve standart sapma, puan dağılımı, K-means ve açıklamaları, What-If Simulator. |
| Tuba Nazlı İpekyüz | **Student Score Data** veri kaynağı (`kultur-studentscore-datasource`) ve **Student Performance Trend** paneli (`kultur-studenttrend-panel`). Doğrusal regresyon, geçmiş hata karşılaştırması, Grafana Live entegrasyonu, otomatik testler ve demo hazırlığı. |

## Kurulum ve doğrulama

Node.js 24 ile proje klasöründe çalıştırın:

```text
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Jest üç eklentiyi sınar. Üretim çıktıları `dist/`, `dist-trend/` ve `dist-score-data/` klasörlerine yazılır.

**Windows.** Grafana 13.3.1'in taşınabilir **Standalone Windows Binaries** arşivini çıkarın. `-GrafanaHome` parametresine `bin` klasörünü içeren dizini verin. [Grafana OSS 13.3.1](https://grafana.com/grafana/download/13.3.1?edition=oss&platform=windows)

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\start-grafana.ps1 -GrafanaHome 'C:\grafana-13.3.1'
```

`http://127.0.0.1:3100/d/student-performance/student-performance` adresini açın. Başlatma betiği iki veri kaynağını ve dashboard'u yükler. Yerel çalışma verileri `.grafana-local/` altında tutulur.

**Docker Compose.** Docker motorunu başlatıp proje klasöründe aşağıdaki komutları çalıştırın.

```sh
docker compose config --quiet
docker compose up -d
```

`http://localhost:3000/d/student-performance/student-performance` adresini açın.

### Elle kurulum ve dashboard içe aktarma

| Derleme dizini | Eklenti kimliği |
| --- | --- |
| `dist/` | `kultur-studentperformance-panel` |
| `dist-trend/` | `kultur-studenttrend-panel` |
| `dist-score-data/` | `kultur-studentscore-datasource` |

Her derleme dizininin içeriğini Grafana eklenti dizininde kendi kimliğiyle adlandırılmış klasöre yerleştirin. Üç kimliği yerel Grafana örneğinde `GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS` ayarına virgülle ayrılmış biçimde ekleyin. `demo/provisioning/datasources/testdata.yaml` ile **Student Performance TestData** ve **Student Score Data** kaynaklarını tanımlayın. Grafana'da **Dashboards → New → Import** üzerinden `demo/student-performance.json` dosyasını yükleyin. Aynı UID ile otomatik yüklenen dashboard zaten varsa içe aktarma için farklı bir UID veya temiz bir Grafana örneği kullanın.

## Dashboard kullanımı

- **Sınıf sonuçları.** Grafana TestData ve CSV Content sorgusu kullanılır. Sorgu sayısal `score` ve isteğe bağlı metin `student` alanı döndürür. Geçme barajına eşit puanlar geçer. Boş, sonlu olmayan ve 0–100 dışındaki puanlar hesap dışı kalır. Sonuç filtresi tabloya uygulanır. Özet, dağılım, sıralama listeleri ve K-means tüm geçerli kayıtları kapsar. Standart sapma, gösterilen kayıtların popülasyon standart sapmasıdır.
- **K-means.** Puanlar en yakın ortalamaya göre kümelenir. Kartlar düşük, orta ve yüksek grupların üyelerini, sayısını ve ortalamasını gösterir. Bir veya iki farklı puan varsa grup sayısı azalır. Kümeleme mevcut puanları betimler ve gelecek sonuçları tahmin etmez.
- **What-If Simulator.** Kaydırıcı sınıfın simüle edilen başarı oranını anında günceller. Ekran mevcut oranı, simüle edilen oranı ve aradaki yüzde puan farkını gösterir. **Reset Simulation** kaydedilmiş baraja döner. Simülasyon panel ayarını veya sonuç filtresini değiştirmez.
- **Haftalık ortalama tahmini.** Student Score Data, eklentiyle gelen JSON dosyasından seçili hafta aralığını Grafana DataFrame olarak döndürür. Trend paneli haftalık ortalamaları hesaplar. En az dört farklı hafta olduğunda doğrusal regresyon ve son gözlem yöntemlerinin geçmiş deneylerdeki ortalama mutlak hatasını karşılaştırır. Sonraki hafta için geçmiş hatası daha düşük olan yöntemi kullanır. Demo Trend sorgusu 1–8. haftaları kapsar.
- **Canlı sinyal.** Grafana Live, WebSocket üzerinden `plugin/testdata/random-2s-stream` kanalına abone olur. Simüle edilen ölçümler yaklaşık iki saniyede bir gelir. Trend tahminleri JSON verisini kullanır.

## CATS teslimi

Gönderim metni, bonus karşılıkları ve kanıt dosyaları [CATS_SUBMISSION.md](CATS_SUBMISSION.md) içinde listelenir. Teslim arşivi kaynak kodunu, üretim çıktılarını ve demo kanıtlarını içerir.
