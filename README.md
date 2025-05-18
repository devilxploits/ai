# AI Web Application

This is a Node.js and React-based web application cloned from https://github.com/devilxploits/ai.git.

## Project Overview

This application includes:
- A React frontend with various UI components
- An Express.js backend server
- REST API endpoints for posts, photos, and user authentication
- Real-time chat functionality with WebSockets
- Payment processing capabilities

## Requirements

- Node.js v18.x or higher
- npm v8.x or higher

## Installation

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

4. For production:
   ```
   npm run build
   npm start
   ```

## Environment Variables

The application may require the following environment variables:
- `DATABASE_URL` - PostgreSQL database connection string (if using a database)
- `SESSION_SECRET` - Secret for Express sessions
- `PORT` - Server port (defaults to 5000)

## Project Structure

- `/client` - React frontend code
- `/server` - Express backend code
- `/shared` - Shared types and schemas

## Available Scripts

- `npm run dev` - Run the development server
- `npm run build` - Build the project for production
- `npm start` - Start the production server
- `npm run check` - Run TypeScript checks
- `npm run db:push` - Push database schema changes (if using Drizzle ORM)