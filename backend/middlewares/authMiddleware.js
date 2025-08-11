const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  res.status(403).json({ message: "Admins only" });
};

exports.isTeacher = (req, res, next) => {
  if (req.user?.role === "teacher") return next();
  res.status(403).json({ message: "Teachers only" });
};

exports.isStudent = (req, res, next) => {
  if (req.user?.role === "student") return next();
  res.status(403).json({ message: "Students only" });
};
