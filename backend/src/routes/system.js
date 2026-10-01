const { Router } = require('express');
const { execSync } = require('child_process');
const path = require('path');
const router = Router();

router.post('/api/sys/reset', (req, res) => {
  const io = req.app.get('io');

  try {
    const seedPath = path.join(__dirname, '..', 'db', 'seed.js');
    execSync(`node "${seedPath}"`, {
      cwd: path.join(__dirname, '..', '..'),
      timeout: 10000,
    });

    if (io) {
      io.emit('system-event', {
        type: 'reset',
        message: 'Base de datos restaurada al estado original.',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: 'Base de datos reseteada. Todos los datos restaurados al estado original.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error al resetear la base de datos.',
      error: err.message,
    });
  }
});

router.get('/api/sys/status', (req, res) => {
  const db = req.app.get('db');

  const counts = {
    villains: db.prepare('SELECT count(*) as c FROM villains').get().c,
    products: db.prepare('SELECT count(*) as c FROM products').get().c,
    orders: db.prepare('SELECT count(*) as c FROM orders').get().c,
    reviews: db.prepare('SELECT count(*) as c FROM reviews').get().c,
    flags: db.prepare('SELECT count(*) as c FROM flags').get().c,
  };

  res.json({
    status: 'operational',
    database: counts,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
