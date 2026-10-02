const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../routes/auth');

function getUserFromToken(req) {
  const token = req.cookies.session || req.headers.authorization?.replace('Bearer ', '');

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
    return res.status(401).json({ error: 'No autenticado. Inicia sesión primero.' });
  }

  req.user = user;
  next();
}

module.exports = { getUserFromToken, requireAuth };
