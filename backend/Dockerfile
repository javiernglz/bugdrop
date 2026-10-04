FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
COPY cyber-range.html ./cyber-range.html

RUN node src/db/seed.js

EXPOSE 3000
CMD ["node", "src/server.js"]
