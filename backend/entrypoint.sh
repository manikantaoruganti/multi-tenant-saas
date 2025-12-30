#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  sleep 2
done

echo "✅ DB ready"

export PGPASSWORD="$DB_PASSWORD"

echo "🔨 Running migrations..."
for file in migrations/*.sql; do
  echo "Running $file"
  psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$file"
done

echo "🌱 Running seeds..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f seeds/seeddata.sql

echo "🚀 Starting backend"
exec node src/server.js
