#!/bin/bash

# Script to manage npm server process
# Kills existing processes on port 3000 and starts npm server

PORT=3000

echo "🚀 Starting server management script..."

# Check if something is running on port 3000
EXISTING_PID=$(lsof -ti:$PORT 2>/dev/null)

if [ ! -z "$EXISTING_PID" ]; then
    echo "⚠️  Found process(es) running on port $PORT: $EXISTING_PID"
    echo "🔥 Killing existing process(es)..."

    # Kill all processes on the port
    lsof -ti:$PORT | xargs kill -9 2>/dev/null

    # Wait a moment for processes to terminate
    sleep 2

    # Verify processes are killed
    REMAINING_PID=$(lsof -ti:$PORT 2>/dev/null)
    if [ ! -z "$REMAINING_PID" ]; then
        echo "❌ Failed to kill process(es) on port $PORT"
        exit 1
    else
        echo "✅ Successfully killed existing process(es)"
    fi
else
    echo "✅ Port $PORT is available"
fi

echo "🏃 Starting npm server..."

# Try to start the server
npm start

# Check if the command was successful
if [ $? -eq 0 ]; then
    echo "✅ Server started successfully!"
else
    echo "❌ Failed to start server"
    exit 1
fi