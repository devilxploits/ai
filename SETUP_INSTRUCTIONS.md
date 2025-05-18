# Setup Instructions for AI Web Application

This document provides step-by-step instructions for deploying this application on Replit or Render.

## Deployment on Replit

1. Create a new Replit project
2. In the Replit shell, run:
   ```
   git clone https://github.com/devilxploits/ai.git
   cd ai
   npm install
   ```

3. Set up the Replit run command:
   - For development: `cd ai && npm run dev`
   - For production: `cd ai && npm run build && npm start`

4. Click the "Run" button

## Deployment on Render

1. Sign up for a Render account at https://render.com

2. Create a new Web Service
   - Connect your GitHub repository or use the direct GitHub URL: https://github.com/devilxploits/ai.git
   - Select the Node.js environment

3. Configure the following settings:
   - Build Command: `cd ai && npm install && npm run build`
   - Start Command: `cd ai && npm start`

4. Add any required environment variables under the "Environment" section

5. Click "Create Web Service"

## Common Issues and Troubleshooting

If you encounter dependency issues, particularly with packages like `date-fns`:

1. Try specifying an exact version in package.json:
   ```
   "date-fns": "2.30.0"
   ```

2. If Vite has issues with dependency resolution, try:
   ```
   npm install --force
   ```

3. For database connection issues, ensure your environment variables are correctly set.

## Running Locally

1. Clone the repository:
   ```
   git clone https://github.com/devilxploits/ai.git
   cd ai
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Access the application at http://localhost:5000