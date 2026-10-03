# Bugdrop

A dual-interface cyber range for learning pentesting and bug bounty from scratch.

Bugdrop is a training environment built around a deliberately vulnerable e-commerce store — a fictional collectible figures brand — paired with a real-time monitoring dashboard (Mini-SOC) that tracks every attack as it happens. Five CTF challenges are baked into the store, each exposing a different class of web vulnerability.

---

## Architecture

```
                          Attacker
                     (Browser / Burp Suite)
                             |
              +--------------+--------------+
              |              |              |
        Shop :5173     API :3000      SOC :5174
        (React/Vite)   (Express)     (React/Vite)
              |              |              |
              +---------+----+----+---------+
                        |         |
                     SQLite    Socket.io
                   (bugdrop.db)  (real-time)
```

The shop talks to the API over REST. Every request passes through a middleware interceptor that forwards a structured log to the SOC via Socket.io. The SOC renders traffic in real time — method, path, headers, body, detected threat patterns — so you can watch your own attacks from the defender's perspective.

Authentication uses JWT with a deliberately weak secret (`123456`). The session cookie is called `session` and is readable from JavaScript on purpose.

## Challenges

| # | Challenge | Category | Difficulty | What to look for |
|---|-----------|----------|------------|------------------|
| 1 | Free Drop | Cart Manipulation | Easy | The server trusts the price sent by the client |
| 2 | Stolen Session | Stored XSS | Medium | Reviews are rendered without sanitization |
| 3 | Leaked Molds | IDOR | Easy | Order endpoints don't verify ownership |
| 4 | Payment Bypass | Business Logic | Medium | The payment flow accepts `{"status":"success"}` without verification |
| 5 | Admin Coupon | SQL Injection | Easy | The newsletter input is concatenated raw into a SQL query |

Each challenge awards a flag (`FLAG{...}`) and has a two-level hint system accessible from the SOC — one conceptual, one technical.

## Getting started

### With Docker

```bash
git clone https://github.com/javiernglz/bugdrop.git
cd bugdrop
docker compose up --build
```

### Local install

```bash
git clone https://github.com/javiernglz/bugdrop.git
cd bugdrop

# Install dependencies for all three services
npm run install:all

# Seed the database
npm run seed

# Start everything (backend + shop + soc)
npm run dev
```

### Access

| Service | URL | Description |
|---------|-----|-------------|
| **Cyber Range** | **http://localhost:3000** | **Split View (TryHackMe style) - Recommended** |
| Shop | http://localhost:5173 | The vulnerable store |
| Mini-SOC | http://localhost:5174 | Monitoring dashboard and CTF panel |
| API | http://localhost:3000/api/health | Backend REST API |

## How to play

1. Open the Shop (`:5173`) and the Mini-SOC (`:5174`) side by side.
2. Log in to the shop with one of the test accounts (visible on the login page).
3. Browse the store normally — you'll see traffic flowing into the SOC console in real time.
4. Try to exploit the vulnerabilities using your browser's DevTools or Burp Suite.
5. When you capture a flag, submit it in the SOC to unlock the badge.
6. Use the hint system if you get stuck. Level 1 gives you the concept, level 2 gives you the technique.
7. If you break the database, hit the Panic Button in the SOC to reset everything.

## Stack

- **Backend**: Node.js, Express, SQLite (better-sqlite3), Socket.io, JWT
- **Shop frontend**: React 19, Vite, Tailwind CSS 4
- **SOC frontend**: React 19, Vite, Tailwind CSS 4, Recharts, Canvas Confetti
- **Orchestration**: Concurrently for development, Docker Compose for production

## Project structure

```
bugdrop/
  backend/
    src/
      db/           init.js, seed.js
      middleware/    socInterceptor.js, authJwt.js
      routes/       auth, products, cart, reviews, orders, payment, ctf, system
    Dockerfile
  frontend-shop/
    src/
      components/   Layout
      context/      AuthContext, CartContext
      pages/        Catalog, ProductDetail, Cart, Orders, Login
    Dockerfile
  frontend-soc/
    src/
      components/   LogConsole, TrafficCharts, ChallengePanel, FlagInput, StatsBar, PanicButton
      hooks/        useSocket, useCtf, useAlertSound
    Dockerfile
  docker-compose.yml
```

## Disclaimer

This project is strictly educational. Every vulnerability is intentional and documented. Do not use these techniques against systems without explicit authorization. Practice only in controlled environments.

## License

MIT
