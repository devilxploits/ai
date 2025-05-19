#!/bin/bash

echo "Starting the AI project..."

# Make sure we start fresh
rm -rf ai

# Clone the repository
echo "Cloning the repository..."
git clone https://github.com/devilxploits/ai.git
echo "Repository cloned successfully!"

# Change to the repository directory
cd ai

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Run the server directly
echo "Starting the server on port 5000..."
NODE_ENV=development npx tsx server/index.ts

echo "Process completed."
