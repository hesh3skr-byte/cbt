#!/bin/bash

echo "🚀 Starting Life OS Dashboard..."
echo ""
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Opening in browser in 5 seconds..."
echo "Press Ctrl+C to stop"
echo ""

# Start backend in background
cd "$(dirname "$0")/backend"
npm run dev 2>&1 | sed 's/^/[BACKEND] /' &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend in background
cd "$(dirname "$0")/frontend"
npm run dev 2>&1 | sed 's/^/[FRONTEND] /' &
FRONTEND_PID=$!

# Wait for frontend to be ready
sleep 5

# Try to open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi

echo ""
echo "✅ Servers running!"
echo ""
echo "If browser didn't open automatically, visit:"
echo "    👉 http://localhost:3000"
echo ""

# Cleanup on exit
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Keep running
wait
