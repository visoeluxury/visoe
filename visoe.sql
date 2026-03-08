PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer', -- 'admin' atau 'customer'
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
, parent_id TEXT);
INSERT INTO "categories" ("id","slug","name","description","created_at","parent_id") VALUES('2yt5b1u6s9j','bags','Bags',NULL,'2026-03-07 14:45:38',NULL);
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL, -- Penting untuk barang premium
    condition TEXT NOT NULL, -- Misal: 'Pristine', 'Excellent', 'Very Good'
    description TEXT NOT NULL,
    price INTEGER NOT NULL, -- Disimpan dalam satuan terkecil (misal Rupiah tanpa desimal)
    compare_at_price INTEGER, -- Untuk fitur diskon / harga coret
    stock INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1, -- 1 = Aktif, 0 = Draft/Sembunyi
    images_json TEXT NOT NULL, -- Array URL dari R2 disimpan dalam format JSON (contoh: '["url1", "url2"]')
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, brand_serial TEXT, inclusions TEXT, dimensions TEXT, exterior_material TEXT, interior_material TEXT, hardware_color TEXT, model_name TEXT, production_year TEXT, color TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'shipped', 'completed', 'cancelled'
    total_amount INTEGER NOT NULL,
    shipping_address TEXT NOT NULL,
    tracking_number TEXT,
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);
CREATE TABLE order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase INTEGER NOT NULL, -- Menyimpan harga saat itu walau harga produk berubah nanti
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_active ON products(is_active);
