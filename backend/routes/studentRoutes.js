const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const Student = require("../models/Student"); // ✅ Import Student model
const { protect, isStudent } = require("../middlewares/authMiddleware");

// Get all students
router.get("/", studentController.getAllStudents);

// Get student dashboard data
router.get("/dashboard", protect, isStudent, studentController.getStudentDashboard);

// Assign RFID to student
router.post("/assign-rfid", studentController.assignRFID);

// Log attendance for student
router.post("/log-attendance", studentController.logAttendance);

// Submit leave application
router.post("/leave", protect, isStudent, studentController.submitLeaveApplication);

// Get all leaves of logged-in student
router.get("/leaves", protect, isStudent, studentController.getStudentLeaves);

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

// Remove RFID assignment from student
router.delete("/remove-rfid/:studentId", studentController.removeRFIDAssignment);

module.exports = router;
