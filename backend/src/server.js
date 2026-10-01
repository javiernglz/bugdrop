const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { getDb, initTables } = require('./db/init');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const reviewRoutes = require('./routes/reviews');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const ctfRoutes = require('./routes/ctf');
const systemRoutes = require('./routes/system');
const socInterceptor = require('./middleware/socInterceptor');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  },
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const db = getDb();
initTables(db);

app.set('io', io);
app.set('db', db);

io.on('connection', (socket) => {
  console.log(`[SOC] Monitor conectado: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[SOC] Monitor desconectado: ${socket.id}`);
  });
});

app.use(socInterceptor);

app.use(authRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use(reviewRoutes);
app.use(orderRoutes);
app.use(paymentRoutes);
app.use(ctfRoutes);
app.use(systemRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'operational',
    name: 'Villain Supply Co.',
    tagline: 'Tu proveedor de confianza para la dominación mundial',
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   🦹 VILLAIN SUPPLY CO. — Backend activo    ║
  ║   Puerto: ${PORT}                              ║
  ║   "La dominación mundial empieza aquí"      ║
  ╚══════════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
