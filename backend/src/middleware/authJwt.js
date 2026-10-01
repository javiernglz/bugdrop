const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../routes/auth');

function getVillainFromToken(req) {
  const token = req.cookies.villain_session || req.headers.authorization?.replace('Bearer ', '');

  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const villain = getVillainFromToken(req);

  if (!villain) {
    return res.status(401).json({ error: 'No autenticado. Inicia sesión primero.' });
  }

  req.villain = villain;
  next();
}

module.exports = { getVillainFromToken, requireAuth };
