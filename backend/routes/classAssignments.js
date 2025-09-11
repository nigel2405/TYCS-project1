// backend/routes/classAssignments.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");       // ✅ your User model
const Assignment = require("../models/Assignment"); // ✅ we'll make this model

// Get all teachers
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all class assignments
router.get("/", async (req, res) => {
  try {
    const assignments = await Assignment.find().populate("teacherId", "name email");
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign teacher to class
router.post("/assign", async (req, res) => {
  const { className, teacherId } = req.body;

  try {
    // replace if class already has assignment
    let assignment = await Assignment.findOneAndUpdate(
      { className },
      { teacherId },
      { new: true, upsert: true }
    ).populate("teacherId", "name email");

    res.json({ message: "Teacher assigned successfully", assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
