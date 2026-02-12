#!/bin/bash
# ============================================
# EC2 Server Setup Script for AI Interviewer
# Run this on a fresh Ubuntu 22.04/24.04 EC2 instance
# Usage: sudo bash setup-server.sh
# ============================================

set -e

echo "=========================================="
echo "  AI Interviewer Platform — Server Setup"
echo "=========================================="

# Update system
echo "→ Updating system packages..."
apt-get update && apt-get upgrade -y

# Install essential tools
echo "→ Installing essentials..."
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

# Install Node.js 20 LTS
echo "→ Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify
echo "→ Node.js version: $(node -v)"
echo "→ npm version: $(npm -v)"

# Install PM2 (process manager)
echo "→ Installing PM2..."
npm install -g pm2

# Create app user
echo "→ Creating app user..."
if ! id "appuser" &>/dev/null; then
  useradd -m -s /bin/bash appuser
fi

# Create app directory
echo "→ Setting up app directory..."
mkdir -p /home/appuser/app
chown -R appuser:appuser /home/appuser/app

# Configure UFW firewall
echo "→ Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "=========================================="
echo "  Server setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Copy your project to /home/appuser/app/"
echo "  2. Create /home/appuser/app/.env with your env vars"
echo "  3. Run: sudo bash /home/appuser/app/deploy/start-app.sh"
echo "  4. Run: sudo bash /home/appuser/app/deploy/setup-nginx.sh"
echo ""
