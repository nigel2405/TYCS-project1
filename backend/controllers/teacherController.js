const Teacher = require("../models/Teacher");
const User = require("../models/User");
const LeaveApplication = require("../models/LeaveApplication");
const Student = require("../models/Student");
const Assignment = require("../models/Assignment"); // ✅ missing import

// ===============================
// Get a teacher profile
// ===============================
exports.getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.params.id })
      .populate("userId", "name email role")
      .lean();

    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    res.json({
      name: teacher.userId.name,
      email: teacher.userId.email,
      role: teacher.userId.role,
      assignedClasses: teacher.assignedClasses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching teacher profile" });
  }
};

// ===============================
// Get all teachers
// ===============================
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate("userId", "name email role");
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching teachers" });
  }
};

// ===============================
// Update teacher
// ===============================
exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOneAndUpdate(
      { userId: req.params.id },
      req.body,
      { new: true }
    ).populate("userId", "name email role");

    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: "Error updating teacher" });
  }
};

// ===============================
// Get all leave applications of teacher's classes
// ===============================
exports.getClassLeaves = async (req, res) => {
  try {
    // 1️⃣ Find all classes assigned to this teacher
    const assignments = await Assignment.find({ teacherId: req.user._id });
    const classNames = assignments.map((a) => a.className);

    if (classNames.length === 0) {
      return res.json([]); // teacher has no assigned classes
    }

    // 2️⃣ Find all students in those classes
    const students = await Student.find({ className: { $in: classNames } });
    const studentIds = students.map((s) => s._id);

    // 3️⃣ Fetch leave applications for those students
    const leaves = await LeaveApplication.find({ student: { $in: studentIds } })
      .populate({
        path: "student",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (err) {
    console.error("❌ Error fetching class leaves:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// Approve / Reject leave
// ===============================
exports.updateLeaveStatus = async (req, res) => {
  try {
    const leave = await LeaveApplication.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    leave.status = req.body.status;
    await leave.save();

    res.json({ message: "Leave status updated", leave });
  } catch (err) {
    console.error("❌ Error updating leave status:", err);
    res.status(500).json({ message: "Server error" });
  }
};
