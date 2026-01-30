#!/bin/bash

# Kill any processes that might be running on the ports we need
kill $(lsof -t -i:3001) || true
kill $(lsof -t -i:5173) || true

echo "--- Starting Backend Server ---"
# Use the corrected server file
node backend/server.cjs &

# Wait a moment for the backend to initialize
sleep 3

echo "--- Starting Frontend Server ---"
npm run dev --prefix frontend
