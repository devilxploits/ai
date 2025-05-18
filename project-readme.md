# Sophia AI - Virtual Companion Web Application

Sophia AI is a full-stack web application that creates an interactive virtual companion experience through AI-powered conversations, content sharing, and premium subscription features.

## Features

### User Experience
- **Interactive Chat**: Real-time messaging with AI responses
- **Voice Calls**: Voice conversation capability with text-to-speech and speech-to-text
- **Content Feed**: Photos, videos, and posts with regular updates
- **Responsive Design**: Optimized for both desktop and mobile devices

### Technical Features
- **React Frontend**: Modern and responsive UI built with React and TypeScript
- **Express Backend**: API endpoints handling authentication, content, and AI interactions
- **WebSocket Integration**: For real-time communication
- **PayPal Integration**: Secure payment processing for subscriptions
- **Multi-tier Subscription**: Free and premium content access levels

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based authentication
- **Payment Processing**: PayPal SDK
- **AI Integration**: API connectivity for natural language processing

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm (v8 or later)
- PostgreSQL database

### Installation
1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables (see deployment instructions)
4. Start the development server with `npm run dev`

## Project Structure

- `/client`: Frontend React application
  - `/src/components`: UI components
  - `/src/pages`: Application pages
  - `/src/context`: React context providers
  - `/src/hooks`: Custom React hooks
- `/server`: Backend Express server
  - API routes
  - Database integration
  - AI service connections
- `/shared`: Code shared between frontend and backend
  - Database schema
  - Type definitions

## Subscription Tiers

1. **Free Tier**:
   - Basic chat functionality
   - Limited content access
   - Standard response time

2. **Premium Tier**:
   - Unlimited messaging
   - Voice call capability
   - Exclusive premium content
   - Priority response time
   - Personalized AI experience

## License

This project is proprietary software.

## Support

For support or feature requests, please contact the development team.