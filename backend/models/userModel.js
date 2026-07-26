const { pool } = require('../config/database');

// In-Memory Fallback Store (when MySQL local service isn't active)
const inMemoryUsers = [];
const inMemoryOtps = [];

// Find user by phone number
async function findUserByPhone(phoneNumber) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE phone_number = ?', [phoneNumber]);
    if (rows.length > 0) return rows[0];
  } catch (err) {
    // Fallback to in-memory store if DB query fails
  }
  return inMemoryUsers.find(u => u.phone_number === phoneNumber) || null;
}

// Find user by username
async function findUserByUsername(username) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) return rows[0];
  } catch (err) {
    // Fallback
  }
  return inMemoryUsers.find(u => u.username === username) || null;
}

// Find user by Google ID
async function findUserByGoogleId(googleId) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
    if (rows.length > 0) return rows[0];
  } catch (err) {
    // Fallback
  }
  return inMemoryUsers.find(u => u.google_id === googleId) || null;
}

// Create new user (Manual or OTP / Google)
async function createUser({ username, phone_number, password_hash = null, email = null, google_id = null, avatar_url = null, is_phone_verified = false }) {
  try {
    const [result] = await pool.query(
      `INSERT INTO users (username, phone_number, password_hash, email, google_id, avatar_url, is_phone_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, phone_number, password_hash, email, google_id, avatar_url, is_phone_verified]
    );
    return {
      id: result.insertId,
      username,
      phone_number,
      email,
      google_id,
      avatar_url,
      is_phone_verified
    };
  } catch (err) {
    // Fallback memory creation
    const newUser = {
      id: inMemoryUsers.length + 1,
      username: username || `user_${Date.now()}`,
      phone_number,
      password_hash,
      email,
      google_id,
      avatar_url,
      is_phone_verified,
      created_at: new Date()
    };
    inMemoryUsers.push(newUser);
    return newUser;
  }
}

// Save OTP record
async function saveOtp(phoneNumber, otpCode, expiresAt) {
  try {
    await pool.query(
      'INSERT INTO otp_codes (phone_number, otp_code, expires_at) VALUES (?, ?, ?)',
      [phoneNumber, otpCode, expiresAt]
    );
  } catch (err) {
    inMemoryOtps.push({
      phone_number: phoneNumber,
      otp_code: otpCode,
      expires_at: expiresAt,
      is_used: false
    });
  }
}

// Verify OTP record
async function verifyOtp(phoneNumber, otpCode) {
  const now = new Date();
  try {
    const [rows] = await pool.query(
      `SELECT * FROM otp_codes 
       WHERE phone_number = ? AND otp_code = ? AND is_used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [phoneNumber, otpCode]
    );
    if (rows.length > 0) {
      await pool.query('UPDATE otp_codes SET is_used = TRUE WHERE id = ?', [rows[0].id]);
      return true;
    }
  } catch (err) {
    // Fallback
    const recordIndex = inMemoryOtps.findIndex(
      o => o.phone_number === phoneNumber && o.otp_code === otpCode && !o.is_used && new Date(o.expires_at) > now
    );
    if (recordIndex !== -1) {
      inMemoryOtps[recordIndex].is_used = true;
      return true;
    }
  }
  return false;
}

module.exports = {
  findUserByPhone,
  findUserByUsername,
  findUserByGoogleId,
  createUser,
  saveOtp,
  verifyOtp
};
