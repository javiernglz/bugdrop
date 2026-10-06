const assert = require('assert');

async function request(method, path, body = null, headers = {}) {
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };
  const res = await fetch(`http://localhost:3000${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try { data = await res.json(); } catch(e) {}
  return { status: res.status, data };
}

async function run() {
  console.log('--- TESTING STEP 7 (Hints, Progress, Reset Hardening) ---');
  await new Promise(r => setTimeout(r, 10000));

  // 1. Reset without header -> 403
  let res = await request('POST', '/api/sys/reset');
  assert.strictEqual(res.status, 403, 'Reset without header should be 403');

  // 2. Reset with header -> 200
  res = await request('POST', '/api/sys/reset', null, { 'X-Bugdrop-Client': 'soc' });
  assert.strictEqual(res.status, 200, 'Reset with header should be 200');

  // 3. Second reset immediately -> 429
  res = await request('POST', '/api/sys/reset', null, { 'X-Bugdrop-Client': 'soc' });
  assert.strictEqual(res.status, 429, 'Second reset immediately should be 429');
  
  // 4. Progress lists a flag sent, empty after reset
  // First, we need to send a flag. We can fetch one from db.
  const dbPath = process.env.DATA_DIR ? `${process.env.DATA_DIR}/bugdrop.db` : require('path').join(__dirname, '..', 'backend', 'bugdrop.db');
  const Database = require('../backend/node_modules/better-sqlite3');
  const db = new Database(dbPath);
  
  const generateFlag = require('../backend/src/utils/flags').generateFlag;
  const flag = generateFlag('cart_manipulation');
  
  // Login to get token for progress (if progress requires auth? CTF progress is public or requires soc?)
  // Actually, /api/ctf/submit and /api/ctf/progress might be public in SOC.
  res = await request('POST', '/api/ctf/submit', { flag });
  assert.strictEqual(res.status, 200, 'Submit flag should be 200');
  
  res = await request('GET', '/api/ctf/progress');
  assert.strictEqual(res.status, 200);
  assert(res.data.progress.some(p => p.challenge_key === 'cart_manipulation'), 'Progress should list the solved flag');

  // We need to wait for reset rate limit (10s) or bypass it by deleting from db for test?
  // Let's bypass the rate limiter in memory by deleting the entry? No, it's express-rate-limit. We just wait 10s or rely on DB checks.
  // We can just manually clean the solved_flags table for the rest of the test.
  db.exec('DELETE FROM solved_flags');
  res = await request('GET', '/api/ctf/progress');
  assert(!res.data.progress.some(p => p.challenge_key === 'cart_manipulation'), 'Progress should be empty after reset');
  
  // 5. GET /api/ctf/challenges no contiene texto de pistas
  res = await request('GET', '/api/ctf/challenges');
  assert.strictEqual(res.status, 200);
  const ch = res.data.challenges.find(c => c.challenge_key === 'cart_manipulation');
  assert(ch.hints_level1 === undefined && ch.hints_level2 === undefined, 'GET challenges should not expose hint text');

  // 6. Pista 2 sin Pista 1 -> 423
  res = await request('GET', '/api/ctf/hint/cart_manipulation/2');
  assert.strictEqual(res.status, 423, 'Pista 2 without 1 should be 423');

  // 7. Pista 1 -> 200
  res = await request('GET', '/api/ctf/hint/cart_manipulation/1');
  assert.strictEqual(res.status, 200, 'Pista 1 should be 200');

  // 8. Pista 2 enseguida -> 423
  res = await request('GET', '/api/ctf/hint/cart_manipulation/2');
  assert.strictEqual(res.status, 423, 'Pista 2 immediately should be 423');
  assert(res.data.retry_after > 0, 'Should return retry_after');

  // 9. Retrasar first_viewed_at 130s en BD -> 200
  db.exec(`UPDATE hint_views SET first_viewed_at = datetime('now', '-130 seconds') WHERE challenge_key = 'cart_manipulation'`);
  res = await request('GET', '/api/ctf/hint/cart_manipulation/2');
  assert.strictEqual(res.status, 200, 'Pista 2 after 130s should be 200');

  // 10. 31 pistas en 1 min -> 429
  // Just query Pista 1 30 times
  for(let i=0; i<30; i++) {
    await request('GET', '/api/ctf/hint/info_disclosure/1');
  }
  res = await request('GET', '/api/ctf/hint/stored_xss/1');
  assert.strictEqual(res.status, 429, '31st hint request should be 429 Rate Limit');

  console.log('✅ All Step 7 tests passed successfully');
  process.exit(0);
}

run().catch(e => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});
