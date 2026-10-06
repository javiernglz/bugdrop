# Security Considerations

This is an intentionally vulnerable application designed for educational purposes. It contains critical security flaws like XSS, CSRF, IDOR, SQL Injection, and Broken Access Control by design.

**Do not expose this application outside of `127.0.0.1`.**

### Bot Sandbox and Hostile HTML
The backend executes a Chromium browser to visit user-submitted content (hostile HTML) to simulate an admin for the XSS challenge. 
- While the bot only visits URLs on a strict whitelist (e.g., `http://shop:8080` or `http://localhost:5173`), it renders whatever payload is there.
- `--no-sandbox` is passed to the browser as a conscious decision to run inside Docker without privileged mode. Rely on the Docker container isolation.

### State and Persistence
- Data (like `bugdrop.db`) and the flag secret (`.ctf_secret`) live in the `/data` volume.
- The `/api/sys/reset` endpoint expects the custom header `X-Bugdrop-Client: soc` (which forces a CORS preflight) and has a 10s cooldown. Setting the environment variable `ALLOW_RESET=false` disables the endpoint entirely. This is **NOT authentication**; it only exists to prevent accidental clicks or CSRF attacks from resetting the state of the single-player lab.
