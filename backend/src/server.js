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
const adminRoutes = require('./routes/admin');
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
  console.log(`[SOC] Monitor connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[SOC] Monitor disconnected: ${socket.id}`);
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
app.use(adminRoutes);

const path = require('path');

app.get('/', (req, res) => {
  res.json({ message: 'Bugdrop API is running. Access the Shop on port 5173 and the SOC on port 5174.' });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'operational',
    name: 'Bugdrop',
    tagline: 'Collect the unexpected.',
  });
});

const PORT = process.env.PORT || 3000;
// Deliberately vulnerable app: bind to localhost only unless HOST is set explicitly
// (Docker sets HOST=0.0.0.0 inside the container; compose publishes it on 127.0.0.1).
const HOST = process.env.HOST || '127.0.0.1';
server.listen(PORT, HOST, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   📦 BUGDROP — Backend active                ║
  ║   Port: ${PORT}                                 ║
  ║   "Collect the unexpected"                   ║
  ╚══════════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
