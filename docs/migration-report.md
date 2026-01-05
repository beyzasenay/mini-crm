# Migration Report — Stage 2 (Database fixes and additions)

Tarih: 2026-01-05

Özet:
- Mevcut `customers` migration dosyası zaten `last_name` ve `address` alanlarını `allowNull: true` olarak tanımlıyor; bu nedenle müşteri tablosu için ek değişiklik gerekmemiştir.
- Yeni `products` migration dosyası eklendi: stok takibi ve fiyat tipi alanları eklendi.
- `orders` tablosu için yeni bir migration eklendi: `status` alanı enum olarak güncellendi ve `customer_id` alanına foreign key constraint eklendi.

Detaylar:

1) customers table
-  `migrations/20240101000000-create-customer.js` migrationunda `last_name` ve `address` zaten nullable olarak tanımlanmıştı. Dolayısıyla gereksinim karşılanmış durumda.

2) products table (yeni migration)
- Dosya: `migrations/20260105000000-create-product.js`
- Oluşturulan alanlar:
  - `name` (string, NOT NULL)
  - `description` (text, nullable)
  - `price` (decimal(10,2), default 0.00)
  - `price_type` (enum: 'fixed', 'variable', default 'fixed')
  - `is_stock_tracking` (boolean, default true)
  - `stock` (integer, default 0)
- Geri alınabilir (`down`) işlem: tablo drop edilir; Postgres'te enum tipi temizlenir.

3) orders table (alter migration)
- Dosya: `migrations/20260105000001-update-orders-add-constraints.js`
- Yapılan değişiklikler (`up`):
  - Mevcut `status` değeri NULL olan kayıtlar `pending` olarak güncellenir.
  - `status` alanı `ENUM('pending','processing','shipped','cancelled','completed')`, NOT NULL ve default `pending` olarak değiştirilir.
  - `customer_id` için foreign key constraint `fk_orders_customer_id` eklendi (referans: `customers.id`, `ON DELETE CASCADE`).
- Geri alınabilir (`down`): constraint kaldırılır, `status` tekrar `STRING` ve nullable yapılır, enum tipi Postgres'te silinir.

Notlar / Riskler:
- Eğer production'da mevcut veri varsa, `status` alanını ENUM'a çevirmeden önce veri temizliği yapılmalıdır (ör. beklenmeyen status değerleri). Migration zaten NULL'ları `pending` yapıyor fakat farklı string değerleri ENUM'a uymayabilir ve migration hata verebilir.
- ENUM tipi Postgres'e özgü davranır; kullanılan dialect farklıysa test edilmelidir.

Sonraki adımlar:
- Değişiklikleri yerel test veritabanında uygulayıp doğrulanacak (`npm run migrate` veya `npx sequelize db:migrate` ile).
