const { generateFlag } = require('../utils/flags');
const { Router } = require('express');
const { requireAuth } = require('../middleware/authJwt');

const router = Router();

router.get('/api/admin/dashboard', requireAuth, (req, res) => {
  const user = req.user;
  const db = req.app.get('db');

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Access Denied. Admin only.' });
  }

  const flag_value = generateFlag('admin_panel');

  res.json({
    message: 'Welcome to the inner sanctum, Admin.',
    stats: {
      revenue: '$2.4M',
      active_molds: 12,
      pending_shipments: 420
    },
    flag: flag_value
  });
});

module.exports = router;
