const { Router } = require('express');
const { requireAuth } = require('../middleware/authJwt');
const router = Router();

// VULN: Bypass de pago — confía en {"status":"success"} del cliente
router.post('/api/orders/:id/pay', requireAuth, (req, res) => {
  const db = req.app.get('db');

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  if (order.payment_status === 'paid') {
    return res.json({ message: 'This order is already paid.' });
  }

  const { status, transaction_id } = req.body;

  if (status === 'success') {
    db.prepare('UPDATE orders SET payment_status = ?, status = ? WHERE id = ?')
      .run('paid', 'confirmed', order.id);

    let flag = null;
    if (order.total_price > 0) {
      flag = db.prepare('SELECT flag_value FROM flags WHERE challenge_key = ?').get('payment_bypass');
    }

    return res.json({
      message: flag
        ? `Payment of $${order.total_price.toLocaleString()} "processed"... Wait, did you actually pay? The system accepted it, but something feels off.`
        : `Payment confirmed. Drop order #${order.id} is ready for shipping.`,
      order_id: order.id,
      payment_status: 'paid',
      total: order.total_price,
      transaction_id: transaction_id || `FAKE-${Date.now()}`,
      flag: flag ? flag.flag_value : undefined,
    });
  }

  if (status === 'pending') {
    return res.json({
      message: 'Payment pending. Waiting for bank confirmation.',
      payment_status: 'pending',
    });
  }

  res.status(400).json({
    error: 'Unrecognized payment status. Send {"status": "success"} to confirm.',
    hint: 'No funds? Maybe you can... convince the system you paid.',
  });
});

router.get('/api/orders/:id/payment-info', (req, res) => {
  const db = req.app.get('db');
  const order = db.prepare('SELECT id, total_price, payment_status FROM orders WHERE id = ?').get(req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  res.json({
    order_id: order.id,
    total: order.total_price,
    payment_status: order.payment_status,
    payment_methods: ['Apple Pay', 'Credit Card', 'Crypto'],
    note: 'After selecting method, client sends POST /api/orders/:id/pay with result.',
  });
});

module.exports = router;
