#!/bin/sh
# Docker entrypoint for development - Start BOTH backend AND frontend

set -e

echo "======================================="
echo "🚀 CJD80 Development Mode"
echo "======================================="

# Wait for dependencies (docker-compose handles health checks)
echo "⏳ Waiting for dependencies (5 seconds)..."
sleep 5
echo "✅ Dependencies should be ready (handled by docker-compose health checks)"

# Install ALL dependencies (including devDependencies for development)
echo "📦 Installing dependencies (including devDependencies)..."
npm install --legacy-peer-deps || {
  echo "⚠️  npm install failed with exit code $?"
  echo "⚠️  Attempting to continue..."
}

# Run database migrations if needed
echo "🗄️  Running database migrations..."
npm run db:push || echo "⚠️  Migration failed (may already be up to date)"

echo "======================================="
echo "🚀 Starting Backend + Frontend..."
echo "======================================="

# Start backend in background
echo "▶️  Starting NestJS backend (port 3000)..."
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 5

# Start frontend in background
echo "▶️  Starting Next.js frontend (port 5174)..."
npm run dev:client &
FRONTEND_PID=$!

echo "======================================="
echo "✅ Services Started"
echo "======================================="
echo "📍 Backend:  http://0.0.0.0:3000/api/health"
echo "📍 Frontend: http://0.0.0.0:5174"
echo "📍 Nginx:    https://cjd80.robinswood.io"
echo "======================================="

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
