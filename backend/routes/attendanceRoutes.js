const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

// Get overall attendance rate
router.get("/rate", attendanceController.getAttendanceRate);

module.exports = router;
