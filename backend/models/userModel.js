const { pool } = require('../config/database');

// In-Memory Fallback Store (when MySQL local service isn't active)
const inMemoryUsers = [];

// Find user by email address
async function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (rows.length > 0) return rows[0];
  } catch (err) {
    // Fallback to memory
  }
  return inMemoryUsers.find(u => u.email && u.email.toLowerCase() === cleanEmail) || null;
}

// Find user by Email OR Full Name (supports signing in with Name or Email)
async function findUserByEmailOrName(identifier) {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(name) = ?',
      [clean, clean]
    );
    if (rows.length > 0) return rows[0];
  } catch (err) {
    // Fallback to memory
  }
  return inMemoryUsers.find(
    u => (u.email && u.email.toLowerCase() === clean) || (u.name && u.name.toLowerCase() === clean)
  ) || null;
}

// Find user by ID
async function findUserById(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length > 0) return rows[0];
  } catch (err) {
    // Fallback
  }
  return inMemoryUsers.find(u => u.id === Number(id)) || null;
}

// Find user by Google ID
async function findUserByGoogleId(googleId) {
  if (!googleId) return null;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
    if (rows.length > 0) return rows[0];
  } catch (err) {
    // Fallback
  }
  return inMemoryUsers.find(u => u.google_id === googleId) || null;
}

// Create new user (Sign Up / Google Sign In - Stores name, email, password_hash in MySQL)
async function createUser({ name, email, password_hash = null, avatar_url = null, google_id = null }) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name ? name.trim() : 'User';

  try {
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, avatar_url, google_id)
       VALUES (?, ?, ?, ?, ?)`,
      [cleanName, cleanEmail, password_hash, avatar_url, google_id]
    );
    return {
      id: result.insertId,
      name: cleanName,
      username: cleanName, // alias for backwards compatibility
      email: cleanEmail,
      avatar_url,
      google_id
    };
  } catch (err) {
    // Fallback memory creation
    const newUser = {
      id: inMemoryUsers.length + 1,
      name: cleanName,
      username: cleanName,
      email: cleanEmail,
      password_hash,
      avatar_url,
      google_id,
      created_at: new Date()
    };
    inMemoryUsers.push(newUser);
    return newUser;
  }
}

// Update User Profile
async function updateUserProfile(id, { name, avatar_url }) {
  try {
    await pool.query(
      'UPDATE users SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
      [name, avatar_url, id]
    );
  } catch (err) {
    // Memory fallback update
    const user = inMemoryUsers.find(u => u.id === Number(id));
    if (user) {
      if (name) { user.name = name; user.username = name; }
      if (avatar_url) user.avatar_url = avatar_url;
    }
  }
  return await findUserById(id);
}

module.exports = {
  findUserByEmail,
  findUserByEmailOrName,
  findUserById,
  findUserByGoogleId,
  createUser,
  updateUserProfile
};
