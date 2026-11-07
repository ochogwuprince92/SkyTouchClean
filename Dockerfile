# Multi-stage build for Next.js application
# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies, including native modules such as argon2.
RUN npm ci

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build arguments for environment variables
ARG MONGODB_URI
ARG MONGODB_DB
ARG SESSION_SECRET
ARG PAYSTACK_SECRET_KEY
ARG NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
ARG NEXT_PUBLIC_SITE_URL

# Set environment variables for build (with defaults)
ENV MONGODB_URI=${MONGODB_URI:-mongodb://localhost:27017/skytouchclean}
ENV MONGODB_DB=${MONGODB_DB:-skytouchclean}
ENV SESSION_SECRET=${SESSION_SECRET:-default-session-secret-for-build-min-32-chars-long}
ENV PAYSTACK_SECRET_KEY=${PAYSTACK_SECRET_KEY:-sk_test_default}
ENV NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=${NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY:-pk_test_default}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
