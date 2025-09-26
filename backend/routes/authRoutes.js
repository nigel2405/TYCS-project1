const express = require("express");
const router = express.Router();
const { login, register, forgotPassword, resetPassword, getProfile, updateProfile } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

// router.post("/register", register);
// router.post("/login", login);

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
