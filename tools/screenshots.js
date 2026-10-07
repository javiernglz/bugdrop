const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  console.log('Capturing shop.jpg...');
  await page.goto('http://localhost:5173/');
  try {
    await page.click('button:has-text("Got it")', { timeout: 3000 });
  } catch (e) {
    console.log('No Rules modal found or already closed.');
  }
  
  // Verify catalog
  const catalog = await page.$('.product-card');
  if (!catalog) throw new Error("Catalog not found on shop.jpg");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ROOT, 'docs/screenshots/shop.jpg'), type: 'jpeg', quality: 80 });

  console.log('Capturing product.jpg...');
  await page.goto('http://localhost:5173/products/1');
  try {
    await page.click('button:has-text("Got it")', { timeout: 2000 });
  } catch (e) {}

  // Verify product title
  const title = await page.$('h1');
  const titleText = await title?.innerText();
  if (!titleText || titleText.trim() === '') throw new Error("Product title not found on product.jpg");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ROOT, 'docs/screenshots/product.jpg'), type: 'jpeg', quality: 80 });

  console.log('Capturing soc.jpg...');
  await page.goto('http://localhost:5174/');
  await page.waitForTimeout(2000); // Wait for socket connection
  
  console.log('Triggering Price Tampering...');
  await page.evaluate(async () => {
    await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: "a", password: "b", price: 0 })
    }).catch(e => console.error(e));
  });

  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(ROOT, 'docs/screenshots/soc.jpg'), type: 'jpeg', quality: 80 });

  await browser.close();
  
  // Check sizes
  const stats = [
    { file: 'shop.jpg', size: fs.statSync(path.join(ROOT, 'docs/screenshots/shop.jpg')).size },
    { file: 'product.jpg', size: fs.statSync(path.join(ROOT, 'docs/screenshots/product.jpg')).size },
    { file: 'soc.jpg', size: fs.statSync(path.join(ROOT, 'docs/screenshots/soc.jpg')).size },
  ];
  
  let report = '';
  for (const stat of stats) {
    const kb = (stat.size / 1024).toFixed(2);
    report += `${stat.file}: ${kb} KB\n`;
    if (stat.size > 250 * 1024) {
      console.error(`ERROR: ${stat.file} is larger than 250 KB!`);
      process.exit(1);
    }
  }
  fs.writeFileSync(path.join(ROOT, 'evidence/screenshots_size.txt'), report);
  console.log('Done!');
})();
