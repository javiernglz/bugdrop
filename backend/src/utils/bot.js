const { JWT_SECRET, signToken } = require('../routes/auth');

async function visitPage(url, db) {
  let browser;
  try {
    // Lazy load Playwright to avoid crashing if it's not installed (e.g. in minimal Docker/Alpine)
    let playwright;
    try {
      playwright = require('@playwright/test');
    } catch (e) {
      console.warn('⚠️  Playwright not found. Skipping Admin Bot visit.');
      return;
    }

    const { chromium } = playwright;

    // Generate valid admin token
    const adminUser = { id: 1, username: 'bugdrop_admin', display_name: 'Admin', role: 'admin' };
    const adminToken = signToken(adminUser, db, 'bot');

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    
    // Parse domain from URL for the cookie
    const targetUrl = new URL(url);

    await context.addCookies([
      {
        name: 'session',
        value: adminToken,
        domain: targetUrl.hostname,
        path: '/',
        httpOnly: false,
        sameSite: 'Lax'
      }
    ]);

    const page = await context.newPage();
    
    page.on('dialog', async dialog => {
      console.log(`Bot saw alert: ${dialog.message()}`);
      await dialog.dismiss();
    });

    console.log(`🤖 Admin Bot visiting: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
    await page.waitForTimeout(1000);
    console.log(`🤖 Admin Bot finished visit`);
  } catch (err) {
    console.error('Bot Error:', err.message);
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { visitPage };
