// routes/teacherRoutes.js
const express = require("express");
const Teacher = require("../models/Teacher");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user.userId }).populate("userId", "name email");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    res.json({
      name: teacher.userId.name,
      email: teacher.userId.email,
      assignedClasses: teacher.assignedClasses,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
