const { Router } = require('express');
const { requireAuth } = require('../middleware/authJwt');
const router = Router();

router.post('/api/cart/checkout', requireAuth, (req, res) => {
  const db = req.app.get('db');
  const villain = req.villain;
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El carrito está vacío. Un villano sin compras es solo un tipo raro.' });
  }

  let total = 0;
  const validatedItems = [];

  for (const item of items) {
    const product = db.prepare('SELECT id, name, stock FROM products WHERE id = ?').get(item.product_id);

    if (!product) {
      return res.status(400).json({ error: `Producto ${item.product_id} no encontrado.` });
    }

    if (product.stock < (item.quantity || 1)) {
      return res.status(400).json({ error: `Sin stock de "${product.name}". Otro villano se adelantó.` });
    }

    // VULN: usa item.unit_price del request, no product.price de la BD
    const lineTotal = (item.unit_price || 0) * (item.quantity || 1);
    total += lineTotal;

    validatedItems.push({
      product_id: product.id,
      product_name: product.name,
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
    });
  }

  const order = db.prepare(
    'INSERT INTO orders (villain_id, status, payment_status, total_price, notes) VALUES (?, ?, ?, ?, ?)'
  ).run(villain.id, 'confirmed', 'pending', total, `Pedido de ${villain.display_name}`);

  const insertItem = db.prepare(
    'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
  );

  for (const item of validatedItems) {
    insertItem.run(order.lastInsertRowid, item.product_id, item.quantity, item.unit_price);
    db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.product_id);
  }

  let flag = null;
  const hasDeathRay = validatedItems.some(i => i.product_id === 1);
  if (hasDeathRay && total <= 0) {
    flag = db.prepare('SELECT flag_value FROM flags WHERE challenge_key = ?').get('cart_manipulation');
  }

  res.json({
    message: total <= 0
      ? `¡¿CÓMO?! Acabas de comprar armamento de destrucción masiva por $${total}. Alguien en contabilidad va a ser despedido...`
      : `Pedido confirmado. Total: $${total.toLocaleString()}. La dominación mundial está un paso más cerca.`,
    order_id: order.lastInsertRowid,
    total,
    items: validatedItems,
    flag: flag ? flag.flag_value : undefined,
  });
});

module.exports = router;
