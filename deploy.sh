#!/bin/bash

# SPOOFER4YOU Deployment Script
echo "🚀 Starting SPOOFER4YOU deployment..."

# Build frontend
echo "📦 Building frontend..."
pnpm install
pnpm run build

# Install backend dependencies
echo "🔧 Installing backend dependencies..."
cd backend
npm install --production

# Create necessary directories
mkdir -p uploads
mkdir -p data

echo "✅ Deployment preparation complete!"
echo ""
echo "🐳 To deploy with Docker:"
echo "docker build -t spoofer4you ."
echo "docker run -p 3001:3001 spoofer4you"
echo ""
echo "🌐 To deploy on Render.com:"
echo "1. Push to GitHub repository"
echo "2. Connect repository to Render.com"
echo "3. Use Docker deployment with included Dockerfile"
echo ""
echo "🔐 Default admin credentials:"
echo "Username: admin"
echo "Password: admin123"
echo ""
echo "⚠️  Remember to change admin password in production!"