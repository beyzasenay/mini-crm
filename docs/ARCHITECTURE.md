# Teknik Mimari

## Genel Yapı

MiniCRM, Express.js tabanlı bir REST API uygulamasıdır. Verileri PostgreSQL veritabanında saklar ve Winston ile loglama yapar.

```
HTTP Request
    ↓
Express Middleware (traceId, httpLogger)
    ↓
Route Handler (Swagger documentation)
    ↓
Service Layer (Business Logic)
    ↓
Sequelize ORM
    ↓
PostgreSQL Database
```

## Katman Yapısı

### 1. Routes (`src/routes/`)

HTTP isteklerini işler. Swagger JSDoc yorumlarıyla API dokümante edilmiştir.

- `customers.js` - Müşteri CRUD işlemleri
- `products.js` - Ürün CRUD ve stok yönetimi
- `orders.js` - Sipariş oluşturma, durumu güncelleme

### 2. Services (`src/services/`)

İş mantığını ve validasyonu içerir.

- `customerService.js` - Müşteri işlemleri, duplicate kontrol
- `productService.js` - Ürün işlemleri, stok yönetimi
- `orderService.js` - Sipariş oluşturma, stok azaltma
- `duplicateService.js` - Telefon, email, ad duplikasyon kontrol

### 3. Models (`src/models/`)

Sequelize ORM modelleri.

- `customer.js` - Customer tablosu şeması
- `product.js` - Product tablosu şeması
- `order.js` - Order tablosu şeması
- `index.js` - Sequelize instance ve model associations

## Veri Modeli

### Customer (Müşteri)

| Alan | Tür | Gerekli | Açıklama |
|------|-----|---------|----------|
| id | INTEGER | ✓ | Primary key |
| firstName | STRING | ✓ | Adı |
| lastName | STRING | | Soyadı |
| phone | STRING | | Telefon (normalize edilir) |
| email | STRING | | E-posta |
| address | TEXT | | Adres |

**Kurallar:**
- firstName zorunludur
- E-posta ve telefon duplikatları algılanır
- Telefon numaraları normalleştirilir (9 sn 10 hane)

### Product (Ürün)

| Alan | Tür | Gerekli | Açıklama |
|------|-----|---------|----------|
| id | INTEGER | ✓ | Primary key |
| name | STRING | ✓ | Ürün adı |
| description | TEXT | | Açıklama |
| price | DECIMAL(10,2) | | Fiyat |
| stock | INTEGER | | Stok miktarı |
| isStockTracking | BOOLEAN | | Stok takip edilir mi? |
| isActive | BOOLEAN | | Aktif mi? |

**Kurallar:**
- Fiyat ve stok negatif olamaz
- Stok takip devre dışı ise stok güncellemesi yapılmaz

### Order (Sipariş)

| Alan | Tür | Gerekli | Açıklama |
|------|-----|---------|----------|
| id | INTEGER | ✓ | Primary key |
| customerId | INTEGER | | Müşteri ID (nullable) |
| guestFirstName | STRING | | Misafir adı |
| guestLastName | STRING | | Misafir soyadı |
| guestEmail | STRING | | Misafir e-posta |
| totalAmount | DECIMAL | | Toplam tutar |
| status | ENUM | | pending, processing, shipped, completed, cancelled |
| items | JSON | ✓ | Ürün listesi |

**Kurallar:**
- CustomerId veya misafir bilgileri zorunludur
- Items array'i zorunludur
- Sipariş oluşturulduğunda otomatik stok azaltılır

## ETL (Extract-Transform-Load)

CSV dosyasından müşteri verisi yükler.

### Desteklenen Başlıklar

- `firstName` veya `Ad` - Müşteri adı
- `lastName` veya `Soyad` - Soyadı
- `phone` veya `Telefon` - Telefon numarası
- `email` veya `E-posta` - E-posta adresi
- `address` veya `Adres` - Adres

### Veri Temizleme

ETL, verileri otomatik olarak temizler:

```javascript
// Telefon normalizasyonu
normalizePhone('(532) 111-2233') → '5321112233'

// E-posta validasyonu
validateEmail('test@example.com') → true

// Ad bölme
splitName('Ahmet Yılmaz') → { firstName: 'Ahmet', lastName: 'Yılmaz' }
```

Tüm işlemi görmek için: [src/etl/cleaners.js](../src/etl/cleaners.js)

## Middleware Katmanı

### traceId

Her request'e benzersiz bir ID atar. Logging ve hata ayıklamada kullanışlıdır.

```javascript
app.use(traceId); // req.traceId ≈ 'abc123def456'
```

### httpLogger

Winston logger ile her HTTP request'i loglar.

```javascript
GET /api/customers 200 45ms
POST /api/customers 201 67ms
```

### Hata Yönetimi

Tüm hataları yakalar ve uygun HTTP status koduyla döndürür:

- 400 - Geçersiz istek
- 404 - Kaynak bulunamadı
- 409 - Çakışma (duplikat)
- 500 - Sunucu hatası

## Test Mimarisi

Tests Jest kullanır. `tests/setup.js` test ortamını ayarlar.

### Test Veritabanı

`mini_crm_test` adında ayrı bir PostgreSQL veritabanı kullanır.

### Test Yardımcıları

`tests/helpers.js` ve `tests/mocks.js` test fixture'ları sağlar:

- `cleanDatabase()` - Veritabanını temizle
- `createTestCustomer()` - Test müşterisi oluştur
- `createTestProduct()` - Test ürünü oluştur
- `createTestOrder()` - Test siparişi oluştur

### Test Kapsamı

- **Unit Tests**: ETL temizleyiciler (27 test)
- **Integration Tests**: API endpoint'ler (36 test)

Detaylı bilgi: [TESTING.md](../TESTING.md)

## API Dokümantasyonu

OpenAPI 3.0 standardında Swagger UI ile dokümante edilmiştir.

```bash
npm start
# Ziyaret et: http://localhost:3000/api-docs
```

Dokumentasyon JSDoc yorumlarından otomatik oluşturulur:

```javascript
/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Müşterileri listele
 *     ...
 */
```

## Performans Hususları

1. **Database Indexes**: Primary key ve foreign key'ler otomatik indekslenir
2. **Limit**: Listeleme işlemlerinde 50-100 kayıt limiti
3. **Caching**: Şu anda caching yok (gelecek optimizasyon)
4. **Query Optimization**: Eager loading gerektiğinde kullanılıyor

## Güvenlik

1. **Input Validation**: Tüm girdiler validasyondan geçer
2. **SQL Injection**: Sequelize ORM koruma sağlar
3. **CORS**: Şu anda devre dışı (gerekirse etkinleştirilebilir)
4. **Rate Limiting**: Şu anda yok (gelecek feature)

## Dağıtım (Deployment)

### Environment Variables

`.env` dosyasında ayarla:

```env
NODE_ENV=production
DATABASE_URL=postgres://user:pass@localhost:5432/minicrm
PORT=3000
LOG_LEVEL=info
```

### Docker (İsteğe bağlı)

```bash
docker-compose up -d
npm start
```

### Healthcheck

```bash
curl http://localhost:3000/api/customers
# 200 döndürüyorsa sistem sağlık durumu iyi
```

## Gelecek İyileştirmeler

- [ ] Redis caching
- [ ] Rate limiting
- [ ] CORS yapılandırması
- [ ] Authentication/Authorization
- [ ] Pagination detaylı implementasyon
- [ ] E2E testler (Cypress)
- [ ] Metrics & Monitoring (Prometheus)
