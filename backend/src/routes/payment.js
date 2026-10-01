const { Router } = require('express');
const { requireAuth } = require('../middleware/authJwt');
const router = Router();

// VULN: Bypass de pago — confía en {"status":"success"} del cliente
router.post('/api/orders/:id/pay', requireAuth, (req, res) => {
  const db = req.app.get('db');

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  if (order.payment_status === 'paid') {
    return res.json({ message: 'Este pedido ya fue pagado. No intentes pagar dos veces, tacaño.' });
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
        ? `Pago "procesado" por $${order.total_price.toLocaleString()}... pero espera, ¿realmente pagaste? El sistema dice que sí, pero algo huele mal.`
        : `Pago confirmado. Pedido #${order.id} listo para envío.`,
      order_id: order.id,
      payment_status: 'paid',
      total: order.total_price,
      transaction_id: transaction_id || `FAKE-${Date.now()}`,
      flag: flag ? flag.flag_value : undefined,
    });
  }

  if (status === 'pending') {
    return res.json({
      message: 'Pago pendiente. Esperando confirmación del banco de villanos offshore.',
      payment_status: 'pending',
    });
  }

  res.status(400).json({
    error: 'Estado de pago no reconocido. Envía {"status": "success"} para confirmar.',
    hint: '¿No tienes dinero? Quizás podrías... convencer al sistema de que sí pagaste.',
  });
});

router.get('/api/orders/:id/payment-info', (req, res) => {
  const db = req.app.get('db');
  const order = db.prepare('SELECT id, total_price, payment_status FROM orders WHERE id = ?').get(req.params.id);

  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  res.json({
    order_id: order.id,
    total: order.total_price,
    payment_status: order.payment_status,
    payment_methods: ['Tarjeta de Crédito Villana', 'CryptoDoom', 'Transferencia de Guarida'],
    note: 'Tras seleccionar método, el cliente envía POST /api/orders/:id/pay con el resultado.',
  });
});

module.exports = router;
