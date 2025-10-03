// Debug script to test password reset functionality
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const User = require('./models/User');

async function debugPasswordReset() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Test email - replace with the email you're testing
    const testEmail = 'test@example.com'; // Replace with actual test email
    
    console.log('\n🔍 Checking user before reset...');
    let user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('❌ User not found. Creating test user...');
      const hashedPassword = await bcrypt.hash('oldpassword', 10);
      user = await User.create({
        name: 'Test User',
        email: testEmail,
        password: hashedPassword,
        role: 'student',
        className: 'Test Class'
      });
      console.log('✅ Test user created');
    }
    
    console.log('User ID:', user._id);
    console.log('Current password hash:', user.password);
    console.log('Reset token:', user.resetPasswordToken);
    console.log('Reset expires:', user.resetPasswordExpires);
    
    // Test password verification with old password
    const oldPasswordMatch = await bcrypt.compare('oldpassword', user.password);
    console.log('Old password matches:', oldPasswordMatch);
    
    // Simulate forgot password process
    console.log('\n🔄 Simulating forgot password...');
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
    await user.save();
    
    console.log('Reset token set:', token);
    console.log('Reset expires:', user.resetPasswordExpires);
    
    // Simulate reset password process
    console.log('\n🔄 Simulating password reset...');
    const newPassword = 'newpassword123';
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Find user with token (like the reset endpoint does)
    const userWithToken = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
    
    if (!userWithToken) {
      console.log('❌ User not found with valid token');
      return;
    }
    
    console.log('✅ User found with valid token');
    
    // Update password
    userWithToken.password = newHashedPassword;
    userWithToken.resetPasswordToken = undefined;
    userWithToken.resetPasswordExpires = undefined;
    await userWithToken.save();
    
    console.log('✅ Password updated');
    
    // Verify the update
    const updatedUser = await User.findById(user._id);
    console.log('\n🔍 Checking user after reset...');
    console.log('New password hash:', updatedUser.password);
    console.log('Reset token cleared:', updatedUser.resetPasswordToken);
    console.log('Reset expires cleared:', updatedUser.resetPasswordExpires);
    
    // Test password verification with new password
    const newPasswordMatch = await bcrypt.compare(newPassword, updatedUser.password);
    console.log('New password matches:', newPasswordMatch);
    
    // Test password verification with old password (should fail)
    const oldPasswordStillMatches = await bcrypt.compare('oldpassword', updatedUser.password);
    console.log('Old password still matches (should be false):', oldPasswordStillMatches);
    
    // Test login simulation
    console.log('\n🔄 Simulating login with new password...');
    const loginUser = await User.findOne({ email: testEmail });
    if (loginUser) {
      const loginMatch = await bcrypt.compare(newPassword, loginUser.password);
      console.log('Login with new password successful:', loginMatch);
      
      const oldLoginMatch = await bcrypt.compare('oldpassword', loginUser.password);
      console.log('Login with old password (should fail):', oldLoginMatch);
    }
    
    console.log('\n✅ Debug complete');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the debug
debugPasswordReset();