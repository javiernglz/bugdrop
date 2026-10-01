const { Router } = require('express');
const jwt = require('jsonwebtoken');
const router = Router();

// VULNERABILIDAD: Clave JWT extremadamente débil e intencional.
// Un atacante puede hacer fuerza bruta offline con herramientas como hashcat/john
// y forjar un token de admin (Dr. Maligno).
const JWT_SECRET = '123456';
const JWT_EXPIRY = '24h';

function signToken(villain) {
  return jwt.sign(
    {
      id: villain.id,
      username: villain.username,
      display_name: villain.display_name,
      role: villain.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY, algorithm: 'HS256' }
  );
}

router.post('/api/auth/login', (req, res) => {
  const db = req.app.get('db');
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Se requiere usuario y contraseña' });
  }

  const villain = db.prepare(
    'SELECT id, username, display_name, role, bio FROM villains WHERE username = ? AND password = ?'
  ).get(username, password);

  if (!villain) {
    return res.status(401).json({ error: 'Credenciales incorrectas. ¿Eres realmente un villano?' });
  }

  const token = signToken(villain);

  res.cookie('villain_session', token, { httpOnly: false, sameSite: 'lax' });

  res.json({
    message: `Bienvenido de vuelta, ${villain.display_name}`,
    token,
    villain: {
      id: villain.id,
      username: villain.username,
      display_name: villain.display_name,
      role: villain.role,
      bio: villain.bio,
    },
  });
});

router.get('/api/auth/me', (req, res) => {
  const token = req.cookies.villain_session || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = req.app.get('db');
    const villain = db.prepare(
      'SELECT id, username, display_name, role, bio FROM villains WHERE id = ?'
    ).get(decoded.id);

    if (!villain) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    res.json({ villain });
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
});

router.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('villain_session');
  res.json({ message: 'Sesión cerrada. Hasta la próxima, villano.' });
});

module.exports = router;
module.exports.JWT_SECRET = JWT_SECRET;
