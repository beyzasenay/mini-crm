# MiniCRM - Müşteri ve Sipariş Yönetim Sistemi

**Öğrenci:** Beyza Nur Şenay (245129030)  
**Ders:** Bilgisayar Mühendisliğinde Özel Konular  

---

## Proje Hakkında


### Proje Kapsamı

Bu proje şu ana görevleri içermektedir:

- **Müşteri Yönetimi:** Müşteri kayıtlarının oluşturulması, güncellenmesi, silinmesi ve duplicate kontrolü
- **Ürün Yönetimi:** Ürün bilgileri ve stok takibi
- **Sipariş Yönetimi:** Sipariş oluşturma, durum yönetimi ve stok kontrolü
- **Veri Geçişi (ETL):** Excel/CSV dosyalarından müşteri verilerinin aktarılması
- **Loglama Sistemi:** Request/response logları ve hata izleme
- **Veritabanı Migrasyonları:** Şema yönetimi ve versiyonlama

## Hızlı Başlangıç

### Sistem Gereksinimleri

- Node.js 16+
- PostgreSQL 12+
- Docker ve Docker Compose (isteğe bağlı)

### Kurulum ve Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Veritabanını başlat (Docker Compose ile)
docker-compose up -d

# Test et
npm test

# Uygulamayı başlat
npm start
```

API dokümantasyonu otomatik olarak `http://localhost:3000/api-docs` adresinde kullanılabilir olacaktır.

## Proje Yapısı

```
mini-crm/
├── src/
│   ├── app.js                      # Express uygulaması
│   ├── server.js                   # Sunucu başlatma
│   ├── config/                     # Konfigürasyon
│   ├── models/                     # Veritabanı modelleri
│   ├── routes/                     # API rotaları
│   ├── services/                   # İş mantığı
│   ├── etl/                        # Veri geçişi araçları
│   ├── lib/                        # Yardımcı kütüphaneler
│   └── middleware/                 # Express middleware
├── migrations/                     # Veritabanı migrasyonları
├── tests/                          # Test dosyaları
├── docs/                           # Dokümantasyon
└── data/                           # Örnek veriler
```

Detaylı proje yapısı ve katman tasarımı için bkz. [Teknik Mimari](docs/ARCHITECTURE.md)

## Ana Özellikler

### 1. Müşteri Yönetimi
- Müşteri bilgilerinin kaydedilmesi (ad, soyadı, telefon, e-posta, adres)
- Duplicate müşteri kontrolü
- Telefon numarası normalizasyonu

### 2. Ürün ve Stok Yönetimi
- Ürün bilgileri kayıt ve güncelleme
- Stok takip sistemi (takibi açılıp kapatılabilen ürünler)
- Sipariş sırasında otomatik stok kontrolü

### 3. Sipariş Yönetimi
- Müşteri sipariş ve misafir sipariş türleri
- Sipariş durumu yönetimi (pending, processing, shipped, completed, cancelled)
- Stok otomatik azaltma

### 4. ETL (Veri Geçişi)
- CSV/Excel dosyalarından müşteri verilerinin aktarılması
- Veri temizleme ve normalleştirme
- Hatalı kayıtların raporlanması

### 5. Loglama ve İzleme
- Request/response logları
- Hata logları
- Trace ID mekanizması
- Yapılandırılabilir log seviyeleri

## Dokümantasyon

### Teknik Dokümantasyon
Proje dokümantasyonları `docs/` klasöründe bulunmaktadır

| Doküman | Açıklama |
|---------|----------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Sistem mimarisi, katman tasarımı ve veri modelleri |
| [TESTING.md](docs/TESTING.md) | Test stratejisi, Jest yapılandırması ve test yazma rehberi |
| [USER_GUIDE.md](docs/USER_GUIDE.md) | Kullanıcı kılavuzu ve API işlemleri (curl örnekleri) |
| [requirements analysis.md](docs/requirements%20analysis.md) | Gereksinim analizi ve müşteri talebi dokümantasyonu |
| [migration-report.md](docs/migration-report.md) | Veritabanı migrasyonları hakkında bilgi |

### Test ve Sistem Raporları
Proje tamamlandıktan sonra hazırlanan test ve sistem durumu raporları:

| Rapor | Açıklama |
|-------|----------|
| [TEST_REPORT.md](TEST_REPORT.md) | Detaylı test sonuçları, 63/63 test başarısı, kod kalitesi metrikleri |
| [SYSTEM_STATUS_REPORT.md](SYSTEM_STATUS_REPORT.md) | Sistem sağlığı, veritabanı şeması, API durumu ve log örnekleri |

## Geliştirme

### Geliştirme Modu
```bash
npm run dev
```
Nodemon kullanarak otomatik yeniden yüklenme sağlar.

### Kod Kalitesi
```bash
# ESLint ile kodun kontrolü
npm run lint

# Kodu otomatik düzeltme
npm run lint:fix

# Kod formatlaması
npm run format
```

### Test Yazma
Detaylı test yazma rehberi için [TESTING.md](docs/TESTING.md) dosyasını inceleyiniz.

```bash
# Tüm testleri çalıştır
npm test

# Watch modunda testler
npm run test:watch

# Coverage raporu ile testler
npm run test:coverage
```

## API Uçları

### Müşteriler
- `GET /api/customers` - Tüm müşterileri listele
- `POST /api/customers` - Yeni müşteri oluştur
- `GET /api/customers/:id` - Müşteri bilgilerini al
- `PUT /api/customers/:id` - Müşteri bilgilerini güncelle
- `DELETE /api/customers/:id` - Müşteri sil

### Ürünler
- `GET /api/products` - Tüm ürünleri listele
- `POST /api/products` - Yeni ürün oluştur
- `GET /api/products/:id` - Ürün bilgilerini al
- `PUT /api/products/:id` - Ürün bilgilerini güncelle
- `DELETE /api/products/:id` - Ürün sil

### Siparişler
- `GET /api/orders` - Tüm siparişleri listele
- `POST /api/orders` - Yeni sipariş oluştur
- `GET /api/orders/:id` - Sipariş bilgilerini al
- `PUT /api/orders/:id` - Sipariş durumunu güncelle

Tüm API uçları ve detaylı parametreler için `http://localhost:3000/api-docs` adresindeki Swagger dokümantasyonunu inceleyiniz.

## Veri Geçişi (ETL)

Mevcut Excel/CSV dosyalarındaki müşteri verilerini sisteme aktarmak için:

```bash
npm run etl -- --input data/customers.csv --output etl-report.json
```

ETL işlemi sırasında:
- Telefon numaraları normalleştirilir
- E-posta adresleri doğrulanır
- Ad/soyad bilgileri temizlenir
- Duplicate kayıtlar algılanır

Detaylı ETL bilgileri için [migration-report.md](docs/migration-report.md) dosyasını inceleyiniz.

## Veritabanı Migrasyonları

Veritabanı şemasını güncellemek için:

```bash
npm run migrate
```

Mevcut migrasyonlar:
- Müşteri tablosu oluşturma
- Ürün tablosu oluşturma
- Sipariş tablosu oluşturma
- Kısıtlamalar ve indeksler

Detaylı migrasyonlar için [migrations/](migrations/) klasörünü inceleyiniz.

## Çevresel Değişkenler

`.env` dosyasında aşağıdaki değişkenleri tanımlayınız:

```env
# Sunucu
NODE_ENV=development
PORT=3000

# Veritabanı
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mini_crm
DB_USER=postgres
DB_PASSWORD=postgres

# Loglama
LOG_LEVEL=info
```

## Lisans

MIT

---
