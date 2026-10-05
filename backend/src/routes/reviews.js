const { generateFlag } = require('../utils/flags');
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

  let flag = null;
  let adminMessage = null;
  const xssPatterns = /<script|javascript:|onerror|onload|onclick|onfocus|onmouseover/i;
  
  if (xssPatterns.test(content)) {
    // 1. Damos la flag por haber inyectado XSS con éxito
    flag = generateFlag('stored_xss');
    adminMessage = 'Review posted. An Admin will review it shortly. Who knows what might happen if they open it...';
    
    // 2. Ejecutamos el bot real en segundo plano para que la víctima (Admin) visite la página
    // y el payload XSS se ejecute de verdad robando la cookie.
    const productUrl = `http://localhost:5173/product/${product.id}`;
    visitPage(productUrl).catch(err => console.error("Bot failed:", err));
  }

  res.json({
    message: adminMessage || `Review posted for "${product.name}". Thanks for your feedback, Collector.`,
    review_id: result.lastInsertRowid,
    flag: flag ? flag : undefined
  });
});

module.exports = router;
