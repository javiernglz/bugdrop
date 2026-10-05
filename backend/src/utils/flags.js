const crypto = require('crypto');

// [ROBUST ARCHITECTURE FIX]
// Instead of a random secret on every startup (which invalidates all user flags if the server reboots),
// we use a deterministic secret for this educational environment.
const INSTANCE_SECRET = 'BUGDROP_CTF_MASTER_SECRET_2026';

function generateFlag(challengeKey) {
  const hmac = crypto.createHmac('sha256', INSTANCE_SECRET);
  hmac.update(challengeKey);
  return `FLAG{${hmac.digest('hex').substring(0, 16)}}`;
}

module.exports = { generateFlag };
