#!/bin/bash
# If we are in the root directory, move into backend
if [ -d "backend" ]; then
  cd backend
fi

# Start the FastAPI application
uvicorn app.main:app --host 0.0.0.0 --port $PORT
