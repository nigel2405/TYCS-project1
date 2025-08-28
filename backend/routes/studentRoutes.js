const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// Get all students
router.get("/", studentController.getAllStudents);

// Assign RFID to student
router.post("/assign-rfid", studentController.assignRFID);

// Log attendance for student
router.post("/log-attendance", studentController.logAttendance);

module.exports = router;
