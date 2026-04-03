# ─────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Copy package manifests first for layer caching
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Install dependencies (prefer pnpm, fall back to npm)
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install --frozen-lockfile; \
    else \
      npm ci; \
    fi

# Copy source
COPY . .

# Build production bundle
# Build-time env vars are inlined by Vite - pass them as build args
ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_ENABLE_MFA=true
ARG VITE_ENABLE_BIOMETRIC=true
ARG VITE_ENABLE_ANALYTICS=false
ARG VITE_CSP_ENABLED=true
ARG VITE_ENABLE_SECURITY_HEADERS=true

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ENABLE_MFA=$VITE_ENABLE_MFA
ENV VITE_ENABLE_BIOMETRIC=$VITE_ENABLE_BIOMETRIC
ENV VITE_ENABLE_ANALYTICS=$VITE_ENABLE_ANALYTICS
ENV VITE_CSP_ENABLED=$VITE_CSP_ENABLED
ENV VITE_ENABLE_SECURITY_HEADERS=$VITE_ENABLE_SECURITY_HEADERS

RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm run build; \
    else \
      npm run build; \
    fi

# ─────────────────────────────────────────────
# Stage 2: Serve with Nginx
# ─────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user for nginx worker processes
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

USER appuser

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
