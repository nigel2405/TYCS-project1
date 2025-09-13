const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const UnassignedRFID = require("../models/UnassignedRFID");

// ============================
// Get all students (with optional class filter)
// ============================
exports.getAllStudents = async (req, res) => {
  try {
    const { className } = req.query;
    const filter = className ? { className } : {};

    const students = await Student.find(filter).populate("userId", "name email role");

    res.json(students);
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    res.status(500).json({ message: "Error fetching students", error });
  }
};


// ============================
// Assign RFID card to student
// ============================
exports.assignRFID = async (req, res) => {
  try {
    const { studentId, rfidTag } = req.body;

    if (!studentId || !rfidTag) {
      return res.status(400).json({ message: "Student ID and RFID tag are required" });
    }

    // Update student with RFID card + populate user info
    const student = await Student.findByIdAndUpdate(
      studentId,
      { rfidTag },
      { new: true }
    ).populate("userId", "name email");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Remove from unassigned list (if it was there)
    await UnassignedRFID.findOneAndDelete({ uid: rfidTag });

    console.log(`✅ RFID [${rfidTag}] assigned to student: ${student.userId?.name}`);

    res.json({ 
      message: "RFID card assigned successfully", 
      student 
    });
  } catch (error) {
    console.error("❌ Error assigning RFID:", error);
    res.status(500).json({ message: "Error assigning RFID", error });
  }
};

// ====================================
// Log attendance when RFID is scanned
// ====================================
exports.logAttendance = async (req, res) => {
  try {
    const { rfidTag } = req.body;

    console.log("📡 Incoming RFID:", rfidTag);

    if (!rfidTag) {
      return res.status(400).json({ message: "RFID tag is required" });
    }

    // Find student with this RFID + populate
    const student = await Student.findOne({ rfidTag }).populate("userId", "name email");

    if (!student) {
      console.warn(`⚠️ Unknown RFID scanned: ${rfidTag}`);

      // Save into UnassignedRFID if not already stored
      let unassigned = await UnassignedRFID.findOne({ uid: rfidTag });
      if (!unassigned) {
        unassigned = await UnassignedRFID.create({ uid: rfidTag });
        console.log(`📝 Stored unassigned RFID: ${rfidTag}`);
      }

      return res.status(404).json({
        message: "RFID card not registered, stored for admin assignment",
        rfidTag
      });
    }

    // Log attendance
    const attendance = await Attendance.create({
      student: student._id,
      timestamp: new Date(),
      status: "Present"
    });

    console.log(`✅ Attendance logged for ${student.userId?.name} (RFID: ${rfidTag})`);

    res.json({
      message: "Attendance marked successfully",
      student: {
        id: student._id,
        name: student.userId?.name,
        email: student.userId?.email,
        rfidTag: student.rfidTag
      },
      attendance
    });
  } catch (error) {
    console.error("❌ Error logging attendance:", error);
    res.status(500).json({ message: "Error logging attendance", error });
  }
};
