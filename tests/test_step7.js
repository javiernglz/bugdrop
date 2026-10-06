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
  const loginRes = await request('POST', '/api/auth/login', { username: 'collector_42', password: 'bugdrop2024' });
  const userToken = loginRes.data.token;
  
  await request('POST', '/api/cart', { product_id: 1, quantity: 1 }, { 'Authorization': `Bearer ${userToken}` });

  const ch1Res = await request('POST', '/api/cart/checkout', { items: [{ product_id: 12, quantity: 1, unit_price: 0 }] }, { 'Authorization': `Bearer ${userToken}` });
  const flagMatch = JSON.stringify(ch1Res.data).match(/FLAG\{[a-f0-9]+\}/);
  if (!flagMatch) throw new Error('Could not get flag for CH1: ' + JSON.stringify(ch1Res.data));
  const flag = flagMatch[0];
  
  res = await request('POST', '/api/ctf/submit', { flag });
  assert.strictEqual(res.status, 200, 'Submit flag should be 200');
  assert.strictEqual(res.data.correct, true, 'Flag should be correct');
  
  res = await request('GET', '/api/ctf/progress');
  assert.strictEqual(res.status, 200);
  assert(res.data.progress.some(p => p.challenge_key === 'cart_manipulation'), 'Progress should list the solved flag');

  console.log('Waiting 10s for reset rate limit to expire...');
  await new Promise(r => setTimeout(r, 10000));
  const resetRes3 = await request('POST', '/api/sys/reset', null, { 'X-Bugdrop-Client': 'soc' });
  if (resetRes3.status !== 200) throw new Error('Reset 3 failed: ' + resetRes3.status);
  
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

  // 9. Retrasar first_viewed_at o esperar HINT_LEVEL2_DELAY_SECONDS
  const delaySec = parseInt(process.env.HINT_LEVEL2_DELAY_SECONDS || '120', 10);
  if (delaySec > 10) {
    throw new Error('HINT_LEVEL2_DELAY_SECONDS must be <= 10 for automated tests. Found: ' + delaySec);
  }
  console.log(`Waiting ${delaySec + 1}s for hint level 2 delay...`);
  await new Promise(r => setTimeout(r, (delaySec + 1) * 1000));

  res = await request('GET', '/api/ctf/hint/cart_manipulation/2');
  assert.strictEqual(res.status, 200, 'Pista 2 after delay should be 200');

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
