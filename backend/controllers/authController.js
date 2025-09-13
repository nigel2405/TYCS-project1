const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, rfidTag, className } = req.body;

    // 1️⃣ Hash password
    const hashed = await bcrypt.hash(password, 10);

    // 2️⃣ Create main user
    const user = await User.create({ name, email, password: hashed, role });

    // 3️⃣ Create role-specific document
    if (role === "student") {
      if (!className) {
        return res.status(400).json({ message: "className is required for students" });
      }

      await Student.create({
        userId: user._id,
        rfidTag: rfidTag || null,
        className: className, // ✅ store class here
      });
      } else if (role === "teacher") {
        await Teacher.create({
          userId: user._id,
          assignedClasses: req.body.assignedClasses || [], // ✅ Save assigned classes
        });
      }
 else if (role === "admin") {
      await Admin.create({ userId: user._id });
    }

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Send token, role, and name
    res.json({
      token,
      role: user.role,
      name: user.name || "", // make sure it's never undefined
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: err.message });
  }
};
