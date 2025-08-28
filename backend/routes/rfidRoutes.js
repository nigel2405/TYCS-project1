const express = require("express");
const router = express.Router();
const rfidController = require("../controllers/rfidController");

// Get all unassigned RFIDs
router.get("/unassigned", rfidController.getUnassignedRFIDs);

// Assign RFID to student
router.post("/assign", rfidController.assignRFID);

module.exports = router;
