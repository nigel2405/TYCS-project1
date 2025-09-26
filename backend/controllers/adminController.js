const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const UnassignedRFID = require("../models/UnassignedRFID");

// ======================
// Admin Dashboard
// ======================
exports.getDashboard = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const unassignedCount = await UnassignedRFID.countDocuments();
    const assignedRFIDs = await Student.countDocuments({ rfidTag: { $ne: null } });

    res.json({
      message: "Admin Dashboard",
      stats: {
        students: totalStudents,
        teachers: totalTeachers,
        unassignedRFIDs: unassignedCount,
        assignedRFIDs: assignedRFIDs,
      },
    });
  } catch (error) {
    console.error("❌ Error loading dashboard:", error);
    res.status(500).json({ message: "Error loading dashboard", error });
  }
};

// ======================
// Fetch all unassigned RFIDs
// ======================
exports.getUnassignedRFIDs = async (req, res) => {
  try {
    const rfids = await UnassignedRFID.find();
    res.json(rfids);
  } catch (error) {
    console.error("❌ Error fetching unassigned RFIDs:", error);
    res.status(500).json({ message: "Error fetching unassigned RFIDs", error });
  }
};

// ======================
// Assign RFID to a Student
// ======================
exports.assignRFIDToStudent = async (req, res) => {
  try {
    const { studentId, rfid } = req.body;

    if (!studentId || !rfid) {
      return res
        .status(400)
        .json({ message: "Student ID and RFID are required" });
    }

    // Link RFID to Student
    const student = await Student.findByIdAndUpdate(
      studentId,
      { rfid },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Remove from Unassigned list
    await UnassignedRFID.findOneAndDelete({ rfid });

    res.json({ message: "RFID assigned successfully", student });
  } catch (error) {
    console.error("❌ Error assigning RFID:", error);
    res.status(500).json({ message: "Error assigning RFID", error });
  }
};
