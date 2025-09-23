// backend/routes/testRoutes.js
const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// Simulate marking attendance (for testing without RFID)
router.post("/simulate-attendance", async (req, res) => {
  try {
    const { studentId, date } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    const attendance = new Attendance({
      student: studentId,
      date: date || new Date(),
      status: "present",
    });

    await attendance.save();
    res.json({ message: "Attendance simulated successfully ✅", attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
