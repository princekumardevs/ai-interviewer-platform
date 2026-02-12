#!/bin/bash
# ============================================
# Quick deploy — pull latest code, rebuild, restart
# Run on EC2: bash deploy/redeploy.sh
# ============================================

set -e
APP_DIR="/home/appuser/app"
cd "$APP_DIR"

echo "→ Pulling latest code..."
git pull origin main

echo "→ Installing dependencies..."
npm ci --production=false

echo "→ Generating Prisma client..."
npx prisma generate

echo "→ Pushing database schema..."
npx prisma db push

echo "→ Building..."
npm run build

echo "→ Restarting..."
pm2 restart ai-interviewer

echo "→ Done! App redeployed."
