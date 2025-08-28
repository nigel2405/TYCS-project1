const Attendance = require("../models/Attendance");

exports.getAttendanceRate = async (req, res) => {
  try {
    const total = await Attendance.countDocuments();
    if (total === 0) return res.json({ rate: 0 });

    const present = await Attendance.countDocuments({ status: "Present" });
    const rate = present / total;

    res.json({ rate });
  } catch (error) {
    console.error("❌ Error calculating attendance rate:", error);
    res.status(500).json({ message: "Error calculating attendance rate" });
  }
};
