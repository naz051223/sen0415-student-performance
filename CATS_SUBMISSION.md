# SEN0415 CATS Teslimi

**Proje** · Student Performance Analytics
**Ders** · SEN0415 Advanced Web Programming, İstanbul Kültür Üniversitesi
**Grup üyeleri** · Huriye Kayadelen ve Tuba Nazlı İpekyüz

**Developed by Huriye Kayadelen & Tuba Nazlı İpekyüz**

Huriye Kayadelen ve Tuba Nazlı İpekyüz, CATS’a aynı `SEN0415_Huriye_Nazli_Final_Submission.zip` dosyasını yüklemeli ve kendi tesliminde iki grup üyesinin de adını belirtmelidir. [GitHub grup deposu](https://github.com/naz051223/sen0415-student-performance)

## Grup üyeleri ve iş dağılımı

| Öğrenci | Geliştirdiği eklenti ve görevleri |
| --- | --- |
| **Huriye Kayadelen** | **Student Performance** panel eklentisi. Öğrenci puanlarının görselleştirilmesi, ortalama ve başarı oranı, geçme barajı ayarı, filtreleme, sıralama, medyan, popülasyon standart sapması, puan dağılımı, en yüksek ve en düşük üç puan, açıklanabilir K-means, What-If Simulator ve duyarlı ana panel yerleşimi. |
| **Tuba Nazlı İpekyüz** | **Student Score Data** veri kaynağı ve **Student Performance Trend** panel eklentileri. JSON veri kaynağı ile CSV dashboard entegrasyonu, hafta aralığı ve veri kaynağı işlemleri, doğrusal regresyon, geçmiş tahmin hatası karşılaştırması, Grafana Live, otomatik testler ve demo hazırlığı. |

## Eklentiler ve başlıca özellikler

| Eklenti | Kimlik | İşlev |
| --- | --- | --- |
| **Student Performance** | `kultur-studentperformance-panel` | TestData CSV puanlarını gösterir. Sınıf istatistiklerini hesaplar, öğrencileri puan benzerliğine göre gruplar ve geçme barajı senaryolarını anlık karşılaştırır. |
| **Student Performance Trend** | `kultur-studenttrend-panel` | Haftalık ortalamaları çıkarır. Doğrusal regresyon ve son gözlemin geçmiş hatalarını karşılaştırır, sonraki haftanın sınıf ortalamasını tahmin eder. |
| **Student Score Data** | `kultur-studentscore-datasource` | Paketle gelen JSON puanlarını okur. İki sınır da dahil olacak şekilde hafta aralığını filtreler ve Grafana DataFrame döndürür. |

K-means grupları mevcut puanları betimler. Grafana Live grafiği WebSocket üzerinden ayrı bir simüle ölçüm akışı alır. Deneme puanları kurgusaldır.

## Bonus özellikleri

| Kategori | Durum ve kanıt |
| --- | --- |
| Veri kaynağı kullanımı ve işlemleri | **Uygulandı.** TestData CSV, paket içi JSON, hafta filtresi, DataFrame dönüşümü ve bağlantı testi. |
| Özel veri kaynağı | **Uygulandı.** Student Score Data eklentisi. |
| Panel işlemleri ve ek panel | **Uygulandı.** Puan tablosu, sınıf istatistikleri, baraj simülasyonu ve ayrı Trend paneli. |
| AI | **Uygulandı.** Açıklamalı K-means ve doğrusal regresyonla haftalık sınıf ortalaması tahmini. |
| GitHub | **Uygulandı.** Grup deposu ve commit geçmişi, kaynak kodu, entegrasyon ve teslim güncellemesini belgeliyor. |
| Dokümantasyon ve kod kalitesi | **Uygulandı.** Ayrıntılı İngilizce README, kurulum adımları, TypeScript, ESLint ve testler. |
| WebSocket | **Uygulandı.** Grafana Live grafiğinde zaman damgalı ölçümler doğrulandı. |
| YouTube demosu | **Yayımlanmadı.** Güncel MP4 arşivdedir. |
| Testler ve UI/UX | **Uygulandı.** Üç eklenti için Jest, uyarlanabilir kartlar ve klavyeyle ayarlanabilen simülasyon kontrolü. |
| Very Big Bonus | **Doğrulanmadı.** Ölçütler ve uygunluk teyit edilmedi. |

## Kurulum ve doğrulama

1. Proje kökünde Node.js 24 ile `npm ci` ve `npm run build` çalıştırın.
2. [README](README.md) içindeki Windows veya Docker Compose adımlarıyla Grafana’yı başlatın. Elle kurulum için üç eklenti kimliği, kaynak UID’leri ve dashboard içe aktarma adımları README’de yer alır.
3. `npm run typecheck`, `npm run lint` ve `npm test` ile kontrolleri tekrar çalıştırabilirsiniz.

TypeScript, ESLint, **12 Jest testi** ve üç üretim derlemesi başarılıdır. Grafana OSS 13.3.1’de üç eklentinin yüklenmesi ve dashboard JSON içe aktarma doğrulandı. Tarayıcı kontrolleri CSV ve JSON sorgularını, hafta filtresini, K-means gruplarını, simülasyon ve sıfırlamayı, Trend tahminini, Live ölçümlerini ve iki panelde görünen geliştirici adlarını kapsadı. Docker Compose yapılandırması doğrulandı. Çalışma zamanı kontrolleri Windows Grafana ile yapıldı.

## Ekran görüntüleri ve demo

| Dosya | İçerik |
| --- | --- |
| [01-main-panel.png](demo/evidence/screenshots/01-main-panel.png) | Ana panel ve iki geliştirici adı. |
| [02-student-statistics.png](demo/evidence/screenshots/02-student-statistics.png) | Puanlar, sınıf istatistikleri, sıralama ve geçenler filtresi. |
| [03-kmeans-clustering.png](demo/evidence/screenshots/03-kmeans-clustering.png) | Gruplar, üye sayıları, ortalamalar ve açıklama. |
| [04-what-if-simulator.png](demo/evidence/screenshots/04-what-if-simulator.png) | Değiştirilen simülasyon barajı, iki başarı oranı ve yüzde puan farkı. |
| [05-trend-prediction.png](demo/evidence/screenshots/05-trend-prediction.png) | Haftalık tahmin, iki yöntemin geçmiş hataları ve geliştirici adları. |
| [06-data-source.png](demo/evidence/screenshots/06-data-source.png) | Özel veri kaynağı yapılandırması ve başarılı bağlantı testi. |
| [07-live-data.png](demo/evidence/screenshots/07-live-data.png) | Zaman damgalı ölçümler alan Grafana Live grafiği. |
| [08-tests-and-build.png](demo/evidence/screenshots/08-tests-and-build.png) | Çalıştırılan TypeScript, ESLint, Jest ve üretim derlemesi komutlarının çıktısı. |

Son demo, çalışan Grafana üzerinde kaydedilmiş 1 dakika 58 saniyelik H.264 MP4 dosyasıdır. İki geliştirici adı, öğrenci tablosu, baraj ve filtre seçenekleri, K-means, simülasyon, haftalık tahmin, veri kaynağı ve Live grafiği gösterilir. [SEN0415_Huriye_Nazli_Final_Demo.mp4](demo/evidence/SEN0415_Huriye_Nazli_Final_Demo.mp4)

Arşivde üç eklentinin kaynak kodu ve üretim çıktıları, yapılandırma, dashboard JSON, otomatik testler, bu teslim metni, README ve güncel medya bulunur.
