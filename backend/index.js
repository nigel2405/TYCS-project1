// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const rfidRoutes = require("./routes/rfidRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const classAssignmentsRoutes = require("./routes/classAssignments");

const app = express();

// Allow all origins (for testing) or whitelist ESP32 IP later
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Connection Error:", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/rfid", rfidRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/class-assignments", classAssignmentsRoutes);


// IoT device endpoint (ESP32 will call this)
app.post("/api/iot/attendance", async (req, res) => {
  try {
    const { uid } = req.body; // UID from ESP32 RFID
    if (!uid) {
      return res.status(400).json({ error: "UID is required" });
    }

    console.log(`📡 Received UID from ESP32: ${uid}`);
    res.json({ success: true, message: "Attendance recorded", uid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
