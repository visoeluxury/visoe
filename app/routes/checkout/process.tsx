import { createRoute } from 'honox/factory';
import { generateId } from '../../utils/admin_utils'; // Menggunakan utils yang dibuat sebelumnya

export const POST = createRoute(async (c) => {
  const formData = await c.req.parseBody();
  const db = c.env.DB;

  const name = formData.name as string;
  const email = formData.email as string;
  const phone = formData.phone as string;
  const address = formData.address as string;
  const cartDataRaw = formData.cart_data as string;

  if (!cartDataRaw) {
    return c.redirect('/checkout');
  }

  const cart = JSON.parse(cartDataRaw) as any[];
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const orderId = 'ORD-' + Date.now().toString().substring(5) + generateId().substring(0, 4).toUpperCase();
  const tempUserId = 'GUEST-' + generateId();

  // 1. Simpan Data Pelanggan (Gunakan ON CONFLICT untuk update jika email sudah pernah belanja)
  await db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, phone, address)
    VALUES (?, ?, ?, ?, 'customer', ?, ?)
    ON CONFLICT(email) DO UPDATE SET 
      name = excluded.name, 
      phone = excluded.phone, 
      address = excluded.address
  `).bind(tempUserId, name, email, 'guest-account', phone, address).run();

  // Ambil ID user final (karena kalau ON CONFLICT jalan, ID asli tetap yang lama)
  const userRecord = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  const finalUserId = userRecord ? userRecord.id : tempUserId;

  // 2. Simpan Rekaman Pesanan (Tabel Orders)
  await db.prepare(`
    INSERT INTO orders (id, user_id, status, total_amount, shipping_address, payment_method)
    VALUES (?, ?, 'pending', ?, ?, 'Manual Bank Transfer')
  `).bind(orderId, finalUserId, totalAmount, address).run();

  // 3. Simpan Detail Item (Tabel Order Items menggunakan Batch API agar hemat koneksi)
  const stmt = db.prepare(`INSERT INTO order_items (id, order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?, ?)`);
  const batchStatements = cart.map(item => 
    stmt.bind(generateId(), orderId, item.id, item.quantity, item.price)
  );
  
  await db.batch(batchStatements);

  // Alihkan ke Halaman Sukses
  return c.redirect(`/checkout/success?order_id=${orderId}`);
});