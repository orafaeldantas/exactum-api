#!/bin/sh
set -e

echo "Waiting for Postgres..."

timeout=30

while ! nc -z db 5432; do
  timeout=$((timeout - 1))
  if [ "$timeout" -le 0 ]; then
    echo "Postgres not available after timeout"
    exit 1
  fi
  sleep 1
done

echo "Postgres is up"

echo "Starting application..."
exec "$@"