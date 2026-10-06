const { generateFlag } = require('../utils/flags');
const { rateLimit } = require('../utils/rateLimit');
const { Router } = require('express');
const { runSeed } = require('../db/seed');
const router = Router();

router.post('/api/sys/reset', rateLimit({ windowMs: 10000, max: 1 }), (req, res) => {
  const allowReset = process.env.ALLOW_RESET !== 'false';
  if (!allowReset) {
    return res.status(403).json({ error: 'Reset is disabled in this environment.' });
  }

  if (req.headers['x-bugdrop-client'] !== 'soc') {
    return res.status(403).json({ error: 'Missing or invalid X-Bugdrop-Client header.' });
  }

  const io = req.app.get('io');

  try {
    runSeed();

    if (io) {
      io.emit('system-event', {
        type: 'reset',
        message: 'Database restored to its original state.',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: 'Database reset. All data restored to its original state.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset the database.',
      error: err.message,
    });
  }
});

router.get('/api/sys/status', (req, res) => {
  const db = req.app.get('db');

  const counts = {
    users: db.prepare('SELECT count(*) as c FROM users').get().c,
    products: db.prepare('SELECT count(*) as c FROM products').get().c,
    orders: db.prepare('SELECT count(*) as c FROM orders').get().c,
    reviews: db.prepare('SELECT count(*) as c FROM reviews').get().c,
    flags: db.prepare('SELECT count(*) as c FROM flags').get().c,
  };

  res.json({
    status: 'operational',
    database: counts,
    uptime: process.uptime(),
    bot: { available: require('../utils/bot').getStatus() },
    timestamp: new Date().toISOString(),
  });
});

router.post('/api/newsletter', (req, res) => {
  const db = req.app.get('db');
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const result = db.prepare(`SELECT * FROM users WHERE username = '${email}'`).get();
    
    if (result && result.role === 'admin') {
      const flag_value = generateFlag('sqli_newsletter');
      return res.json({ 
        message: 'Subscribed as admin? That is unexpected.', 
        coupon: 'ADMIN-DROP-100',
        flag: flag_value
      });
    }

    res.json({
      message: 'Subscribed successfully! Use code BUGDROP10 at checkout.',
      coupon: 'BUGDROP10'
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Database error', 
      details: err.message,
      hint: 'Your email looks a bit... malformed.'
    });
  }
});

module.exports = router;

router.get('/backup.bak', (req, res) => {
  const db = req.app.get('db');
  const flag_value = generateFlag('info_disclosure');
  const fileContent = `DB_CONNECTION=sqlite\nDB_DATABASE=bugdrop.db\nADMIN_EMAIL=admin@bugdrop.local\nFLAG=${flag_value}\nDEBUG=true\n`;
  
  res.setHeader('Content-disposition', 'attachment; filename=backup.bak');
  res.setHeader('Content-type', 'text/plain');
  res.send(fileContent);
});
