// backend/controllers/teacherController.js
const Teacher = require("../models/Teacher");
const User = require("../models/User");

// Get a teacher profile
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

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate("userId", "name email role");
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching teachers" });
  }
};

// Update teacher
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
