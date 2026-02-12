#!/bin/bash
# ============================================
# Nginx + SSL Setup for princedev.in
# Run as root: sudo bash setup-nginx.sh
# ============================================

set -e

DOMAIN="princedev.in"
APP_PORT=3000

echo "→ Configuring Nginx for $DOMAIN..."

cat > /etc/nginx/sites-available/$DOMAIN <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t
systemctl reload nginx

echo "→ Nginx configured! Site available at http://$DOMAIN"
echo ""

# SSL with Let's Encrypt
echo "→ Setting up SSL certificate..."
echo "  Make sure your domain DNS points to this server's IP first!"
read -p "  Ready to proceed with SSL? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    echo "→ SSL configured! Site available at https://$DOMAIN"
else
    echo "→ Skipping SSL. Run later: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi
