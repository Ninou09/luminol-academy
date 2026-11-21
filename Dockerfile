# Production image for the public website only (apps/web).
# Build from the repository root:
#   docker build -t luminol-web .   (same as apps/web/Dockerfile)
FROM node:22-bookworm-slim

ENV NEXT_TELEMETRY_DISABLED=1 \
    CI=1

# Prisma engines need OpenSSL; pnpm is pinned to the repository's version.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && npm install -g pnpm@10.34.5

WORKDIR /app
COPY . .

# Install only the website and the workspace packages it depends on.
RUN pnpm install --frozen-lockfile --filter "@luminol/web..." --filter "luminol-academy"
RUN pnpm --filter @luminol/web build

ENV NODE_ENV=production
EXPOSE 3000
WORKDIR /app/apps/web
CMD ["sh", "-c", "node node_modules/next/dist/bin/next start -H 0.0.0.0 -p ${PORT:-3000}"]
