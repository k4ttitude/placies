#!/bin/sh
set -e

echo "Running database migrations..."
pnpm drizzle-kit migrate

echo
echo "Seeding database..."
node dist/db/seed.cjs

echo
echo "Starting application..."
exec "$@"
