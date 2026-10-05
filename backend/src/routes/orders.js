const { generateFlag } = require('../utils/flags');
const { Router } = require('express');
const { requireAuth } = require('../middleware/authJwt');
const router = Router();

router.get('/api/orders', requireAuth, (req, res) => {
  const db = req.app.get('db');
  const user = req.user;

  const orders = db.prepare(`
    SELECT o.*, v.display_name
    FROM orders o
    JOIN users v ON v.id = o.user_id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `).all(user.id);

  res.json({ orders });
});

// VULN: IDOR — does not verify the order belongs to the authenticated user
router.get('/api/orders/:id', requireAuth, (req, res) => {
  const db = req.app.get('db');
  const user = req.user;

  const order = db.prepare(`
    SELECT o.*, v.display_name, v.username
    FROM orders o
    JOIN users v ON v.id = o.user_id
    WHERE o.id = ?
  `).get(req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const items = db.prepare(`
    SELECT oi.*, p.name as product_name, p.image_emoji
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `).all(req.params.id);

  let flag = null;
  if (order.user_id === 1 && user.id !== 1) {
    flag = generateFlag('idor_orders');
  }

  res.json({
    order,
    items,
    flag: flag ? flag : undefined,
    hacked_message: flag
      ? `You just accessed ${order.display_name}'s TOP SECRET order details! That should not be possible...`
      : undefined,
  });
});

module.exports = router;
