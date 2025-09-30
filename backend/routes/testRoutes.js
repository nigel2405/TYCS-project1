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

// Seed a student with low attendance and real Gmail for testing notifications
router.post("/seed-low-attendance-student", async (req, res) => {
  try {
    const { 
      name = "John Poor Attendance", 
      email = "nigelshivalkar7@gmail.com", // Use your working Gmail here
      className = "FYBSc CS",
      attendanceRate = 0.45 // 45% attendance (below 75% threshold)
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      // If user exists, find the student and update attendance
      let student = await Student.findOne({ userId: user._id });
      if (student) {
        // Clear existing attendance records for this student
        await Attendance.deleteMany({ student: student._id });
      } else {
        // Create student record if doesn't exist
        const rfidTag = `RFID-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
        student = await Student.create({ 
          userId: user._id, 
          rfidTag, 
          className 
        });
      }

      // Generate attendance records with specified low rate
      const today = new Date();
      const records = [];
      const totalDays = 40; // Total school days in last 2 months
      const presentDays = Math.floor(totalDays * attendanceRate);

      for (let d = 0; d < totalDays; d++) {
        const day = new Date(today);
        day.setDate(today.getDate() - d);
        
        // Skip weekends
        const weekday = day.getDay();
        if (weekday === 0 || weekday === 6) {
          continue;
        }

        // Make first 'presentDays' as present, rest as absent
        const isPresent = d < presentDays;
        records.push({ 
          student: student._id, 
          date: day, 
          status: isPresent ? "present" : "absent" 
        });
      }

      if (records.length) {
        await Attendance.insertMany(records);
      }

      const actualPresentDays = records.filter(r => r.status === 'present').length;
      const actualRate = Math.round((actualPresentDays / records.length) * 100);

      return res.json({ 
        message: "Updated existing user with low attendance", 
        user: { 
          name: user.name, 
          email: user.email 
        },
        student: {
          className: student.className,
          rfidTag: student.rfidTag
        },
        attendance: {
          presentDays: actualPresentDays,
          totalDays: records.length,
          attendanceRate: `${actualRate}%`
        }
      });
    }

    // Create new user if doesn't exist
    const password = await bcrypt.hash("password123", 10);
    user = await User.create({ name, email, password, role: "student" });
    
    const rfidTag = `RFID-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const student = await Student.create({ 
      userId: user._id, 
      rfidTag, 
      className 
    });

    // Generate attendance records with low attendance rate
    const today = new Date();
    const records = [];
    const totalDays = 40; // Total school days in last 2 months
    const presentDays = Math.floor(totalDays * attendanceRate);

    for (let d = 0; d < totalDays; d++) {
      const day = new Date(today);
      day.setDate(today.getDate() - d);
      
      // Skip weekends
      const weekday = day.getDay();
      if (weekday === 0 || weekday === 6) {
        continue;
      }

      // Make first 'presentDays' as present, rest as absent to ensure low attendance
      const isPresent = d < presentDays;
      records.push({ 
        student: student._id, 
        date: day, 
        status: isPresent ? "present" : "absent" 
      });
    }

    if (records.length) {
      await Attendance.insertMany(records);
    }

    const actualPresentDays = records.filter(r => r.status === 'present').length;
    const actualRate = Math.round((actualPresentDays / records.length) * 100);

    res.json({ 
      message: "Created student with low attendance successfully ✅", 
      user: { 
        name: user.name, 
        email: user.email,
        password: "password123" // For testing login
      },
      student: {
        className: student.className,
        rfidTag: student.rfidTag
      },
      attendance: {
        presentDays: actualPresentDays,
        totalDays: records.length,
        attendanceRate: `${actualRate}%`
      },
      instructions: [
        "1. This student will appear in the teacher's blacklist",
        "2. You can test sending email notifications to this Gmail address",
        "3. Login credentials: email & password123"
      ]
    });
  } catch (err) {
    console.error("❌ Error creating low attendance student:", err);
    res.status(500).json({ error: err.message });
  }
});

// Seed multiple students with low attendance and real Gmail for testing blacklist
router.post("/seed-blacklist-students", async (req, res) => {
  try {
    const studentsData = [
      {
        name: "Alice Poor Student",
        email: "nigelshivalkar7+alice@gmail.com", // Using Gmail + alias
        className: "FYBSc CS",
        attendanceRate: 0.65 // 65% attendance
      },
      {
        name: "Bob Absent Student", 
        email: "nigelshivalkar7+bob@gmail.com",
        className: "FYBSc CS",
        attendanceRate: 0.55 // 55% attendance
      },
      {
        name: "Charlie Late Student",
        email: "nigelshivalkar7+charlie@gmail.com", 
        className: "SYBSc CS",
        attendanceRate: 0.45 // 45% attendance
      },
      {
        name: "Diana Skip Student",
        email: "nigelshivalkar7+diana@gmail.com",
        className: "SYBSc CS", 
        attendanceRate: 0.30 // 30% attendance
      },
      {
        name: "Eve Truant Student",
        email: "nigelshivalkar7+eve@gmail.com",
        className: "TYBSc CS",
        attendanceRate: 0.25 // 25% attendance
      }
    ];

    const createdStudents = [];
    
    for (const studentData of studentsData) {
      const { name, email, className, attendanceRate } = studentData;
      
      // Check if user already exists
      let user = await User.findOne({ email });
      let student;
      
      if (user) {
        // Clear existing attendance for clean test
        student = await Student.findOne({ userId: user._id });
        if (student) {
          await Attendance.deleteMany({ student: student._id });
        } else {
          // Create student record if doesn't exist
          const rfidTag = `RFID-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
          student = await Student.create({ 
            userId: user._id, 
            rfidTag, 
            className 
          });
        }
      } else {
        // Create new user
        const password = await bcrypt.hash("password123", 10);
        user = await User.create({ name, email, password, role: "student" });
        
        // Create student with RFID
        const rfidTag = `RFID-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
        student = await Student.create({ 
          userId: user._id, 
          rfidTag, 
          className 
        });
      }
      
      // Ensure we have the student record
      if (!student) {
        student = await Student.findOne({ userId: user._id });
      }
      
      // Generate attendance records with specified low rate
      const today = new Date();
      const records = [];
      const totalDays = 50; // Total school days in last 2 months
      const presentDays = Math.floor(totalDays * attendanceRate);
      
      // Create varied attendance pattern (not just first N days)
      const attendancePattern = [];
      for (let i = 0; i < totalDays; i++) {
        attendancePattern.push(i < presentDays);
      }
      // Shuffle the pattern for more realistic distribution
      for (let i = attendancePattern.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [attendancePattern[i], attendancePattern[j]] = [attendancePattern[j], attendancePattern[i]];
      }

      for (let d = 0; d < totalDays; d++) {
        const day = new Date(today);
        day.setDate(today.getDate() - d);
        
        // Skip weekends
        const weekday = day.getDay();
        if (weekday === 0 || weekday === 6) {
          continue;
        }

        const isPresent = attendancePattern[d % attendancePattern.length];
        records.push({ 
          student: student._id, 
          date: day, 
          status: isPresent ? "present" : "absent" 
        });
      }

      if (records.length) {
        await Attendance.insertMany(records);
      }

      const actualPresentDays = records.filter(r => r.status === 'present').length;
      const actualRate = Math.round((actualPresentDays / records.length) * 100);

      createdStudents.push({
        name: user.name,
        email: user.email,
        className: student.className,
        rfidTag: student.rfidTag,
        attendance: {
          presentDays: actualPresentDays,
          totalDays: records.length,
          attendanceRate: `${actualRate}%`
        }
      });
    }
    
    res.json({ 
      message: "Created students with low attendance for blacklist testing ✅", 
      studentsCreated: createdStudents.length,
      students: createdStudents,
      instructions: [
        "1. All students will appear in the teacher's blacklist",
        "2. Each student has a unique Gmail alias for testing notifications",
        "3. Students are distributed across FYBSc CS, SYBSc CS, and TYBSc CS classes",
        "4. Attendance rates range from 25% to 65% (all below 75% threshold)",
        "5. All notifications will be delivered to nigelshivalkar7@gmail.com",
        "6. Login credentials for all: email & password123"
      ]
    });
  } catch (err) {
    console.error("❌ Error creating blacklist test students:", err);
    res.status(500).json({ error: err.message });
  }
});
