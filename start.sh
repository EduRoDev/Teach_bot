#!/bin/sh
echo "DATABASE_URL is: $DATABASE_URL"
echo "Running migrations..."
npx prisma migrate deploy --config dist/prisma.config.js
echo "Starting app..."
exec node dist/src/main