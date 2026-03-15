const express = require("express");

const {
  verifyStudent,
  sendOtp,
  verifyOtp,
  getProfile,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/verify-student", verifyStudent);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
