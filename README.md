# AI Repository Quick Start Guide

## Overview
This repository contains a Node.js and React application from devilxploits/ai GitHub repository. It features a modern React frontend with an Express.js backend that provides various AI-related features.

## Prerequisites
- Node.js 20.x or higher
- npm 8.x or higher

## Quick Setup for Replit

### Automatic Setup (Recommended)
Simply run:
```
python clone_and_run.py
```

This script will:
1. Clone the repository
2. Install dependencies
3. Start the server automatically

### Manual Setup
If you prefer to set up manually, follow these steps:

1. Clone the repository:
```
git clone https://github.com/devilxploits/ai.git ai_repo
cd ai_repo
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm run dev
```

## Project Structure
- `/client` - React frontend
- `/server` - Express.js backend
- `/shared` - Shared types and utilities

## Key Features
- React-based UI with modern components
- Express.js backend server
- REST API for posts, photos, and user authentication
- Chat functionality with WebSockets
- Admin panel for monitoring

## Troubleshooting
- If you encounter missing dependencies, make sure to run `npm install` from the root directory of the repository
- The server runs on port 5000 by default
- Check console logs for any errors during startup

## Development
The application uses Vite for fast development experience. The development server supports hot module reloading.