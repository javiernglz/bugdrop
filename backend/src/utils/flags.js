const crypto = require('crypto');

// Generate a random instance secret on startup.
// This secret persists across DB resets (Panic Button) so players don't lose their flags.
const INSTANCE_SECRET = crypto.randomBytes(32).toString('hex');

function generateFlag(challengeKey) {
  const hmac = crypto.createHmac('sha256', INSTANCE_SECRET);
  hmac.update(challengeKey);
  return `FLAG{${hmac.digest('hex').substring(0, 16)}}`;
}

module.exports = { generateFlag };
