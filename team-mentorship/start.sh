#!/bin/bash
set -e

echo "🚀 Starting Talent-Hunt container..."

#############################################
# 1. Install BACKEND dependencies
#############################################
echo "📦 Installing backend dependencies..."
cd team-mentorship/backend
npm install

#############################################
# 2. Install FRONTEND dependencies
#############################################
echo "📦 Installing frontend dependencies..."
cd ..
npm install

#############################################
# 3. Build FRONTEND
#############################################
echo "🏗️ Building frontend..."
npm run build

#############################################
# 4. Copy dist → backend/dist
#############################################
echo "📂 Moving dist/ folder to backend..."
rm -rf backend/dist
mkdir -p backend/dist
cp -r dist/* backend/dist/

#############################################
# 5. Start BACKEND
#############################################
echo "🚀 Starting backend server..."
cd backend
node server.js
