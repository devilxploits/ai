#!/bin/bash

# Script to apply admin user privileges
# This script ensures the admin user always has full access to all features

echo "Applying special admin user privileges..."

# Create a configuration file that will be loaded during startup
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

# Success message
echo "Admin user privileges configured successfully!"
echo "Admin users will now have full access to all features without restrictions."