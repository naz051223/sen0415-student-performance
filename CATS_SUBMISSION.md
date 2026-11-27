# SEN0415 CATS Teslimi

**Proje** · Student Performance Analytics
**Ders** · SEN0415 Advanced Web Programming, İstanbul Kültür Üniversitesi
**Grup üyeleri** · Huriye Kayadelen — 2200005795 ve Tuba Nazlı İpekyüz — 2200004323

**Developed by Huriye Kayadelen & Tuba Nazlı İpekyüz**

[GitHub grup deposu](https://github.com/naz051223/sen0415-student-performance)

## Grup üyeleri ve iş dağılımı

| Öğrenci | Geliştirdiği eklenti ve görevleri |
| --- | --- |
| **Huriye Kayadelen — 2200005795** | **Student Performance** panel eklentisi. Öğrenci puanlarının görselleştirilmesi, ortalama ve başarı oranı, geçme barajı ayarı, filtreleme, sıralama, medyan, popülasyon standart sapması, puan dağılımı, en yüksek ve en düşük üç puan, açıklanabilir K-means, What-If Simulator ve duyarlı ana panel yerleşimi. |
| **Tuba Nazlı İpekyüz — 2200004323** | **Student Score Data** veri kaynağı ve **Student Performance Trend** panel eklentileri. JSON veri kaynağı ile CSV dashboard entegrasyonu, hafta aralığı ve veri kaynağı işlemleri, doğrusal regresyon, geçmiş tahmin hatası karşılaştırması, Grafana Live, otomatik testler ve demo hazırlığı. |

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
| YouTube demosu | **YouTube’da yayımlandı.** | [Final demoyu izle](https://youtu.be/IBee_j_KS1Y) |
| Testler ve UI/UX | **Uygulandı.** Üç eklenti için Jest, uyarlanabilir kartlar ve klavyeyle ayarlanabilen simülasyon kontrolü. |
| Very Big Bonus | **Destekleyici kanıt eklendi.** Uygunluk ve puan değerlendirmesi öğretim elemanına aittir. |

### Very Big Bonus — Supporting Evidence

- **Proje kalitesi.** Üç eklenti, öğretim elemanının sınıf sonuçlarını incelemesini, baraj altındaki kayıtları süzmesini ve farklı barajların etkisini karşılaştırmasını sağlar.
- **AI özelliklerinin özgün katkısı.** K-means mevcut puanları grup ortalaması, üye sayısı ve öğrenci listesiyle betimler. Ayrı Trend paneli haftalık sınıf ortalamasını tahmin eder.
- **Araştırma değeri.** Genişleyen geçmiş penceresiyle her kontrol yalnızca önceki haftaları kullanır. Beş kontrolde ortalama mutlak hata regresyon için 0,97, son gözlem yöntemi için 2,6 puandır. Kurgusal veri kümesi ve kısa hafta geçmişi, sonuçların başka sınıflara genellenmesini sınırlar.
- **Geliştirme yaklaşımı.** Analiz işlevleri arayüzden ayrıdır. Kaynak eklentisi Grafana DataFrame döndürür. Kilitli bağımlılıklar, 12 Jest testi ve tarayıcı kontrolleri sonuçların yeniden üretilmesini sağlar.

Daha uzun veri geçmişi, ayrı bir değerlendirme dönemi ve tahmin belirsizliği aralıkları yöntemin değerlendirilmesini güçlendirebilir. [README’deki ayrıntılı kanıtlar](README.md#very-big-bonus--supporting-evidence)

## Kurulum ve doğrulama

1. Proje kökünde Node.js 24 ile `npm ci` ve `npm run build` çalıştırın.
2. [README](README.md) içindeki Windows veya Docker Compose adımlarıyla Grafana’yı başlatın. Elle kurulum için üç eklenti kimliği, kaynak UID’leri ve dashboard içe aktarma adımları README’de yer alır.
3. `npm run typecheck`, `npm run lint` ve `npm test` ile kontrolleri tekrar çalıştırabilirsiniz.

TypeScript, ESLint, **12 Jest testi** ve üç üretim derlemesi başarılıdır. Grafana OSS 13.3.1’de üç eklentinin yüklenmesi ve dashboard JSON içe aktarma doğrulandı. Tarayıcı kontrolleri CSV ve JSON sorgularını, hafta filtresini, K-means gruplarını, simülasyon ve sıfırlamayı, Trend tahminini, Live ölçümlerini ve iki panelde görünen geliştirici adlarını kapsadı. 390 piksel görünüm, klavyeyle baraj ayarı ve geçerli puan içermeyen veri kümesi de tarayıcıda doğrulandı. Docker Compose yapılandırması doğrulandı. Çalışma zamanı kontrolleri Windows Grafana ile yapıldı.

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
