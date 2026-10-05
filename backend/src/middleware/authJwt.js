const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../routes/auth');

function getUserFromToken(req) {
  // The Authorization header takes priority over the cookie, so a token set explicitly
  // (e.g. a stolen admin JWT) is honored even if the user already has a session cookie.
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.session;

  if (!token) return null;

  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === 'JsonWebTokenError' && err.message === 'invalid signature') {
      const io = req.app?.get('io');
      if (io) {
        io.emit('http-log', {
          id: `log-${Date.now()}-jwt`,
          timestamp: new Date().toISOString(),
          method: req.method,
          url: req.originalUrl || req.url,
          statusCode: 401,
          ip: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || '',
          contentType: '',
          body: null,
          duration: 1,
          threats: [{ tag: 'Forged JWT', severity: 'critical', match: 'Invalid signature detected' }],
          hasThreat: true,
          maxSeverity: 'critical',
          responseFlag: null
        });
      }
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
