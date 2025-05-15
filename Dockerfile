# Base
FROM node:22 AS base
RUN corepack enable \
  && corepack prepare pnpm@latest --activate

# Build
FROM base AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

COPY . .

RUN pnpm run build

# Run
FROM base AS production

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
COPY scripts/docker-entrypoint.sh docker-entrypoint.sh


# executable
COPY --from=builder /app/dist ./dist

# for migration
COPY drizzle/ drizzle/
COPY drizzle.config.ts .
COPY src/db src/db
COPY --from=builder /app/node_modules ./node_modules

RUN chmod +x docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["pnpm", "start"]
