const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const {
  findUserByEmail,
  findUserByEmailOrName,
  findUserById,
  findUserByGoogleId,
  createUser,
  updateUserProfile
} = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'blogverse_super_secret_jwt_key_2026_key';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to sign JWT Token
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name || user.username,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Email Regex Validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// 1. User Registration (Full Name + Email Address + Password stored in MySQL)
async function registerController(req, res) {
  try {
    const { name, email, password } = req.body;

    // Field Validations
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      return res.status(400).json({ success: false, message: 'Full name must be at least 2 characters long.' });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Check if email already exists
    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'This email address is already registered. Please sign in.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await createUser({
      name: cleanName,
      email: cleanEmail,
      password_hash
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.name,
        email: newUser.email,
        avatar_url: newUser.avatar_url || null
      }
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Account registration failed.' });
  }
}

// 2. User Sign In (Name or Email + Password)
async function loginController(req, res) {
  try {
    const { email, name, identifier, password } = req.body;
    const userIdentifier = (identifier || email || name || '').trim();

    if (!userIdentifier) {
      return res.status(400).json({ success: false, message: 'Name or Email address is required.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const user = await findUserByEmailOrName(userIdentifier);
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this Name or Email address.' });
    }

    if (!user.password_hash) {
      return res.status(401).json({ success: false, message: 'This account was created via Google. Please sign in using Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please verify your password and try again.' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Sign in successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.name,
        email: user.email,
        avatar_url: user.avatar_url || null
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Sign in failed.' });
  }
}

// 3. Google Sign In Controller
async function googleLoginController(req, res) {
  try {
    const { id_token, google_id, email, name, avatar } = req.body;

    let gId = google_id;
    let uEmail = email;
    let uName = name;
    let uAvatar = avatar;

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

    let user = await findUserByGoogleId(gId) || await findUserByEmail(uEmail);
    if (!user) {
      user = await createUser({
        name: uName || 'Google User',
        email: uEmail,
        google_id: gId,
        avatar_url: uAvatar
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Google Sign In successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.name,
        email: user.email,
        avatar_url: user.avatar_url || null
      }
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ success: false, message: 'Google Sign In failed.' });
  }
}

// 4. Get Current User Profile
async function getMeController(req, res) {
  try {
    const user = await findUserById(req.user.id) || await findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.name,
        email: user.email,
        avatar_url: user.avatar_url || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

// 5. Update User Profile (Name & Avatar)
async function updateProfileController(req, res) {
  try {
    const { name, username, avatar_url } = req.body;
    const userId = req.user ? req.user.id : req.body.id;

    const newName = name || username;

    const updatedUser = await updateUserProfile(userId, { name: newName, avatar_url });

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.name,
        email: updatedUser.email,
        avatar_url: updatedUser.avatar_url || null
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

module.exports = {
  registerController,
  loginController,
  googleLoginController,
  getMeController,
  updateProfileController
};
