#!/bin/bash

echo "Starting the AI project..."

# Create a clean directory structure
rm -rf ai_working
mkdir -p ai_working
cd ai_working

# Clone the repository
echo "Cloning the repository..."
git clone https://github.com/devilxploits/ai.git .
echo "Repository cloned successfully!"

# Install basic dependencies needed for the application
echo "Installing core dependencies..."
npm install express pg ws zod tsx drizzle-orm drizzle-kit --save

# Set up the database
echo "Setting up database..."
npx drizzle-kit push

# Start the server
echo "Starting the server on port 5000..."
NODE_ENV=development npx tsx server/index.ts

echo "Process completed."
