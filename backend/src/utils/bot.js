const { chromium } = require('@playwright/test');
const { JWT_SECRET } = require('../routes/auth');
const jwt = require('jsonwebtoken');

async function visitPage(url) {
  let browser;
  try {
    // Generate valid admin token
    const adminToken = jwt.sign(
      { id: 1, username: 'bugdrop_admin', display_name: 'Admin', role: 'admin' },
      JWT_SECRET,
      { expiresIn: '10m', algorithm: 'HS256' }
    );

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    
    // Set the cookie for localhost
    await context.addCookies([
      {
        name: 'session',
        value: adminToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false, // Must be accessible to document.cookie for XSS
        sameSite: 'Lax'
      }
    ]);

    const page = await context.newPage();
    
    // Listen for dialogs (alert/confirm/prompt)
    page.on('dialog', async dialog => {
      console.log(`Bot saw alert: ${dialog.message()}`);
      await dialog.dismiss();
    });

    console.log(`🤖 Admin Bot visiting: ${url}`);
    // Wait until network is mostly idle to ensure scripts run
    await page.goto(url, { waitUntil: 'networkidle', timeout: 5000 });
    
    // Wait an extra second just in case there are delayed scripts
    await page.waitForTimeout(1000);
    
    console.log(`🤖 Admin Bot finished visit`);
  } catch (err) {
    console.error('Bot Error:', err.message);
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { visitPage };
