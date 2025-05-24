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