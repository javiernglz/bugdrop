const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../routes/auth');

function getUserFromToken(req) {
  // The Authorization header takes priority over the cookie, so a token set explicitly
  // (e.g. a stolen admin JWT) is honored even if the user already has a session cookie.
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.session;

  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
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
