const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  console.log('Capturing shop.jpg...');
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'docs/screenshots/shop.jpg', type: 'jpeg', quality: 80 });

  console.log('Capturing product.jpg...');
  await page.goto('http://localhost:5173/product/1');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'docs/screenshots/product.jpg', type: 'jpeg', quality: 80 });

  console.log('Triggering Price Tampering...');
  await page.evaluate(async () => {
    await fetch('http://localhost:3000/api/payment/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 0 })
    }).catch(() => {});
  });
  
  await page.waitForTimeout(1000);

  console.log('Capturing soc.jpg...');
  await page.goto('http://localhost:5174/');
  await page.waitForTimeout(3000); // Wait for socket connection and logs to render
  await page.screenshot({ path: 'docs/screenshots/soc.jpg', type: 'jpeg', quality: 80 });

  await browser.close();
  
  // Check sizes
  const stats = [
    { file: 'shop.jpg', size: fs.statSync('docs/screenshots/shop.jpg').size },
    { file: 'product.jpg', size: fs.statSync('docs/screenshots/product.jpg').size },
    { file: 'soc.jpg', size: fs.statSync('docs/screenshots/soc.jpg').size },
  ];
  
  let report = '';
  for (const stat of stats) {
    const kb = (stat.size / 1024).toFixed(2);
    report += `${stat.file}: ${kb} KB\n`;
    if (stat.size > 250 * 1024) {
      console.error(`ERROR: ${stat.file} is larger than 250 KB!`);
    }
  }
  fs.writeFileSync('evidence/screenshots_size.txt', report);
  console.log('Done!');
})();
