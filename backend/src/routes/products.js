const { Router } = require('express');
const router = Router();

router.get('/api/products', (req, res) => {
  const db = req.app.get('db');
  const { category, featured } = req.query;

  let query = 'SELECT * FROM products';
  const conditions = [];
  const params = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (featured === 'true') {
    conditions.push('featured = 1');
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  const products = db.prepare(query).all(...params);
  res.json({ products });
});

router.get('/api/products/:id', (req, res) => {
  const db = req.app.get('db');
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado. Quizás fue destruido por un rayo.' });
  }

  const reviews = db.prepare(`
    SELECT r.*, v.display_name, v.username
    FROM reviews r
    JOIN villains v ON v.id = r.villain_id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.id);

  res.json({ product, reviews });
});

module.exports = router;
