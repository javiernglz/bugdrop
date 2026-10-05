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
    timestamp: new Date().toISOString(),
  });
});

router.post('/api/newsletter', (req, res) => {
  const db = req.app.get('db');
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  // VULN: Basic SQL Injection in the newsletter form
  // An attacker can input: admin' OR '1'='1
  try {
    // We intentionally do a raw query string concat
    const result = db.prepare(`SELECT * FROM users WHERE username = '${email}'`).get();
    
    // If the query magically returns the admin user due to SQLi:
    if (result && result.role === 'admin') {
      const flag = db.prepare('SELECT flag_value FROM flags WHERE challenge_key = ?').get('sqli_newsletter');
      return res.json({ 
        message: 'Subscribed as admin? That is unexpected.', 
        coupon: 'ADMIN-DROP-100',
        flag: flag ? flag.flag_value : undefined
      });
    }

    res.json({
      message: 'Subscribed successfully! Use code BUGDROP10 at checkout.',
      coupon: 'BUGDROP10'
    });
  } catch (err) {
    // Leaks the SQL error to make the vulnerability obvious
    res.status(500).json({ 
      error: 'Database error', 
      details: err.message,
      hint: 'Your email looks a bit... malformed.'
    });
  }
});

module.exports = router;

// VULN: Information Disclosure (Backup file left on server)
router.get('/backup.bak', (req, res) => {
  const db = req.app.get('db');
  const flag = db.prepare('SELECT flag_value FROM flags WHERE challenge_key = ?').get('info_disclosure');
  const fileContent = `DB_CONNECTION=sqlite
DB_DATABASE=bugdrop.db
ADMIN_EMAIL=admin@bugdrop.local
FLAG=${flag ? flag.flag_value : 'FLAG_NOT_FOUND'}
DEBUG=true
`;
  
  res.setHeader('Content-disposition', 'attachment; filename=backup.bak');
  res.setHeader('Content-type', 'text/plain');
  res.send(fileContent);
});

