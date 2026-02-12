#!/bin/bash
# ============================================
# EC2 Initial Setup — Docker + Nginx + SSL
# ============================================
# Run on a fresh Ubuntu 22.04/24.04 EC2 instance:
#   sudo bash deploy/setup-ec2-docker.sh
# ============================================

set -euo pipefail

echo "=========================================="
echo " EC2 Setup: Docker + Nginx + SSL"
echo "=========================================="

# ---- System updates ----
echo "--- Updating system packages ---"
apt-get update && apt-get upgrade -y

# ---- Install Docker ----
echo "--- Installing Docker ---"
apt-get install -y ca-certificates curl gnupg lsb-release

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# ---- Install Nginx ----
echo "--- Installing Nginx ---"
apt-get install -y nginx

# ---- Configure Nginx reverse proxy ----
echo "--- Configuring Nginx ---"
cat > /etc/nginx/sites-available/ai-interviewer <<'NGINX'
server {
    listen 80;
    server_name princedev.in www.princedev.in;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/ai-interviewer /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# ---- Setup SSL with Let's Encrypt ----
echo "--- Installing Certbot ---"
apt-get install -y certbot python3-certbot-nginx

echo ""
echo "=========================================="
echo " Setup complete!"
echo "=========================================="
echo ""
echo " Next steps:"
echo "   1. Point princedev.in A record to this server's IP"
echo "   2. Run: sudo certbot --nginx -d princedev.in -d www.princedev.in"
echo "   3. Docker pull & run your container (CI/CD will handle this)"
echo ""
echo " Firewall: Make sure ports 22, 80, 443 are open in your Security Group"
echo "=========================================="
