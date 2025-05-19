#!/bin/bash

echo "Starting the AI project..."

# Check if node_modules_cache exists (for faster setup)
if [ -d "node_modules_cache" ]; then
  echo "Using cached node_modules for faster setup..."
  cp -r node_modules_cache node_modules
else
  # Install basic dependencies needed for the application
  echo "Installing core dependencies..."
  npm install express pg ws zod tsx drizzle-orm drizzle-kit --save
  
  # Create cache for future runs
  echo "Creating node_modules cache for faster future runs..."
  mkdir -p node_modules_cache
  cp -r node_modules node_modules_cache
fi

# Set up the database
echo "Setting up database..."
npx drizzle-kit push

# Start the server
echo "Starting the server on port 5000..."
NODE_ENV=development HOST=0.0.0.0 PORT=5000 npx tsx server/index.ts

echo "Process completed."