const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, rfidTag } = req.body;

    // 1️⃣ Hash password
    const hashed = await bcrypt.hash(password, 10);

    // 2️⃣ Create main user
    const user = await User.create({ name, email, password: hashed, role });

    // 3️⃣ Create role-specific document
    if (role === "student") {
      await Student.create({ user: user._id, rfidTag }); // ✅ only save reference + RFID
    } else if (role === "teacher") {
      await Teacher.create({ user: user._id });          // ✅ no name/email here
    } else if (role === "admin") {
      await Admin.create({ user: user._id });            // ✅ same
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

    res.json({ token, role: user.role });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: err.message });
  }
};
