# Kullanıcı Kılavuzu

## Giriş

MiniCRM, işletmenizin müşteri, ürün ve sipariş bilgilerini yönetmek için tasarlanmış basit bir sistemdir. Bu kılavuz adım adım kullanımı anlatır.

## Sistemi Başlatma

### İlk Kurulum

1. Node.js ve PostgreSQL yüklü olduğundan emin olun
2. Proje klasörüne gidin:
   ```bash
   cd mini-crm
   ```

3. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

4. Veritabanını başlatın:
   ```bash
   docker-compose up -d
   ```

5. Sunucuyu başlatın:
   ```bash
   npm start
   ```

Sistem `http://localhost:3000` adresinde çalışıyor olmalı.

### API Dokümantasyonunu Görüntüleme

Tarayıcınızda `http://localhost:3000/api-docs` adresine gidin. Burada tüm API işlemlerini deneyebilirsiniz.

## Müşteri Yönetimi

### Müşteri Ekleme

Yeni bir müşteri eklemek için:

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "phone": "5321234567",
    "email": "ahmet@example.com",
    "address": "İstanbul, Türkiye"
  }'
```

Başarılı olduğunda 201 status kodu döner.

### Müşterileri Listeleme

```bash
curl http://localhost:3000/api/customers
```

Tüm müşterileri gösterir.

### Belirli Müşteri Bilgilerine Erişme

```bash
curl http://localhost:3000/api/customers/1
```

ID 1 olan müşterinin bilgilerini gösterir.

### Müşteri Bilgisini Güncelleme

```bash
curl -X PUT http://localhost:3000/api/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5329876543"
  }'
```

Sadece güncellemek istediğiniz alanları gönderin.

### Müşteri Silme

```bash
curl -X DELETE http://localhost:3000/api/customers/1
```

Müşteri kaydını siler.

## Ürün Yönetimi

### Ürün Ekleme

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "USB Kablo",
    "description": "Yüksek kaliteli USB-C kablo",
    "price": 29.99,
    "stock": 100
  }'
```

### Ürünleri Listeleme

```bash
curl http://localhost:3000/api/products
```

### Ürün Stok Azaltma

Sipariş oluşturulduğunda otomatik yapılır. El ile yapmanız gerekirse:

```bash
curl -X POST http://localhost:3000/api/products/1/decrease-stock \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

## Sipariş Yönetimi

### Müşteri İçin Sipariş Oluşturma

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [
      {
        "productId": 1,
        "quantity": 2
      },
      {
        "productId": 2,
        "quantity": 1
      }
    ]
  }'
```

### Misafir İçin Sipariş Oluşturma

Müşteri hesabı olmayan kişi için:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "guestFirstName": "Ayşe",
    "guestLastName": "Kaya",
    "guestEmail": "ayse@example.com",
    "guestPhone": "5329876543",
    "items": [
      {
        "productId": 1,
        "quantity": 1
      }
    ]
  }'
```

### Siparişleri Listeleme

```bash
curl http://localhost:3000/api/orders
```

Filtreleme:

```bash
# Belirli müşterinin siparişleri
curl http://localhost:3000/api/orders?customerId=1

# Belirli durumundaki siparişler
curl http://localhost:3000/api/orders?status=pending
```

### Sipariş Durumunu Güncelleme

Sipariş durumu: `pending`, `processing`, `shipped`, `completed`, `cancelled`

```bash
curl -X PUT http://localhost:3000/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "processing"}'
```

## Veri Yükleme (CSV)

CSV dosyasından müşteri bilgilerini toplu yükleyebilirsiniz.

### CSV Dosya Formatı

```csv
Ad,Soyad,Telefon,Adres,Not
Ahmet,Yılmaz,5321234567,İstanbul,VIP müşteri
Ayşe,Kaya,5329876543,Ankara,Yeni müşteri
```

Veya İngilizce başlıklar:

```csv
firstName,lastName,phone,address,email
John,Doe,5321234567,Istanbul,john@example.com
Jane,Smith,5329876543,Ankara,jane@example.com
```

### Yükleme İşlemi

```bash
node src/etl/cli.js customers.csv etl-report.json
```

Dosya `etl-report.json` adıyla rapor oluşturur.

### Rapor Örneği

```json
{
  "totalRows": 100,
  "successCount": 98,
  "errorCount": 2,
  "errors": [
    {
      "row": 5,
      "reason": "Invalid email format"
    }
  ]
}
```

## Hata Yönetimi

API hata durumlarında açıklayıcı mesajlar döner:

### 400 - Geçersiz İstek

```json
{
  "message": "`firstName` is required"
}
```

**Çözüm**: Zorunlu alanları kontrol edin.

### 404 - Bulunamadı

```json
{
  "message": "Customer not found"
}
```

**Çözüm**: Doğru ID'yi kullandığınızdan emin olun.

### 409 - Çakışma

```json
{
  "message": "Duplicate customer detected",
  "duplicate": {
    "reason": "email",
    "customer": {
      "id": 5,
      "email": "ahmet@example.com"
    }
  }
}
```

**Çözüm**: Aynı e-posta veya telefon numarası zaten kayıtlı. Farklı bir değer kullanın.

### 500 - Sunucu Hatası

```json
{
  "message": "Internal server error"
}
```

**Çözüm**: Sunucu loglarını kontrol edin. Veritabanı bağlantısını doğrulayın.

## Sık Sorulan Sorular

### S: Siparişimde stok olmayan bir ürün varsa ne olur?

**C**: Sipariş oluşturulamaması hatası döner. Öncesinde ürün stoğunu kontrol edin.

### S: Siparişi oluşturduktan sonra silersem ne olur?

**C**: Sipariş silinir. Stok otomatik olarak geri yüklenmez. Ürünü manuel olarak güncelleyin.

### S: Müşteri telefon numarasını değiştirmem gerekirse?

**C**: PUT endpoint'ini kullanarak güncelleme yapabilirsiniz. Yeni numara otomatik olarak normalize edilir.

### S: Toplu müşteri yüklemesi başarısız olursa?

**C**: Raporu kontrol edin. Hataları düzeltin ve dosyayı tekrar yükleyin. Başarılı kayıtlar tekrar eklenmeyecektir.

## Teknik Destek

Sorun yaşıyorsanız:

1. **Logları kontrol edin**: Sunucu konsol çıktısına bakın
2. **Veritabanı bağlantısı**: PostgreSQL çalışıyor mu?
3. **Port uygunluğu**: 3000 portu başka bir uygulama tarafından kullanılıyor mu?
4. **Mimari bilgi**: [ARCHITECTURE.md](ARCHITECTURE.md) teknik detayları içerir

## Daha Fazla Bilgi

- API komut referansı için [http://localhost:3000/api-docs](http://localhost:3000/api-docs) ziyaret edin
- Test çalıştırma için [TESTING.md](../TESTING.md) okuyun
- Teknik tasarım hakkında [ARCHITECTURE.md](ARCHITECTURE.md) okuyun
