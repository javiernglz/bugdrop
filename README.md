# Bugdrop

A dual-interface cyber range for learning pentesting and bug bounty from scratch.

Bugdrop is a training environment built around a deliberately vulnerable e-commerce store — a fictional collectible figures brand — paired with a real-time monitoring dashboard (Mini-SOC) that tracks every attack as it happens. Seven CTF challenges are baked into the store, each exposing a different class of web vulnerability.



## Key Features
- **3D Art Toy Aesthetic:** A premium, fully custom-designed frontend that breaks the mold of typical boring CTF environments.
- **Interactive Guided Tours:** In-app floating avatars (powered by Driver.js) guide beginners through the interface and hacking basics.
- **Real-Time SOC Dashboard:** Watch your HTTP traffic, detected XSS/SQLi threats, and submit flags in a live React dashboard powered by WebSockets.
- **Story-Driven CTF:** Play the role of a rogue collector trying to infiltrate the Admin's secret panel and steal the master factory molds.

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
| 2 | Backup Leak | Information Disclosure | Easy | Hidden files on the web root left behind |
| 3 | Stolen Session | Stored XSS | Medium | Reviews are rendered without sanitization |
| 4 | Leaked Molds | IDOR | Easy | Order endpoints don't verify ownership |
| 5 | Payment Bypass | Business Logic | Medium | The payment flow accepts `{"status":"success"}` without verification |
| 6 | Admin Coupon | SQL Injection | Easy | The newsletter input is concatenated raw into a SQL query |
| 7 | Admin Panel Access | Authentication / Recon | Hard | Hidden `/admin` route accessible only with a stolen JWT cookie |

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
| Shop | http://localhost:5173 | The vulnerable store (Attack from here) |
| Mini-SOC | http://localhost:5174 | Monitoring dashboard (Defend from here) |
| API | http://localhost:3000 | Backend REST API |

## How to play

1. Open the Shop (`http://localhost:5173`) and the Mini-SOC (`http://localhost:5174`) in two separate windows side by side.
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
- **Orchestration**: Concurrently for local development, Docker Compose for containerized environment

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


## Automated Tests & Playwright XSS Bot
This repository includes automated CI/CD via GitHub actions and a realistic headless Chromium bot (Playwright) that evaluates Stored XSS payloads against the administrator session in the background. The SOC will catch it if successful!
