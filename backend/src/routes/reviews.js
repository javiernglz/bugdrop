const { generateFlag } = require('../utils/flags');
const { Router } = require('express');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('../middleware/authJwt');
const { JWT_SECRET } = require('./auth');
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

  // VULN: content is saved without sanitization — Stored XSS
  const result = db.prepare(
    'INSERT INTO reviews (user_id, product_id, content, rating) VALUES (?, ?, ?, ?)'
  ).run(user.id, product.id, content, rating || 5);

  let flag = null;
  const xssPatterns = /<script|javascript:|onerror|onload|onclick|onfocus|onmouseover/i;
  
  if (xssPatterns.test(content)) {
    flag = generateFlag('stored_xss');

    // Simulate stolen admin token
    const adminData = db.prepare('SELECT id, username, display_name, role FROM users WHERE role = ?').get('admin');
    const adminToken = adminData
      ? jwt.sign({ id: adminData.id, username: adminData.username, display_name: adminData.display_name, role: adminData.role }, JWT_SECRET, { expiresIn: '1h' })
      : null;

    return res.json({
      message: `Review posted. Admin just reviewed it and... something strange happened with their browser.`,
      review_id: result.lastInsertRowid,
      flag: flag ? flag : undefined,
      stolen_cookie: adminToken,
      admin_reaction: 'My JWT was intercepted. Someone can impersonate Admin...',
    });
  }

  res.json({
    message: `Review posted for "${product.name}". Thanks for your feedback, Collector.`,
    review_id: result.lastInsertRowid,
  });
});

module.exports = router;
