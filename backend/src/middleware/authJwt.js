const jwt = require('jsonwebtoken');
const { verifyToken } = require('../routes/auth');
const { addThreat } = require('../utils/socAlert');

function getUserFromToken(req) {
  // The Authorization header takes priority over the cookie, so a token set explicitly
  // (e.g. a stolen admin JWT) is honored even if the user already has a session cookie.
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.session;

  if (!token) return null;

  
  try {
    const payload = verifyToken(token);
    const db = req.app?.get('db'); console.log('DB EXISTS:', !!db);
    if (db && payload.jti) {
      const row = db.prepare('SELECT user_id FROM issued_tokens WHERE jti=?').get(payload.jti);
      const user = payload.id ? db.prepare('SELECT role FROM users WHERE id=?').get(payload.id) : null;
      if (!row || row.user_id !== payload.id || !user || payload.role !== user.role) {
        addThreat(req, { tag: 'Forged JWT', severity: 'critical', match: 'Invalid JTI/User/Role mapping' });
      }
    } else if (db && !payload.jti) { console.log('TRIGGERING MISSING JTI ALERT');
      addThreat(req, { tag: 'Forged JWT', severity: 'critical', match: 'Token missing JTI' });
    }
    return payload;
  } catch (err) {
    if (err.name === 'JsonWebTokenError' && err.message === 'invalid signature') {
      addThreat(req, { tag: 'Forged JWT', severity: 'critical', match: 'Invalid signature detected' });
    }
    return null;
  }

}

function requireAuth(req, res, next) {
  const user = getUserFromToken(req);

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated. Please log in first.' });
  }

  req.user = user;
  next();
}

module.exports = { getUserFromToken, requireAuth };
