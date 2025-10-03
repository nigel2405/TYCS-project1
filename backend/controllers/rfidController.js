const Student = require("../models/Student");
const UnassignedRFID = require("../models/UnassignedRFID");

// ================================
// Get all unassigned RFID cards
// ================================
exports.getUnassignedRFIDs = async (req, res) => {
  try {
    const rfids = await UnassignedRFID.find().sort({ scannedAt: -1 });
    res.json(rfids);
  } catch (error) {
    console.error("❌ Error fetching unassigned RFIDs:", error);
    res.status(500).json({ message: "Error fetching unassigned RFIDs", error });
  }
};

// ================================
// Assign RFID card to a student
// ================================
exports.assignRFID = async (req, res) => {
  try {
    const { studentId, uid } = req.body;

    if (!studentId || !uid) {
      return res.status(400).json({ message: "Student ID and RFID UID are required" });
    }

    // Assign RFID to student
    const student = await Student.findByIdAndUpdate(
      studentId,
      { rfidTag: uid }, // store it inside student
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Remove from unassigned list if exists
    await UnassignedRFID.findOneAndDelete({ uid });

    res.json({ message: "✅ RFID assigned successfully", student });
  } catch (error) {
    console.error("❌ Error assigning RFID:", error);
    res.status(500).json({ message: "Error assigning RFID", error });
  }
};

// ================================
// Handle RFID scan from IoT device
// ================================
exports.scanRFID = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ message: "RFID UID is required" });
    }

    // Check if RFID is already assigned to a student
    const student = await Student.findOne({ rfidTag: uid });
    
    if (student) {
      // Log attendance for the student
      // You would implement attendance logging here
      return res.json({ 
        message: "✅ Student found", 
        student: {
          id: student._id,
          name: student.userId.name,
          className: student.className
        },
        uid 
      });
    }

    // Check if RFID is already in unassigned list
    let rfidEntry = await UnassignedRFID.findOne({ uid });
    
    if (!rfidEntry) {
      // Add to unassigned list
      rfidEntry = new UnassignedRFID({ uid });
      await rfidEntry.save();
    } else {
      // Update scannedAt timestamp
      rfidEntry.scannedAt = new Date();
      await rfidEntry.save();
    }

    res.json({ 
      message: "✅ New RFID scanned and recorded", 
      uid,
      isNew: !student 
    });
  } catch (error) {
    console.error("❌ Error scanning RFID:", error);
    res.status(500).json({ message: "Error scanning RFID", error });
  }
};