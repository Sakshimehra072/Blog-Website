const express = require('express');
const router = express.Router();
const {
  sendOtpController,
  verifyOtpController,
  registerController,
  loginController,
  googleLoginController,
  getMeController,
  updateProfileController
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Mobile OTP Routes (Twilio)
router.post('/send-otp', sendOtpController);
router.post('/verify-otp', verifyOtpController);

// Manual Auth Routes
router.post('/register', registerController);
router.post('/login', loginController);

// Google Sign-In Route
router.post('/google', googleLoginController);

// Authenticated Profile Routes
router.get('/me', authMiddleware, getMeController);
router.put('/profile', authMiddleware, updateProfileController);

module.exports = router;
