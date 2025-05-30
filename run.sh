#!/bin/bash

# Apply admin user privileges first
echo "Setting up admin user privileges..."

# Check if admin config file exists
if [ ! -f "./server/admin-config.ts" ]; then
  # Create admin config file if it doesn't exist
  echo "Creating admin configuration file..."
  cat > ./server/admin-config.ts << EOL
// Special configuration for admin users
// This file ensures admin users have full access to all features

export const ADMIN_CONFIG = {
  // Admin users should be treated as paid users with full access
  isPaid: true,
  
  // Assign VIP subscription to admin users
  subscriptionPlan: "vip",
  
  // Set a far future expiry date (10 years from current date)
  subscriptionExpiryYears: 10,
  
  // Unlimited messaging and content access
  unlimitedAccess: true
};
EOL
  echo "Admin configuration file created successfully!"
fi

# Start the development server
echo "Starting the development server..."
NODE_ENV=development npx tsx server/index.ts