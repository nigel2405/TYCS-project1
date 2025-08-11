const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/teacherController");
const { protect, isTeacher } = require("../middlewares/authMiddleware");

router.get("/dashboard", protect, isTeacher, getDashboard);

module.exports = router;
