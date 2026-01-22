#!/bin/bash

echo "🚀 Starting Life OS Dashboard..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db 2>/dev/null || {
        echo "❌ MongoDB failed to start. Please install MongoDB or start it manually."
        echo "   On Linux: sudo systemctl start mongodb"
        echo "   On macOS: brew services start mongodb-community"
        exit 1
    }
    echo "✅ MongoDB started"
else
    echo "✅ MongoDB is already running"
fi

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
cd backend
if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install --quiet
fi

# Install frontend dependencies
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install --quiet
fi

echo ""
echo "🎯 Starting servers..."
echo ""
echo "Backend will run on:  http://localhost:5000"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
cd ../backend
npm run dev > /tmp/lifeos-backend.log 2>&1 &
BACKEND_PID=$!

# Give backend time to start
sleep 3

# Start frontend in background
cd ../frontend
npm run dev > /tmp/lifeos-frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for servers to start
sleep 5

echo "✅ Servers started!"
echo ""
echo "🌐 Open your browser and visit: http://localhost:3000"
echo ""
echo "📋 Logs:"
echo "   Backend:  tail -f /tmp/lifeos-backend.log"
echo "   Frontend: tail -f /tmp/lifeos-frontend.log"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ Servers stopped'; exit 0" INT

# Keep script running
wait
