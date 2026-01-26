# HousesAdda Deployment Guide - VPS/Server

This guide will help you deploy the HousesAdda application to your VPS or server.

## Prerequisites

- VPS/Server with root/SSH access
- Domain name pointed to your server IP (optional but recommended)
- Basic knowledge of Linux commands

## Step 1: Connect to Your Server

```bash
ssh root@your-server-ip
# or
ssh root@your-domain.com
```

## Step 2: Update System

```bash
# For Ubuntu/Debian
apt update && apt upgrade -y

# For CentOS/RHEL
yum update -y
```

## Step 3: Install Node.js and npm

```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 4: Install Nginx

```bash
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx
```

## Step 5: Install PM2 (Process Manager)

```bash
npm install -g pm2
```

## Step 6: Clone Your Repository

```bash
# Navigate to a suitable directory
cd /var/www

# Clone your repository
git clone https://github.com/octaleadsprivatelimited-cloud/housesadda.git
cd housesadda

# Install dependencies
npm install
```

## Step 7: Set Up Environment Variables

```bash
# Create .env file
nano .env
```

Add the following content:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database (SQLite - no additional config needed)
# Database file will be created at: database/housesadda.db

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

# Frontend API URL
VITE_API_URL=http://your-domain.com/api
# Or if using IP:
# VITE_API_URL=http://your-server-ip/api
```

Save and exit (Ctrl+X, then Y, then Enter)

## Step 8: Build the Frontend

```bash
# Build the React frontend
npm run build

# This creates a 'dist' folder with production-ready files
```

## Step 9: Set Up PM2 for Backend

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add this content:

```javascript
module.exports = {
  apps: [{
    name: 'housesadda-backend',
    script: 'server/index-sqlite.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

Save and exit.

```bash
# Create logs directory
mkdir -p logs

# Start the backend with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the instructions it provides
```

## Step 10: Configure Nginx

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/housesadda
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    # Or use your IP if no domain: server_name your-server-ip;

    # Frontend (React build)
    location / {
        root /var/www/housesadda/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Save and exit.

```bash
# Enable the site
ln -s /etc/nginx/sites-available/housesadda /etc/nginx/sites-enabled/

# Remove default site (optional)
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

## Step 11: Set Up SSL with Let's Encrypt (Optional but Recommended)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts
# Certbot will automatically configure Nginx for HTTPS
```

## Step 12: Configure Firewall

```bash
# Install UFW (if not installed)
apt install -y ufw

# Allow SSH
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

## Step 13: Set Permissions

```bash
# Set proper permissions
chown -R www-data:www-data /var/www/housesadda
chmod -R 755 /var/www/housesadda

# Make sure database directory is writable
chmod -R 777 /var/www/housesadda/database
```

## Step 14: Verify Deployment

1. **Check Backend:**
   ```bash
   pm2 status
   pm2 logs housesadda-backend
   ```

2. **Check Nginx:**
   ```bash
   systemctl status nginx
   ```

3. **Test API:**
   ```bash
   curl http://localhost:3001/api/properties
   ```

4. **Access in Browser:**
   - Visit: `http://your-domain.com` or `http://your-server-ip`
   - Admin panel: `http://your-domain.com/admin`

## Step 15: Set Up Auto-Deployment (Optional)

Create a deployment script:

```bash
nano /var/www/housesadda/deploy.sh
```

Add:

```bash
#!/bin/bash
cd /var/www/housesadda
git pull origin main
npm install
npm run build
pm2 restart housesadda-backend
echo "Deployment completed!"
```

Make it executable:

```bash
chmod +x /var/www/housesadda/deploy.sh
```

## Useful Commands

### PM2 Commands
```bash
pm2 status              # Check status
pm2 logs               # View logs
pm2 restart all        # Restart all apps
pm2 stop all           # Stop all apps
pm2 monit              # Monitor in real-time
```

### Nginx Commands
```bash
systemctl status nginx    # Check status
systemctl restart nginx   # Restart
nginx -t                  # Test configuration
```

### Database Backup
```bash
# Backup SQLite database
cp /var/www/housesadda/database/housesadda.db /var/www/housesadda/database/housesadda.db.backup.$(date +%Y%m%d)
```

## Troubleshooting

### Backend not starting
```bash
# Check PM2 logs
pm2 logs housesadda-backend

# Check if port is in use
netstat -tulpn | grep 3001
```

### Nginx 502 Bad Gateway
- Check if backend is running: `pm2 status`
- Check backend logs: `pm2 logs housesadda-backend`
- Verify backend is listening on port 3001

### Frontend not loading
- Check if build was successful: `ls -la dist/`
- Check Nginx error logs: `tail -f /var/log/nginx/error.log`
- Verify Nginx configuration: `nginx -t`

### Database issues
- Check database file permissions: `ls -la database/`
- Ensure database directory is writable: `chmod -R 777 database/`

## Security Recommendations

1. **Change default SSH port** (optional but recommended)
2. **Use strong passwords** or SSH keys
3. **Keep system updated**: `apt update && apt upgrade`
4. **Regular backups** of database and code
5. **Monitor logs** regularly
6. **Use firewall** (UFW) to restrict access
7. **Enable SSL/HTTPS** with Let's Encrypt

## Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Check system logs: `journalctl -xe`

