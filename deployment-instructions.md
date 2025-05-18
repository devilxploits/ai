# Sophia AI Web App - Deployment Instructions

This document contains instructions for deploying the Sophia AI web application to various platforms.

## Prerequisites

- Node.js v18 or later
- npm v8 or later
- Git

## Required Environment Variables

The application requires these environment variables:

```
DATABASE_URL=postgresql://username:password@hostname:port/database
SESSION_SECRET=your_session_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

## Deployment Options

### Option 1: GitHub + Render

1. Create a new GitHub repository
2. Upload the sophia-ai-app.zip contents to your repository
3. Connect your GitHub repository to Render
4. Set the build command to `npm install && npm run build`
5. Set the start command to `NODE_ENV=production node dist/index.js`
6. Add the required environment variables in Render dashboard
7. Deploy the application

### Option 2: Replit

1. Create a new Replit project
2. Upload sophia-ai-app.zip contents to your Replit project
3. Add the required environment variables in the Replit Secrets tab
4. Install the required dependencies with `npm install`
5. Run the application with `NODE_ENV=development npx tsx server/index.ts`

## Post-Deployment

After deploying, you'll need to:

1. Set up the database by running migrations: `npm run db:push`
2. Create an admin user through the registration page
3. Log in and access the Admin Panel to configure application settings

## Troubleshooting

If the application fails to start:
- Check if all environment variables are properly set
- Ensure the database is accessible and properly configured
- Check the application logs for specific error messages

For PayPal integration issues:
- Verify that your PayPal credentials are correct
- Ensure your PayPal account has permissions for API access
- Check if your PayPal account is properly configured for the desired region and currency

## Maintenance

To keep the application up to date:
- Regularly update Node.js and npm packages
- Monitor database performance and scale as needed
- Backup your database regularly