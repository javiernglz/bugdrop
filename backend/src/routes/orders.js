const { Router } = require('express');
const { requireAuth } = require('../middleware/authJwt');
const router = Router();

router.get('/api/orders', requireAuth, (req, res) => {
  const db = req.app.get('db');
  const villain = req.villain;

  const orders = db.prepare(`
    SELECT o.*, v.display_name
    FROM orders o
    JOIN villains v ON v.id = o.villain_id
    WHERE o.villain_id = ?
    ORDER BY o.created_at DESC
  `).all(villain.id);

  res.json({ orders });
});

// VULN: IDOR — no verifica que el pedido pertenezca al usuario autenticado
router.get('/api/orders/:id', requireAuth, (req, res) => {
  const db = req.app.get('db');
  const villain = req.villain;

  const order = db.prepare(`
    SELECT o.*, v.display_name, v.username
    FROM orders o
    JOIN villains v ON v.id = o.villain_id
    WHERE o.id = ?
  `).get(req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  const items = db.prepare(`
    SELECT oi.*, p.name as product_name, p.image_emoji
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).all(req.params.id);

  let flag = null;
  if (order.villain_id === 1 && villain.id !== 1) {
    flag = db.prepare('SELECT flag_value FROM flags WHERE challenge_key = ?').get('idor_orders');
  }

  res.json({
    order,
    items,
    flag: flag ? flag.flag_value : undefined,
    hacked_message: flag
      ? `Acabas de acceder a los documentos ULTRA SECRETOS de ${order.display_name}! Eso no debería ser posible...`
      : undefined,
  });
});

module.exports = router;
