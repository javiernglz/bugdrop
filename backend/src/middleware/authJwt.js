const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../routes/auth');
const { addThreat } = require('../utils/socAlert');

function getUserFromToken(req) {
  // The Authorization header takes priority over the cookie, so a token set explicitly
  // (e.g. a stolen admin JWT) is honored even if the user already has a session cookie.
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.session;

  if (!token) return null;

  
  try {
    return jwt.verify(token, JWT_SECRET);
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
