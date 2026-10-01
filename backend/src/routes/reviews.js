const { Router } = require('express');
const jwt = require('jsonwebtoken');
const { requireAuth } = require('../middleware/authJwt');
const { JWT_SECRET } = require('./auth');
const router = Router();

router.post('/api/products/:id/reviews', requireAuth, (req, res) => {
  const db = req.app.get('db');
  const villain = req.villain;

  const product = db.prepare('SELECT id, name FROM products WHERE id = ?').get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  const { content, rating } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'La reseña no puede estar vacía. Hasta los esbirros tienen opiniones.' });
  }

  // VULN: content se guarda sin sanitizar — XSS directo
  const result = db.prepare(
    'INSERT INTO reviews (villain_id, product_id, content, rating) VALUES (?, ?, ?, ?)'
  ).run(villain.id, product.id, content, rating || 5);

  let flag = null;
  const xssPatterns = /<script|javascript:|onerror|onload|onclick|onfocus|onmouseover/i;
  if (xssPatterns.test(content)) {
    flag = db.prepare('SELECT flag_value FROM flags WHERE challenge_key = ?').get('stored_xss');

    // Con JWT, la "cookie robada" sería el token JWT del admin.
    // Generamos uno real como prueba de que el XSS habría sido efectivo.
    const adminData = db.prepare('SELECT id, username, display_name, role FROM villains WHERE role = ?').get('admin');
    const adminToken = adminData
      ? jwt.sign({ id: adminData.id, username: adminData.username, display_name: adminData.display_name, role: adminData.role }, JWT_SECRET, { expiresIn: '1h' })
      : null;

    return res.json({
      message: `Reseña publicada. El Jefe Supremo acaba de leerla y... algo extraño ha pasado con su navegador.`,
      review_id: result.lastInsertRowid,
      flag: flag ? flag.flag_value : undefined,
      stolen_cookie: adminToken,
      admin_reaction: 'Mi JWT ha sido interceptado. Alguien puede suplantar al Jefe Supremo...',
    });
  }

  res.json({
    message: `Reseña publicada para "${product.name}". Gracias por tu feedback, villano.`,
    review_id: result.lastInsertRowid,
  });
});

module.exports = router;
