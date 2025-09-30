const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const UnassignedRFID = require("../models/UnassignedRFID");
const LeaveApplication = require("../models/LeaveApplication");

// ===============================
// Get student dashboard data
// ===============================
exports.getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate("userId", "name email");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 1);

    // Get attendance records for current month
    const currentMonthRecords = await Attendance.find({
      student: student._id,
      date: { $gte: startOfMonth, $lt: endOfMonth }
    }).sort({ date: -1 });

    // Get all attendance records for calculating overall stats
    const allRecords = await Attendance.find({ student: student._id }).sort({ date: -1 }).limit(30);

    // Calculate statistics
    const totalDaysThisMonth = currentMonthRecords.length;
    const presentDaysThisMonth = currentMonthRecords.filter(record => record.status === "present").length;
    const attendanceRateThisMonth = totalDaysThisMonth > 0 ? (presentDaysThisMonth / totalDaysThisMonth) * 100 : 0;

    // Calculate overall stats from last 30 records
    const totalDaysOverall = allRecords.length;
    const presentDaysOverall = allRecords.filter(record => record.status === "present").length;
    const attendanceRateOverall = totalDaysOverall > 0 ? (presentDaysOverall / totalDaysOverall) * 100 : 0;

    // Determine alert status
    let alertStatus = "Good";
    let alertColor = "green";
    if (attendanceRateOverall < 75) {
      alertStatus = "Low Attendance";
      alertColor = "red";
    } else if (attendanceRateOverall < 85) {
      alertStatus = "Warning";
      alertColor = "yellow";
    }

    // Get recent attendance records (last 10)
    const recentAttendance = allRecords.slice(0, 10).map(record => ({
      _id: record._id,
      date: record.date,
      status: record.status,
      formattedDate: record.date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    }));

    res.json({
      student: {
        id: student._id,
        name: student.userId.name,
        email: student.userId.email,
        className: student.className,
        rfidTag: student.rfidTag
      },
      stats: {
        attendanceRate: Math.round(attendanceRateThisMonth),
        overallAttendanceRate: Math.round(attendanceRateOverall),
        presentDaysThisMonth,
        totalDaysThisMonth,
        presentDaysOverall,
        totalDaysOverall,
        alertStatus,
        alertColor
      },
      recentAttendance
    });
  } catch (error) {
    console.error("❌ Error fetching student dashboard:", error);
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
};

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
      date: new Date(),
      status: "present"
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
// Remove RFID assignment from student
// ===============================
exports.removeRFIDAssignment = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const student = await Student.findById(studentId).populate("userId", "name email");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.rfidTag) {
      return res.status(400).json({ message: "Student has no RFID assignment to remove" });
    }

    const rfidTag = student.rfidTag;

    // Remove RFID from student
    student.rfidTag = null;
    await student.save();

    // Add RFID back to unassigned list
    await UnassignedRFID.create({ uid: rfidTag });

    console.log(`✅ RFID [${rfidTag}] removed from student: ${student.userId?.name}`);

    res.json({
      message: "RFID assignment removed successfully",
      student: {
        id: student._id,
        name: student.userId?.name,
        email: student.userId?.email,
        className: student.className
      },
      removedRfidTag: rfidTag
    });
  } catch (error) {
    console.error("❌ Error removing RFID assignment:", error);
    res.status(500).json({ message: "Error removing RFID assignment", error });
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
