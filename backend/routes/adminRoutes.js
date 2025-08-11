const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/adminController");
const { protect, isAdmin } = require("../middlewares/authMiddleware");

router.get("/dashboard", protect, isAdmin, getDashboard);

module.exports = router;
