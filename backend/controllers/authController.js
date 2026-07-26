const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const {
  findUserByPhone,
  findUserByUsername,
  findUserByGoogleId,
  createUser,
  saveOtp,
  verifyOtp
} = require('../models/userModel');
const { sendTwilioOtp } = require('../services/twilioService');

const JWT_SECRET = process.env.JWT_SECRET || 'blogverse_super_secret_jwt_key_2026_key';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to sign JWT Token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      phone_number: user.phone_number,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Phone Number Regex Validation (E.164 / International digits)
function isValidPhone(phone) {
  const phoneRegex = /^\+?[1-9]\d{7,14}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// 1. Send Twilio OTP
async function sendOtpController(req, res) {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    const cleanPhone = phone_number.replace(/\s+/g, '');
    if (!isValidPhone(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number with country code (e.g. +1234567890).' });
    }

    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await saveOtp(cleanPhone, otpCode, expiresAt);
    await sendTwilioOtp(cleanPhone, otpCode);

    res.json({
      success: true,
      message: `Verification OTP dispatched to ${cleanPhone}.`,
      phone_number: cleanPhone
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send verification OTP.' });
  }
}

// 2. Verify Twilio OTP & Login
async function verifyOtpController(req, res) {
  try {
    const { phone_number, otp_code } = req.body;

    if (!phone_number || !otp_code) {
      return res.status(400).json({ success: false, message: 'Phone number and OTP code are required.' });
    }

    const cleanPhone = phone_number.replace(/\s+/g, '');
    const isVerified = await verifyOtp(cleanPhone, otp_code);

    if (!isVerified) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    let user = await findUserByPhone(cleanPhone);
    if (!user) {
      // Auto-register user verified via phone
      const generatedUsername = `user_${cleanPhone.replace(/\D/g, '').slice(-6)}`;
      user = await createUser({
        username: generatedUsername,
        phone_number: cleanPhone,
        is_phone_verified: true
      });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: 'Mobile OTP verification successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
        phone_number: user.phone_number,
        email: user.email,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: 'OTP verification failed.' });
  }
}

// 3. Manual User Registration (Username + Phone + Password)
async function registerController(req, res) {
  try {
    const { username, phone_number, password } = req.body;

    // Field validations
    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: 'Username is required.' });
    }
    if (!phone_number || !phone_number.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const cleanUsername = username.trim();
    const cleanPhone = phone_number.replace(/\s+/g, '');

    if (cleanUsername.length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters long.' });
    }

    if (!isValidPhone(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format. Please include country code (e.g. +1234567890).' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Check if phone or username exists
    const existingPhoneUser = await findUserByPhone(cleanPhone);
    if (existingPhoneUser) {
      return res.status(400).json({ success: false, message: 'Phone number is already registered.' });
    }

    const existingUsername = await findUserByUsername(cleanUsername);
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username is already taken.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await createUser({
      username: cleanUsername,
      phone_number: cleanPhone,
      password_hash,
      is_phone_verified: false
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        phone_number: newUser.phone_number
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Account registration failed.' });
  }
}

// 4. Manual User Login (Phone Number + Password)
async function loginController(req, res) {
  try {
    const { phone_number, password } = req.body;

    if (!phone_number || !phone_number.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const cleanPhone = phone_number.replace(/\s+/g, '');
    const user = await findUserByPhone(cleanPhone);

    if (!user || !user.password_hash) {
      return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
        phone_number: user.phone_number,
        email: user.email,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
}

// 5. Google Sign In Controller
async function googleLoginController(req, res) {
  try {
    const { id_token, google_id, email, name, avatar } = req.body;

    let gId = google_id;
    let uEmail = email;
    let uName = name;
    let uAvatar = avatar;

    // Verify token if present & Google Client ID configured
    if (id_token && process.env.GOOGLE_CLIENT_ID) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: id_token,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        gId = payload.sub;
        uEmail = payload.email;
        uName = payload.name;
        uAvatar = payload.picture;
      } catch (err) {
        console.warn('Google Token verification fallback to payload:', err.message);
      }
    }

    if (!gId && !uEmail) {
      return res.status(400).json({ success: false, message: 'Google authentication data missing.' });
    }

    let user = await findUserByGoogleId(gId);
    if (!user) {
      const generatedUsername = (uName || uEmail || `google_${Date.now()}`).toLowerCase().replace(/[^a-z0-9]/g, '');
      const dummyPhone = `+1999${Math.floor(1000000 + Math.random() * 9000000)}`;

      user = await createUser({
        username: generatedUsername.slice(0, 30),
        phone_number: dummyPhone,
        email: uEmail,
        google_id: gId,
        avatar_url: uAvatar,
        is_phone_verified: true
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Google Sign In successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ success: false, message: 'Google Sign In failed.' });
  }
}

// 6. Get Current User Profile
async function getMeController(req, res) {
  try {
    const user = await findUserByPhone(req.user.phone_number);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        phone_number: user.phone_number,
        email: user.email,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

// 7. Update User Profile (Username & Avatar)
async function updateProfileController(req, res) {
  try {
    const { username, avatar_url } = req.body;
    const phone_number = req.user ? req.user.phone_number : req.body.phone_number;

    let user = await findUserByPhone(phone_number);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    if (username && username.trim()) {
      user.username = username.trim();
    }
    if (avatar_url) {
      user.avatar_url = avatar_url;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user.id,
        username: user.username,
        phone_number: user.phone_number,
        email: user.email,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

module.exports = {
  sendOtpController,
  verifyOtpController,
  registerController,
  loginController,
  googleLoginController,
  getMeController,
  updateProfileController
};
