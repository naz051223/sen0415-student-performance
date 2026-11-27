# SEN0415 CATS teslim metni

**Proje** · Student Performance — Grafana

**Developed by Huriye Kayadelen & Tuba Nazlı İpekyüz**

**Grup üyeleri** · Huriye Kayadelen ve Tuba Nazlı İpekyüz

[GitHub grup projesi](https://github.com/naz051223/sen0415-student-performance)

## İş dağılımı

- **Huriye Kayadelen** · Student Performance panel eklentisi, puan hesapları, filtreleme ve sıralama, istatistikler ve puan dağılımı, açıklamalı K-means kümeleme ve What-If Simulator.
- **Tuba Nazlı İpekyüz** · Student Score Data veri kaynağı eklentisi ve Student Performance Trend panel eklentisi, doğrusal regresyon, geçmiş tahmin hatası karşılaştırması, Grafana Live entegrasyonu, otomatik testler ve demo hazırlığı.

## Uygulamadaki bonus özellikleri

| Kategori | Projedeki karşılığı |
| --- | --- |
| Veri kaynağı kullanımı | Grafana TestData üzerinden CSV sorgusu ve haftalık puanlar için Student Score Data. |
| Veri kaynağı işlemleri | CSV ve JSON okuma, dahilî ilk/son hafta filtrelemesi, bağlantı testi ve hata iletileri. |
| Özel veri kaynağı | Student Score Data, `week` ve `score` alanlarını DataFrame olarak döndüren Grafana eklentisi. |
| Panel işlemleri | Geçme barajı, sıralama ve filtre, puan dağılımı, medyan, popülasyon standart sapması, en yüksek ve en düşük üç kayıt, başarı oranı simülasyonu. |
| Ek panel | Student Performance Trend ile haftalık sınıf ortalaması tahmini ve geçmiş hata karşılaştırması. |
| AI | Puanlara dayalı açıklanabilir K-means kümeleme ve haftalık doğrusal regresyon. |
| GitHub | Grup deposu ve entegrasyon dalı. |
| Dokümantasyon | README, kurulum, dashboard içe aktarma ve bu teslim metni. |
| Kod kalitesi | TypeScript analiz modülü, test edilebilir hesaplamalar ve ESLint. |
| WebSocket | Grafana Live ile simüle edilmiş zaman serisi. |
| YouTube demo | Güncel demo arşivde video dosyası olarak yer alır. YouTube bağlantısı bulunmuyor. |
| Testler | Ana panel, Trend ve veri kaynağı için Jest senaryoları. |
| UI/UX | Dar panellere uyarlanan kartlar, klavyeyle değiştirilebilir simülasyon barajı ve hazır dashboard. |
| Very Big Bonus | Ölçütleri doğrulanmadığı için puan talep edilmiyor. |

## Teslim dosyaları

- `src/`, `trend/`, `score-data/` ve `tests/`
- `dist/`, `dist-trend/` ve `dist-score-data/`
- `demo/student-performance.json` ve ilgili provisioning dosyaları
- `README.md` ve `CATS_SUBMISSION.md`
- `demo/evidence/` altında Grafana ekran görüntüleri, test ve derleme çıktısı ve güncel demo

## Çalıştırma kanıtları

Grafana OSS 13.3.1 üzerinde iki özel panel ve özel veri kaynağı yüklendi. Dashboard otomatik yükleme ve JSON içe aktarma yoluyla açıldı. CSV sorgusu sekiz, özel kaynak bağlantı testi 16 örnek kayıt döndürdü. Tarayıcıda K-means sonuçları, simülasyon ve sıfırlama, haftalık filtre, 390 px görünüm ve canlı WebSocket ölçümleri doğrulandı.

| Dosya | İçerik |
| --- | --- |
| [01-dashboard.png](demo/evidence/01-dashboard.png) | İki geliştirici adı, sınıf istatistikleri, K-means ve canlı grafik. |
| [02-what-if.png](demo/evidence/02-what-if.png) | 100 puanlık simülasyon barajında güncellenen başarı oranı ve yüzde puan farkı. |
| [03-trend.png](demo/evidence/03-trend.png) | 9. hafta tahmini, geçmiş hata karşılaştırması ve geliştirici adları. |
| [04-data-source.png](demo/evidence/04-data-source.png) | Özel veri kaynağı ayarları ve başarılı bağlantı testi. |
| [05-responsive.png](demo/evidence/05-responsive.png) | 390 px genişlikte simülasyon kontrolleri. |
| [06-week-filter.png](demo/evidence/06-week-filter.png) | Son hafta 6 olarak filtrelendiğinde 7. hafta tahmini. |
| [07-tests-build.png](demo/evidence/07-tests-build.png) | TypeScript, ESLint, 12 Jest testi ve üç üretim çıktısının derleme sonuçları. |
| [student-performance-demo.mp4](demo/evidence/student-performance-demo.mp4) | Çalışan Grafana dashboard’undan alınmış 72 saniyelik, Türkçe açıklamalı ekran kaydı. |

Docker Compose yapılandırması doğrulandı. Grafana çalışma zamanı kontrolleri taşınabilir Windows sürümünde yapıldı.
