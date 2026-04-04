FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache curl \
    && addgroup -g 1001 -S nodejs \
    && adduser -S flowlet -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY src/ ./src/
COPY config/ ./config/

RUN chown -R flowlet:nodejs /app

USER flowlet

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["node", "src/index.js"]
