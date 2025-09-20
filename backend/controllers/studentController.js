const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const UnassignedRFID = require("../models/UnassignedRFID");
const LeaveApplication = require("../models/LeaveApplication");

// ===============================
// Get all students (with optional class filter)
// ===============================
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

// ===============================
// Assign RFID card to student
// ===============================
exports.assignRFID = async (req, res) => {
  try {
    const { studentId, rfidTag } = req.body;

    if (!studentId || !rfidTag) {
      return res.status(400).json({ message: "Student ID and RFID tag are required" });
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      { rfidTag },
      { new: true }
    ).populate("userId", "name email");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

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

// ===============================
// Log attendance when RFID is scanned
// ===============================
exports.logAttendance = async (req, res) => {
  try {
    const { rfidTag } = req.body;
    console.log("📡 Incoming RFID:", rfidTag);

    if (!rfidTag) {
      return res.status(400).json({ message: "RFID tag is required" });
    }

    const student = await Student.findOne({ rfidTag }).populate("userId", "name email");

    if (!student) {
      console.warn(`⚠️ Unknown RFID scanned: ${rfidTag}`);

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

// ===============================
// Submit a leave application
// ===============================
exports.submitLeaveApplication = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const { date, reason, application } = req.body;
    if (!date || !reason || !application) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const leaveApp = new LeaveApplication({
      student: student._id,
      className: student.className, // ✅ always from DB
      date,
      reason,
      application,
    });

    await leaveApp.save();

    res.status(201).json({ message: "Leave application submitted", leaveApp });
  } catch (err) {
    console.error("❌ Error submitting leave:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// Get all leave applications of logged-in student
// ===============================
exports.getStudentLeaves = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const leaves = await LeaveApplication.find({ student: student._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error("❌ Error fetching student leaves:", err);
    res.status(500).json({ message: "Server error" });
  }
};
