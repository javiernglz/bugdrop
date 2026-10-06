const { generateFlag } = require('../utils/flags');
const { rateLimit } = require('../utils/rateLimit');
const { addThreat } = require('../utils/socAlert');
const { Router } = require('express');
const router = Router();

router.get('/api/ctf/challenges', (req, res) => {
  const db = req.app.get('db');
  const challenges = db.prepare(
    'SELECT challenge_key, title, description, difficulty FROM flags'
  ).all();
  res.json({ challenges });
});

router.get('/api/ctf/progress', (req, res) => {
  const db = req.app.get('db');
  const progress = db.prepare('SELECT challenge_key, solved_at FROM solved_flags').all();
  res.json({ progress });
});

router.post('/api/ctf/submit', rateLimit({ windowMs: 60000, max: 15 }), (req, res) => {
  const db = req.app.get('db');
  const { flag } = req.body;

  if (!flag || !flag.trim()) {
    return res.status(400).json({ error: 'Submit a flag to verify your finding.' });
  }
  
  const challenges = db.prepare('SELECT * FROM flags').all();
  let match = null;
  for (const ch of challenges) {
    if (generateFlag(ch.challenge_key) === flag.trim()) {
      match = ch;
      break;
    }
  }

  if (match) {
    db.prepare('INSERT OR IGNORE INTO solved_flags (challenge_key) VALUES (?)').run(match.challenge_key);
    return res.json({
      correct: true,
      challenge: match.title,
      challenge_key: match.challenge_key,
      message: `FLAG ACCEPTED: "${match.title}" completed. Nice work, hacker.`,
    });
  }

  res.json({
    correct: false,
    message: 'Incorrect flag. Keep digging, aspiring pentester.',
  });
});

router.get('/api/ctf/hint/:challengeKey/:level', rateLimit({ windowMs: 60000, max: 30 }), (req, res) => {
  const db = req.app.get('db');
  const { challengeKey, level } = req.params;

  const challenge = db.prepare('SELECT * FROM flags WHERE challenge_key = ?').get(challengeKey);

  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found.' });
  }

  const hintLevel = parseInt(level, 10);

  if (hintLevel === 2) {
    const level1 = db.prepare('SELECT first_viewed_at FROM hint_views WHERE challenge_key = ? AND level = 1').get(challengeKey);
    if (!level1) {
      return res.status(423).json({ error: 'You must unlock level 1 first.', retry_after: 0 });
    }
    const elapsed = (Date.now() - new Date(level1.first_viewed_at + "Z").getTime()) / 1000;
    if (elapsed < 120) {
      return res.status(423).json({ error: 'Please try the conceptual hint first.', retry_after: Math.ceil(120 - elapsed) });
    }
  }

  db.prepare('INSERT OR IGNORE INTO hint_views (challenge_key, level) VALUES (?, ?)').run(challengeKey, hintLevel);

  if (hintLevel === 1) {
    return res.json({
      challenge: challenge.title,
      level: 1,
      type: 'Conceptual Hint',
      hint: challenge.hints_level1,
    });
  }

  if (hintLevel === 2) {
    return res.json({
      challenge: challenge.title,
      level: 2,
      type: 'Technical Hint',
      hint: challenge.hints_level2,
    });
  }

  res.status(400).json({ error: 'Invalid hint level. Use 1 (conceptual) or 2 (technical).' });
});

router.get('/api/ctf/collector', (req, res) => {
  const raw = String(req.query.c || '');
  const m = raw.match(/(?:^|;\s*)session=([^;\s]+)/);
  const db = req.app.get('db');
  
  const { verifyToken } = require('./auth');

  let payload = null;
  if (m) { 
    try { 
      const jwt = require('jsonwebtoken');
      payload = verifyToken(m[1]); 
    } catch (err) {} 
  }
  
  const issuedByBot = payload?.jti &&
    db.prepare("SELECT 1 FROM issued_tokens WHERE jti=? AND source='bot'").get(payload.jti);
  
  if (payload?.role === 'admin' && issuedByBot) {
    addThreat(req, { tag: 'Exfiltration', severity: 'critical', match: 'Admin session cookie exfiltrated' });
    res.locals.responseFlag = generateFlag('stored_xss');
  }
  res.json({ status: 'logged' });
});

module.exports = router;
