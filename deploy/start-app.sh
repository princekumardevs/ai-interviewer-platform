#!/bin/bash
# ============================================
# Build and start the Next.js app with PM2
# Run as: sudo -u appuser bash start-app.sh
# ============================================

set -e

APP_DIR="/home/appuser/app"
cd "$APP_DIR"

echo "→ Installing dependencies..."
npm ci --production=false

echo "→ Generating Prisma client..."
npx prisma generate

echo "→ Pushing database schema..."
npx prisma db push

echo "→ Building Next.js app..."
npm run build

echo "→ Starting app with PM2..."
pm2 delete ai-interviewer 2>/dev/null || true
pm2 start npm --name "ai-interviewer" -- start
pm2 save

echo "→ Setting up PM2 startup..."
pm2 startup systemd -u appuser --hp /home/appuser
pm2 save

echo ""
echo "=========================================="
echo "  App is running on port 3000!"
echo "=========================================="
