FROM mcr.microsoft.com/playwright:v1.63.0-jammy AS build
WORKDIR /app
COPY package*.json ./
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential python3 && \
    npm ci --omit=dev

FROM mcr.microsoft.com/playwright:v1.63.0-jammy
WORKDIR /app

# Create /data and set ownership to pwuser before switching, 
# so Docker's named volume inherits the correct permissions.
# Also chown /app so pwuser can own files.
RUN mkdir /data && chown pwuser:pwuser /data && chown pwuser:pwuser /app

COPY --from=build --chown=pwuser:pwuser /app/node_modules ./node_modules
COPY --chown=pwuser:pwuser . .

USER pwuser
EXPOSE 3000

CMD ["node", "src/server.js"]
