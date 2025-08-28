const express = require("express");
const router = express.Router();
const { 
  getDashboard, 
  getUnassignedRFIDs, 
  assignRFIDToStudent 
} = require("../controllers/adminController");

const { protect, isAdmin } = require("../middlewares/authMiddleware");

// Admin Dashboard
router.get("/dashboard", protect, isAdmin, getDashboard);

// Fetch all unassigned RFID tags (IoT scanned but not linked yet)
router.get("/unassigned-rfids", protect, isAdmin, getUnassignedRFIDs);

// Assign an RFID to a student
router.post("/assign-rfid", protect, isAdmin, assignRFIDToStudent);

module.exports = router;
