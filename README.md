# Bugdrop

Bugdrop is an intentionally vulnerable e-commerce platform and SOC (Security Operations Center) dashboard designed as a Cyber Range for training.

## Requirements
- **Node.js**: 20+
- **Docker**: (Optional, but recommended for complete stack)
- **Local Mode**: If running natively without Docker, you must run `npx playwright install chromium` first.

## Structure
- `backend/src/routes/admin.js`: Bot whitelist and reset logic.
- `backend/src/services/bot.js`: The admin bot executing headless Chromium.
- `backend/src/services/socAlert.js`: WebSocket logic for SOC notifications.
- `backend/src/middleware/rateLimit.js`: Rate limiting for sensitive endpoints.
- `frontend-shop/src/components/Tutorials/`: UI for didactic tutorials.
- `frontend-soc/src/components/DidacticReport/`: UI for SOC reporting.
- `tests/`: Automated test suite (`test_bot.js`, `test_step7.js`, `test_challenges.js`).
- `.github/`: CI workflows.

## Environment Variables
- `DATA_DIR`: Path for database and secrets (default: `.` natively, `/data` in Docker).
- `SHOP_HOST`: The host for the shop (default: `localhost:5173`, `shop:8080` in Docker).
- `ALLOW_RESET`: Shared secret header required to reset the DB.
- `BOT_CHROMIUM_ARGS`: Extra args for the Chromium bot.
- `SKIP_BOT_TEST`: Set to 1 to skip bot availability tests.
- `HINT_LEVEL2_DELAY_SECONDS`: Delay in seconds for level 2 hints (e.g. 3).

## Test Accounts
The following accounts are available for testing:
| Username | Password | Role |
|----------|----------|------|
| `admin`  | `admin123` | Administrator |
| `user1`  | `user123` | Regular User |
| `user2`  | `user123` | Regular User |
| `demo`   | `demo123` | Regular User |

## XSS Challenge Architecture
The XSS challenge involves stealing the admin session:
1. You inject an XSS payload in a product review.
2. The bot (Admin) periodically visits recent reviews.
3. Your payload triggers in the bot's context.
4. It sends the `document.cookie` (stolen token) to the internal `/api/ctf/collector`.
5. The backend validates it and emits an alert with the flag via WebSocket.
6. The flag and the stolen token are displayed in the SOC dashboard.

## Running Tests
**Local Native Mode**:
Ensure both the shop and the backend are running:
```bash
HINT_LEVEL2_DELAY_SECONDS=3 npm run dev:backend
cd frontend-shop && npm run dev
```
Execute the tests with `sleep 11` between them (cooldown for the reset):
```bash
npm test
sleep 11
npm run test:bot
sleep 11
HINT_LEVEL2_DELAY_SECONDS=3 npm run test:step7
```

**Docker Mode**:
```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml up -d --build --wait
```

## Troubleshooting
- **Ports occupied**: Ensure `3000`, `5173`, `5174`, `8080` are free before starting.
- **Bot not available**: Check `/api/sys/status`. Ensure Playwright Chromium is installed or Chromium limits aren't hit.
- **How to reset**: Use the `Reset` button in the UI or call `/api/sys/reset` with the `ALLOW_RESET` header.

<!-- TODO(humano): captura/GIF -->

## License
MIT License
