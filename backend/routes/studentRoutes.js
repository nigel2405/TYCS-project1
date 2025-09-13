const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const Student = require("../models/Student"); // ✅ Import Student model

// Get all students
router.get("/", studentController.getAllStudents);

// Assign RFID to student
router.post("/assign-rfid", studentController.assignRFID);

// Log attendance for student
router.post("/log-attendance", studentController.logAttendance);

// ✅ Get unique class names
router.get("/classes", async (req, res) => {
  try {
    const classes = await Student.distinct("className");
    res.json(classes);
  } catch (err) {
    console.error("❌ Error fetching classes:", err);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

module.exports = router;
