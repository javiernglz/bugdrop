const { Router } = require('express');
const { requireAuth } = require('../middleware/authJwt');
const { visitPage } = require('../utils/bot');
const router = Router();

router.post('/api/products/:id/reviews', requireAuth, (req, res) => {
  const db = req.app.get('db');
  const user = req.user;

  const product = db.prepare('SELECT id, name FROM products WHERE id = ?').get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Drop not found. It might be sold out.' });
  }

  const { content, rating } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Review cannot be empty. We want to hear your thoughts.' });
  }

  const result = db.prepare(
    'INSERT INTO reviews (user_id, product_id, content, rating) VALUES (?, ?, ?, ?)'
  ).run(user.id, product.id, content, rating || 5);

  const xssPatterns = /<img|<script|<svg|<iframe|<body/i;
  let adminMessage = null;

  if (xssPatterns.test(content)) {
    adminMessage = 'Review posted. An Admin will review it shortly. Who knows what might happen if they open it...';
    
    // El puerto 5173 es el frontend shop por defecto. En Docker será 'shop:5173'
    const shopHost = process.env.SHOP_HOST || 'localhost:5173';
    const productUrl = `http://${shopHost}/products/${product.id}`;
    
    // Lanzar el bot en segundo plano
    visitPage(productUrl, db).catch(err => console.error("Bot failed:", err));
  }

  res.json({
    message: adminMessage || `Review posted for "${product.name}". Thanks for your feedback, Collector.`,
    review_id: result.lastInsertRowid
  });
});

module.exports = router;
