#!/bin/bash

# HousesAdda Deployment Script
# Run this script to deploy updates to production

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/housesadda || exit

# Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🏗️  Building frontend..."
npm run build

# Restart backend
echo "🔄 Restarting backend..."
pm2 restart housesadda-backend

# Wait a moment
sleep 2

# Check status
echo "✅ Checking status..."
pm2 status

echo "🎉 Deployment completed!"
echo ""
echo "Check logs with: pm2 logs housesadda-backend"
echo "Check status with: pm2 status"

