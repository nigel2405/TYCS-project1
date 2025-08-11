const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/studentController");
const { protect, isStudent } = require("../middlewares/authMiddleware");

router.get("/dashboard", protect, isStudent, getDashboard);

module.exports = router;
