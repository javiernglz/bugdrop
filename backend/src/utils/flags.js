const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const secretPath = path.join(__dirname, '..', '..', '.ctf_secret');

let INSTANCE_SECRET;

if (fs.existsSync(secretPath)) {
  INSTANCE_SECRET = fs.readFileSync(secretPath, 'utf8').trim();
} else {
  INSTANCE_SECRET = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(secretPath, INSTANCE_SECRET, 'utf8');
  console.log('🛡️  Generated new CTF Master Secret for flags.');
}

function generateFlag(challengeKey) {
  const hmac = crypto.createHmac('sha256', INSTANCE_SECRET);
  hmac.update(challengeKey);
  return `FLAG{${hmac.digest('hex').substring(0, 16)}}`;
}

module.exports = { generateFlag };
