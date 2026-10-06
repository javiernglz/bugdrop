FROM mcr.microsoft.com/playwright:v1.43.0-jammy

WORKDIR /app

# Create /data and set ownership to pwuser before switching, 
# so Docker's named volume inherits the correct permissions.
RUN mkdir /data && chown pwuser:pwuser /data

COPY --chown=pwuser:pwuser package*.json ./
RUN npm ci --omit=dev

COPY --chown=pwuser:pwuser . .

USER pwuser

EXPOSE 3000

CMD ["node", "src/server.js"]
