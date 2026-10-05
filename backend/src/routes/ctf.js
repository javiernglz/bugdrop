const { generateFlag } = require('../utils/flags');
const { Router } = require('express');
const router = Router();

router.get('/api/ctf/challenges', (req, res) => {
  const db = req.app.get('db');

  const challenges = db.prepare(
    'SELECT challenge_key, title, description, difficulty FROM flags'
  ).all();

  res.json({ challenges });
});

router.post('/api/ctf/submit', (req, res) => {
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

router.get('/api/ctf/hint/:challengeKey/:level', (req, res) => {
  const db = req.app.get('db');
  const { challengeKey, level } = req.params;

  const challenge = db.prepare('SELECT * FROM flags WHERE challenge_key = ?').get(challengeKey);

  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found.' });
  }

  const hintLevel = parseInt(level, 10);

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

module.exports = router;
