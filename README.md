# Admin Privileges Changes

This directory contains all the files modified to ensure admin users have full access to all features without any restrictions.

## What These Changes Do

1. Admin users are now automatically treated as paid users with VIP subscription status
2. Admin users have unlimited message access without hitting free user limits
3. Admin users have full access to all premium photos and videos
4. These changes persist even if the repository is redeployed

## Files Modified

### 1. server/admin-config.ts (New File)
- Created a configuration file that defines admin privileges
- Sets admin users as paid with VIP subscription
- Configures a 10-year subscription expiry

### 2. server/openRouter.ts
- Modified to detect admin users and bypass message limits
- Added special handling to grant admins unlimited messaging

### 3. server/routes.ts
- Updated photo and video routes to give admins access to premium content
- Modified permission checks to recognize admin privileges

### 4. server/storage.ts
- Updated admin user initialization to automatically set paid VIP status
- Added a far-future subscription expiry date (10 years)

### 5. admin-setup.sh (New File)
- Created a script to automatically apply admin privileges
- Ensures changes remain persistent across deployments

### 6. run.sh
- Modified to check for and create the admin configuration file if missing
- Ensures admin privileges are applied every time the app starts

## How to Apply These Changes

1. Replace the original files with these modified versions
2. Make both shell scripts executable with: `chmod +x admin-setup.sh run.sh`
3. Restart the application

## Default Admin Login
- Username: admin
- Password: admin