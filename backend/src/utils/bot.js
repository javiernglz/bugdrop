const { signToken } = require('../routes/auth');
const fs = require('fs');

let isAvailable = false;
let chromiumClass = null;

try {
  const playwright = require('@playwright/test');
  chromiumClass = playwright.chromium;
  if (fs.existsSync(chromiumClass.executablePath())) {
    isAvailable = true;
  } else {
    console.warn('⚠️  Chromium executable not found. Bot is disabled.');
  }
} catch (e) {
  console.warn('⚠️  Playwright not found. Bot is disabled. Run `npx playwright install chromium` to enable.');
}

let stats = { running: 0, queued: 0, dropped: 0 };

const getStatus = () => {
  return { available: isAvailable, ...stats };
};

class BotQueue {
  constructor() {
    this.queue = [];
  }
  
  add(taskFn) {
    if (this.queue.length >= 3) {
      console.log('[Bot] Queue full, dropping visit');
      stats.dropped++;
      return;
    }
    this.queue.push(taskFn);
    stats.queued = this.queue.length;
    this.process();
  }
  
  async process() {
    if (stats.running >= 1 || this.queue.length === 0) return;
    stats.running++;
    const task = this.queue.shift();
    stats.queued = this.queue.length;
    try {
      await task();
    } catch(e) {
      console.error('Bot Error:', e.message);
    } finally {
      stats.running--;
      this.process();
    }
  }
}

const botQueue = new BotQueue();

function visitPage(url, db) {
  if (!isAvailable) return Promise.resolve();

  botQueue.add(async () => {
    let browser;
    
    const taskLogic = async () => {
      const adminUser = { id: 1, username: 'bugdrop_admin', display_name: 'Admin', role: 'admin' };
      const adminToken = signToken(adminUser, db, 'bot');

      const argsStr = process.env.BOT_CHROMIUM_ARGS || '';
      const args = argsStr ? argsStr.split(',') : [];
      
      browser = await chromiumClass.launch({ headless: true, args });
      const context = await browser.newContext();
      
      const targetUrl = new URL(url);
      const SHOP_HOST = process.env.SHOP_HOST || 'localhost:5173';
      const BACKEND_HOST = process.env.BACKEND_HOST || 'localhost:3000';
      
      await context.route('**/*', route => {
        try {
          const u = new URL(route.request().url());
          if (u.host === SHOP_HOST || u.host === BACKEND_HOST) {
            route.continue();
          } else {
            route.abort();
          }
        } catch(err) {
          route.abort();
        }
      });

      await context.addCookies([
        { name: 'session', value: adminToken, domain: targetUrl.hostname, path: '/', httpOnly: false, sameSite: 'Lax' }
      ]);

      const page = await context.newPage();
      page.on('dialog', async dialog => {
        console.log(`Bot saw alert: ${dialog.message()}`);
        await dialog.dismiss();
      });

      console.log(`🤖 Admin Bot visiting: ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await new Promise(r => setTimeout(r, 1500));
      console.log(`🤖 Admin Bot finished visit`);
    };

    const timeoutLogic = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Global Timeout Exceeded')), 10000);
    });

    try {
      await Promise.race([taskLogic(), timeoutLogic]);
    } finally {
      if (browser) await browser.close();
    }
  });

  return Promise.resolve();
}

module.exports = { visitPage, getStatus };
