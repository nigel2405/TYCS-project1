// backend/routes/testRoutes.js
const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");

// Simulate marking attendance (for testing without RFID)
router.post("/simulate-attendance", async (req, res) => {
  try {
    const { studentId, date } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    const attendance = new Attendance({
      student: studentId,
      date: date || new Date(),
      status: "present",
    });

    await attendance.save();
    res.json({ message: "Attendance simulated successfully ✅", attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// Seed demo students with RFID and 60 days attendance
router.post("/seed-demo", async (req, res) => {
  try {
    const { numStudents = 10, classNames, emailPrefix = "" } = req.body || {};

    // Use provided classes or fallback to the ones used in Register page
    const defaultClasses = [
      "FYBSc CS", "SYBSc CS", "TYBSc CS",
      "FYBAF", "SYBAF", "TYBAF",
      "FYBMS", "SYBMS", "TYBMS",
      "FYBSc IT", "SYBSc IT", "TYBSc IT",
      "FYBSc", "SYBSc", "TYBSc",
      "FYBA", "SYBA", "TYBA",
      "FYBCom", "SYBCom", "TYBCom",
    ];
    const classesList = Array.isArray(classNames) && classNames.length > 0 ? classNames : defaultClasses;

    const created = [];
    for (let i = 0; i < numStudents; i++) {
      const name = `Student ${i + 1}`;
      const email = `${emailPrefix}student${i + 1}_${Date.now()}@example.com`;
      const password = await bcrypt.hash("password123", 10);

      // Skip if user already exists
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ name, email, password, role: "student" });
      }
      const rfidTag = `RFID-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      // Determine class by round-robin
      const className = classesList[i % classesList.length];
      let student = await Student.findOne({ userId: user._id });
      if (!student) {
        student = await Student.create({ userId: user._id, rfidTag, className });
      } else {
        // update RFID/class if already existed
        student.rfidTag = rfidTag;
        student.className = className;
        await student.save();
      }

      // Generate last 60 days attendance with 85% present
      const today = new Date();
      const records = [];
      for (let d = 0; d < 60; d++) {
        const day = new Date(today);
        day.setDate(today.getDate() - d);
        // Skip weekends (optional)
        const weekday = day.getDay();
        if (weekday === 0 || weekday === 6) continue;

        const present = Math.random() < 0.85;
        records.push({ student: student._id, date: day, status: present ? "present" : "absent" });
      }
      if (records.length) {
        await Attendance.insertMany(records);
      }
      created.push({ user, student });
    }

    res.json({ message: "Seeded demo students and attendance", count: created.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Seed all classes with N students each
router.post("/seed-all-classes", async (req, res) => {
  try {
    const { perClass = 30, classNames, emailPrefix = "bulk_" } = req.body || {};

    const defaultClasses = [
      "FYBSc CS", "SYBSc CS", "TYBSc CS",
      "FYBAF", "SYBAF", "TYBAF",
      "FYBMS", "SYBMS", "TYBMS",
      "FYBSc IT", "SYBSc IT", "TYBSc IT",
      "FYBSc", "SYBSc", "TYBSc",
      "FYBA", "SYBA", "TYBA",
      "FYBCom", "SYBCom", "TYBCom",
    ];
    const classesList = Array.isArray(classNames) && classNames.length > 0 ? classNames : defaultClasses;

    let totalCreated = 0;
    for (const cls of classesList) {
      for (let i = 0; i < perClass; i++) {
        const stamp = Date.now().toString(36);
        const email = `${emailPrefix}${cls.replace(/\s+/g, '_').toLowerCase()}_${i + 1}_${stamp}@example.com`;
        const password = await bcrypt.hash("password123", 10);

        const user = await User.create({ name: `${cls} Student ${i + 1}`, email, password, role: "student" });
        const rfidTag = `RFID-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
        const student = await Student.create({ userId: user._id, rfidTag, className: cls });

        // last ~60 weekdays attendance, 85% present
        const today = new Date();
        const records = [];
        for (let d = 0; d < 60; d++) {
          const day = new Date(today);
          day.setDate(today.getDate() - d);
          const weekday = day.getDay();
          if (weekday === 0 || weekday === 6) continue;
          const present = Math.random() < 0.85;
          records.push({ student: student._id, date: day, status: present ? "present" : "absent" });
        }
        if (records.length) await Attendance.insertMany(records);
        totalCreated++;
      }
    }

    res.json({ message: "Seeded all classes", classes: classesList.length, perClass, totalCreated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
