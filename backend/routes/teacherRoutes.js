const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");
const Student = require("../models/Student");
const { protect, isTeacher } = require("../middlewares/authMiddleware");
const teacherController = require("../controllers/teacherController");
const Attendance = require("../models/Attendance");

// Get all leave applications for teacher's class
router.get("/leaves", protect, isTeacher, teacherController.getClassLeaves);

// Approve or reject a leave
router.put("/leave/:id", protect, isTeacher, teacherController.updateLeaveStatus);

// Get blacklist data (students with <75% attendance)
router.get("/blacklist", protect, isTeacher, teacherController.getBlacklistData);

// Send attendance notification email
router.post("/send-attendance-notification", protect, isTeacher, teacherController.sendAttendanceNotification);

// Send bulk notifications to all students with low attendance
router.post("/send-bulk-notifications", protect, isTeacher, teacherController.sendBulkNotifications);

// Get email history
router.get("/email-history", protect, isTeacher, teacherController.getEmailHistory);

// Generate attendance report
router.get("/attendance-report", protect, isTeacher, teacherController.generateAttendanceReport);


// GET classes assigned to the logged-in teacher with their students
router.get("/my-classes", protect, isTeacher, async (req, res) => {
  try {
    // 1️⃣ Find classes assigned to this teacher
    const assignments = await Assignment.find({ teacherId: req.user._id });

    // 2️⃣ Fetch students for each assigned class by querying Student and populating User fields
    const classesWithStudents = await Promise.all(
      assignments.map(async (a) => {
        const students = await Student.find({ className: a.className })
          .populate({
            path: "userId",
            select: "name email rfid", // select user details fields needed
          })
          .exec();

        return {
          className: a.className,
          students,
        };
      })
    );

    res.json(classesWithStudents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Class attendance summary for a month for classes assigned to logged-in teacher
router.get("/class-attendance", protect, isTeacher, async (req, res) => {
  try {
    const { month, year, className } = req.query;
    const now = new Date();
    const m = month ? parseInt(month, 10) - 1 : now.getMonth();
    const y = year ? parseInt(year, 10) : now.getFullYear();

    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 1);

    const assignments = await Assignment.find({ teacherId: req.user._id });
    let classNames = assignments.map((a) => a.className);
    if (className) classNames = classNames.filter((c) => c === className);

    const students = await Student.find({ className: { $in: classNames } });
    const studentIds = students.map((s) => s._id);

    const records = await Attendance.find({
      student: { $in: studentIds },
      date: { $gte: start, $lt: end },
    })
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
      .lean();

    // Build summary by student
    const byStudent = {};
    for (const r of records) {
      const id = r.student._id.toString();
      if (!byStudent[id]) byStudent[id] = { student: r.student, total: 0, present: 0 };
      byStudent[id].total += 1;
      if (r.status === 'present') byStudent[id].present += 1;
    }

    const summary = Object.values(byStudent).map((s) => ({
      student: s.student,
      totalDays: s.total,
      presentDays: s.present,
      rate: s.total ? s.present / s.total : 0,
    }));

    res.json({ month: m + 1, year: y, classNames, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Per-student daily records for a class in a month
router.get("/class-attendance/details", protect, isTeacher, async (req, res) => {
  try {
    const { month, year, className } = req.query;
    if (!className) return res.status(400).json({ message: 'className is required' });

    const now = new Date();
    const m = month ? parseInt(month, 10) - 1 : now.getMonth();
    const y = year ? parseInt(year, 10) : now.getFullYear();

    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 1);

    // Ensure teacher owns this class
    const assignments = await Assignment.find({ teacherId: req.user._id, className });
    if (assignments.length === 0) return res.status(403).json({ message: 'Not assigned to this class' });

    const students = await Student.find({ className })
      .populate({ path: 'userId', select: 'name email' })
      .lean();
    const studentIds = students.map(s => s._id);

    const records = await Attendance.find({ student: { $in: studentIds }, date: { $gte: start, $lt: end } })
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
      .sort({ date: 1 })
      .lean();

    res.json({ month: m + 1, year: y, className, students, records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get daily attendance for a specific date and class
router.get("/class-attendance/daily", protect, isTeacher, async (req, res) => {
  try {
    const { date, className } = req.query;
    if (!className || !date) {
      return res.status(400).json({ message: 'className and date are required' });
    }

    // Ensure teacher owns this class
    const assignments = await Assignment.find({ teacherId: req.user._id, className });
    if (assignments.length === 0) {
      return res.status(403).json({ message: 'Not assigned to this class' });
    }

    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);

    const students = await Student.find({ className })
      .populate({ path: 'userId', select: 'name email' })
      .lean();
    const studentIds = students.map(s => s._id);

    const records = await Attendance.find({ 
      student: { $in: studentIds }, 
      date: { $gte: startOfDay, $lt: endOfDay } 
    })
      .populate({ path: 'student', populate: { path: 'userId', select: 'name email' } })
      .sort({ 'student.userId.name': 1 })
      .lean();

    res.json({ date, className, records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
