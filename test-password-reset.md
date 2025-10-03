# Password Reset Debugging Guide

## Issue
Password reset link is sent correctly, but after resetting the password, the system still only accepts the old password instead of the new one.

## Enhanced Debugging

I've added comprehensive logging to the backend authentication controller. Here's what to do:

### 1. Test the Password Reset Flow

1. **Request Password Reset:**
   - Go to `/forgot-password`
   - Enter your email
   - Check the backend console for logs starting with "🔄 Password reset requested"

2. **Use the Reset Link:**
   - Click the reset link or copy it from the response
   - Enter a new password
   - Check the backend console for logs starting with "🔄 Password reset attempt"

3. **Try to Login:**
   - Go to `/login`
   - Try logging in with the NEW password
   - Check the backend console for logs starting with "🔍 Login attempt"

### 2. Debug API Endpoint

I've added a debug endpoint to check user status:

```
GET http://localhost:5000/api/auth/debug-user?email=YOUR_EMAIL
```

This will show:
- User's current password hash
- Whether they have an active reset token
- When the user was last updated

### 3. Common Issues and Solutions

#### Issue 1: Multiple User Records
**Symptoms:** Password resets but login still fails
**Check:** Look for duplicate users in the database
**Solution:** Remove duplicate records

#### Issue 2: Database Transaction Issues
**Symptoms:** Reset appears successful but password doesn't change
**Check:** Look for database connection errors in logs
**Solution:** Ensure MongoDB connection is stable

#### Issue 3: Caching Issues
**Symptoms:** Old password still works after reset
**Check:** Restart the backend server
**Solution:** Clear any caches, restart services

#### Issue 4: Token Validation Issues
**Symptoms:** "Invalid token" errors
**Check:** Token expiry time (15 minutes)
**Solution:** Generate a new reset link

### 4. Manual Database Check

If you have access to MongoDB, check the user record directly:

```javascript
// In MongoDB shell or Compass
db.users.findOne({ email: "your-email@example.com" })
```

Look for:
- `password` field (should be a bcrypt hash)
- `resetPasswordToken` field (should be null after successful reset)
- `resetPasswordExpires` field (should be null after successful reset)
- `updatedAt` field (should be recent if password was just reset)

### 5. Test Script

I've created a debug script at `backend/debug-password-reset.js`. To run it:

```bash
cd backend
node debug-password-reset.js
```

Make sure to update the `testEmail` variable in the script with the email you're testing.

### 6. What the Logs Should Show

**Successful Password Reset Flow:**
```
🔄 Password reset requested for email: user@example.com
✅ User found for password reset: user@example.com
🔍 Generated token: 1a2b3c4d...
✅ Reset token saved successfully
📧 Email not configured, returning token for dev
🔄 Password reset attempt with token: 1a2b3c4d...
✅ User found for password reset: user@example.com
🔍 Old password hash: $2b$12$abcd1234...
🔍 New password hash: $2b$12$efgh5678...
✅ Password updated successfully using findByIdAndUpdate
🔍 Password verification after save: true
✅ Password reset completed successfully for user: user@example.com
```

**Successful Login with New Password:**
```
🔍 Login attempt for user: user@example.com
🔍 Stored password hash: $2b$12$efgh5678...
🔍 Password match result: true
✅ Login successful for user: user@example.com
```

### 7. Next Steps

1. Follow the test flow above and share the console logs
2. Try the debug endpoint to check user status
3. If the issue persists, run the debug script
4. Check for any database connection issues

The enhanced logging will help identify exactly where the issue is occurring in the password reset flow.