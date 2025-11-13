#!/bin/bash
set -e

echo "🚀 Starting Talent-Hunt build..."

# ===== BACKEND =====
echo "📦 Installing backend dependencies..."
cd team-mentorship/backend
npm install

# ===== FRONTEND =====
echo "📦 Installing frontend dependencies..."
cd ../
npm install

echo "🏗️ Building frontend..."
npm run build

echo "📂 Copying build folder to backend..."
rm -rf backend/dist
cp -r dist backend/

# ===== START BACKEND =====
echo "🚀 Starting backend server..."
cd backend
node server.js
