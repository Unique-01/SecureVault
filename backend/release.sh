#!/bin/sh
set -e

echo "Running migrations..."
npx prisma migrate deploy

echo "Generating swagger..."
npm run swagger