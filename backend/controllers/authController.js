const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, className } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    if (role === "admin") {
      return res.status(403).json({ message: "Admin registration is not allowed" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    if (role === "teacher") {
      const user = await User.create({ name, email, password: hashed, role: "teacher" });
      await Teacher.create({ userId: user._id, assignedClasses: [] });
      return res.status(201).json({ message: "Teacher registered successfully", user });
    }

    // default student registration
    if (!className) {
      return res.status(400).json({ message: "className is required for students" });
    }
    const user = await User.create({ name, email, password: hashed, role: "student", className });
    await Student.create({ userId: user._id, rfidTag: null, className });
    return res.status(201).json({ message: "Student registered successfully", user });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // single admin via env
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword && email === adminEmail) {
      if (password !== adminPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      let adminUser = await User.findOne({ email: adminEmail });
      if (!adminUser) {
        const hashed = await bcrypt.hash(adminPassword, 10);
        adminUser = await User.create({ name: "Admin", email: adminEmail, password: hashed, role: "admin" });
        await Admin.create({ userId: adminUser._id });
      } else if (adminUser.role !== "admin") {
        adminUser.role = "admin";
        await adminUser.save();
      }
      const token = jwt.sign({ userId: adminUser._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });
      return res.json({ token, role: "admin", name: adminUser.name || "Admin" });
    }

    // standard users - case-insensitive email lookup
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } 
    });
    if (!user) {
      console.log("❌ Login failed: User not found for email:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    console.log("🔍 Login attempt for user:", user.email);
    console.log("🔍 User ID:", user._id);
    console.log("🔍 Stored password hash:", user.password?.substring(0, 20) + "...");
    console.log("🔍 Password length:", password?.length);
    console.log("🔍 User last updated:", user.updatedAt);
    
    const match = await bcrypt.compare(password, user.password);
    console.log("🔍 Password match result:", match);
    
    if (!match) {
      // Additional debugging for failed password match
      console.log("🔍 Attempting to compare:");
      console.log("  - Input password length:", password?.length);
      console.log("  - Stored hash starts with:", user.password?.substring(0, 7));
      console.log("  - Hash algorithm appears to be:", user.password?.substring(0, 4));
    }
    
    if (!match) {
      console.log("❌ Login failed: Password mismatch for user:", user.email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    console.log("✅ Login successful for user:", user.email);
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.json({ token, role: user.role, name: user.name || "" });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Request password reset: generate token and set expiry
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } 
    });
    if (!user) {
      console.log("❌ User not found for email:", email);
      // Do not reveal whether email exists
      return res.json({ message: "If that email exists, a reset link was sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
    await user.save();

    // Build reset link
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const resetLink = `${clientUrl}/reset-password?token=${token}`;

    // If email credentials missing, return token for dev convenience
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.json({
        message: "Email not configured. Using dev fallback token.",
        token,
        resetLink,
        expiresAt: user.resetPasswordExpires,
      });
    }

    // Send email with Nodemailer via Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `No-Reply <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your password",
      html: `
        <p>Hello ${user.name || ""},</p>
        <p>You requested to reset your password. Click the link below to set a new password. This link is valid for 15 minutes.</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
      replyTo: process.env.EMAIL_USER,
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.json({ message: "If that email exists, a reset link was sent" });
    } catch (emailErr) {
      console.error("❌ Email sending failed:", emailErr && emailErr.response || emailErr);
      // In non-production, include token to unblock testing
      if (process.env.NODE_ENV !== "production") {
        return res.json({
          message: "Email sending failed in dev. Use the token below.",
          token,
          resetLink,
          expiresAt: user.resetPasswordExpires,
        });
      }
      return res.json({ message: "If that email exists, a reset link was sent" });
    }
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    console.log("🔄 Password reset attempt with token:", token?.substring(0, 8) + "...");
    
    if (!token || !password) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      console.log("❌ No user found with valid token");
      // Check if token exists but is expired
      const expiredUser = await User.findOne({ resetPasswordToken: token });
      if (expiredUser) {
        console.log("❌ Token found but expired for user:", expiredUser.email);
        return res.status(400).json({ message: "Reset token has expired. Please request a new reset link." });
      }
      return res.status(400).json({ message: "Invalid reset token. Please request a new reset link." });
    }

    console.log("✅ User found for password reset:", user.email);
    console.log("🔍 User ID:", user._id);
    console.log("🔍 Old password hash:", user.password?.substring(0, 20) + "...");

    // Hash the new password
    const saltRounds = 12; // Increased salt rounds for better security
    const hashed = await bcrypt.hash(password, saltRounds);
    console.log("🔍 New password hash:", hashed?.substring(0, 20) + "...");

    // Use findByIdAndUpdate for atomic operation
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          password: hashed
        },
        $unset: {
          resetPasswordToken: 1,
          resetPasswordExpires: 1
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      console.log("❌ Failed to update user");
      return res.status(500).json({ message: "Failed to update password. Please try again." });
    }

    console.log("✅ Password updated successfully using findByIdAndUpdate");

    // Double-check: Verify the password was actually saved correctly
    const verifyUser = await User.findById(user._id);
    if (!verifyUser) {
      console.log("❌ User not found after update");
      return res.status(500).json({ message: "Error verifying password update" });
    }

    const passwordMatches = await bcrypt.compare(password, verifyUser.password);
    console.log("🔍 Password verification after save:", passwordMatches);
    console.log("🔍 Reset token cleared:", !verifyUser.resetPasswordToken);
    console.log("🔍 Reset expires cleared:", !verifyUser.resetPasswordExpires);

    if (!passwordMatches) {
      console.log("❌ Password verification failed after save");
      return res.status(500).json({ message: "Password update verification failed. Please try again." });
    }

    // Log successful reset
    console.log("✅ Password reset completed successfully for user:", user.email);

    res.json({ 
      message: "Password has been reset successfully",
      success: true
    });
  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ message: "Internal server error. Please try again." });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Get profile error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, profilePicture } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Debug endpoint to check user password status
exports.debugUser = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email parameter required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      email: user.email,
      name: user.name,
      role: user.role,
      hasResetToken: !!user.resetPasswordToken,
      resetTokenExpires: user.resetPasswordExpires,
      passwordHashPrefix: user.password?.substring(0, 20) + "...",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (err) {
    console.error("❌ Debug user error:", err);
    res.status(500).json({ message: err.message });
  }
};
