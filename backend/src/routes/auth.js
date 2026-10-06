const { Router } = require('express');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('../utils/rateLimit');
const router = Router();

// VULNERABILIDAD: Clave JWT extremadamente débil e intencional.
// Un atacante puede hacer fuerza bruta offline con herramientas como hashcat/john
// y forjar un token de admin (The Creator).
const JWT_SECRET = '123456';
const JWT_EXPIRY = '24h';

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY, algorithm: 'HS256' }
  );
}

router.post('/api/auth/login', rateLimit({ windowMs: 60000, max: 20, keyFn: r => r.ip + ':' + (r.body?.username || '') }), (req, res) => {
  const db = req.app.get('db');
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = db.prepare(
    'SELECT id, username, display_name, role, bio FROM users WHERE username = ? AND password = ?'
  ).get(username, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Are you really a collector?' });
  }

  const token = signToken(user);

  res.cookie('session', token, { httpOnly: false, sameSite: 'lax' });

  res.json({
    message: `Welcome back, ${user.display_name}`,
    token,
    user: {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      role: user.role,
      bio: user.bio,
    },
  });
});

router.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.session;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = req.app.get('db');
    const user = db.prepare(
      'SELECT id, username, display_name, role, bio FROM users WHERE id = ?'
    ).get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

router.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('session');
  res.json({ message: 'Session closed. Keep collecting.' });
});

module.exports = router;
module.exports.JWT_SECRET = JWT_SECRET;
