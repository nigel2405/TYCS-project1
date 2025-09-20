const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");
const Student = require("../models/Student");
const { protect, isTeacher } = require("../middlewares/authMiddleware");
const teacherController = require("../controllers/teacherController");

// Get all leave applications for teacher's class
router.get("/leaves", protect, isTeacher, teacherController.getClassLeaves);

// Approve or reject a leave
router.put("/leave/:id", protect, isTeacher, teacherController.updateLeaveStatus);


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

module.exports = router;
