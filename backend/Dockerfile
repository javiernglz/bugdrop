FROM mcr.microsoft.com/playwright:v1.43.0-jammy

# We use the Playwright image because the Bot needs browsers to run the XSS challenge
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# We don't seed the DB here so it can be mounted via volumes
# We'll run seed if db doesn't exist at startup
EXPOSE 3000

# Script to init and start
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'if [ ! -f bugdrop.db ]; then node src/db/seed.js; fi' >> /app/start.sh && \
    echo 'node src/server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Use a non-root user (playwright image has 'pwuser')
USER pwuser

CMD ["/app/start.sh"]
