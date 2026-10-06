FROM mcr.microsoft.com/playwright:v1.63.0-jammy

WORKDIR /app

# Create /data and set ownership to pwuser before switching, 
# so Docker's named volume inherits the correct permissions.
# Also chown /app so pwuser can run npm ci and create node_modules.
RUN apt-get update && apt-get install -y build-essential python3 && mkdir /data && chown pwuser:pwuser /data && chown pwuser:pwuser /app

COPY --chown=pwuser:pwuser package*.json ./

USER pwuser
RUN npm ci --omit=dev

COPY --chown=pwuser:pwuser . .

EXPOSE 3000

CMD ["node", "src/server.js"]
