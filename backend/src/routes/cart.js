const { generateFlag } = require('../utils/flags');
const { Router } = require('express');
const { requireAuth } = require('../middleware/authJwt');
const router = Router();

router.post('/api/cart/checkout', requireAuth, (req, res) => {
  const db = req.app.get('db');
  const user = req.user;
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your box is empty. Add some Bugs before checking out.' });
  }

  let total = 0;
  const validatedItems = [];

  for (const item of items) {
    const product = db.prepare('SELECT id, name, stock, category FROM products WHERE id = ?').get(item.product_id);

    if (!product) {
      return res.status(400).json({ error: `Product ${item.product_id} not found.` });
    }

    
    const qty = parseInt(item.quantity) || 1;
    if (qty <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than zero.' });
    }

    // The secret Bug never runs out: otherwise a single normal test purchase would make

    // the Cart challenge impossible until the database is reset.
    const unlimitedStock = product.category === 'secret';

    if (!unlimitedStock && product.stock < qty) {
      return res.status(400).json({ error: `"${product.name}" is out of stock. Another collector got there first.` });
    }

    // VULN: usa item.unit_price del request, no product.price de la BD
    const lineTotal = (item.unit_price || 0) * qty;
    total += lineTotal;

    validatedItems.push({
      product_id: product.id,
      product_name: product.name,
      quantity: qty,
      unit_price: item.unit_price || 0,
      unlimited_stock: unlimitedStock,
    });
  }

  const order = db.prepare(
    'INSERT INTO orders (user_id, status, payment_status, total_price, notes) VALUES (?, ?, ?, ?, ?)'
  ).run(user.id, 'confirmed', 'pending', total, `Drop order by ${user.display_name}`);

  const insertItem = db.prepare(
    'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
  );

  for (const item of validatedItems) {
    insertItem.run(order.lastInsertRowid, item.product_id, item.quantity, item.unit_price);
    if (!item.unlimited_stock) {
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.product_id);
    }
  }

  let flag_value = null;
  const hasSecretBug = validatedItems.some(i => i.product_id === 12);
  if (hasSecretBug && total <= 0) {
    flag_value = generateFlag('cart_manipulation');
  }

  res.json({
    message: total <= 0
      ? `Wait... you just got a Bug for $${total}? That can't be right. Someone in accounting is getting fired.`
      : `Drop confirmed! Total: $${total.toLocaleString()}. Your collection is growing.`,
    order_id: order.lastInsertRowid,
    total,
    items: validatedItems,
    flag: flag_value,
  });
});

module.exports = router;
