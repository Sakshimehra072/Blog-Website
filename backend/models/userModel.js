const { pool } = require('../config/database');

// In-Memory Fallback Store (only used if MySQL server is offline)
const inMemoryUsers = [];

// Helper to format user object consistently
function formatUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.username || row.name || 'User',
    username: row.username || row.name || 'User',
    email: row.email,
    password_hash: row.password || row.password_hash,
    avatar_url: row.profile_image || row.avatar_url || null,
    google_id: row.google_id || null,
    created_at: row.created_at
  };
}

// 1. Find user by email address
async function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (rows.length > 0) return formatUserRow(rows[0]);
  } catch (err) {
    console.error('MySQL findUserByEmail error:', err.message);
  }
  const mem = inMemoryUsers.find(u => u.email && u.email.toLowerCase() === cleanEmail);
  return mem ? formatUserRow(mem) : null;
}

// 2. Find user by Email OR Full Name / Username
async function findUserByEmailOrName(identifier) {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  try {
    let rows;
    try {
      [rows] = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?',
        [clean, clean]
      );
    } catch (e) {
      [rows] = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(name) = ?',
        [clean, clean]
      );
    }
    if (rows && rows.length > 0) return formatUserRow(rows[0]);
  } catch (err) {
    console.error('MySQL findUserByEmailOrName error:', err.message);
  }
  const mem = inMemoryUsers.find(
    u => (u.email && u.email.toLowerCase() === clean) ||
         (u.name && u.name.toLowerCase() === clean) ||
         (u.username && u.username.toLowerCase() === clean)
  );
  return mem ? formatUserRow(mem) : null;
}

// 3. Find user by ID
async function findUserById(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length > 0) return formatUserRow(rows[0]);
  } catch (err) {
    console.error('MySQL findUserById error:', err.message);
  }
  const mem = inMemoryUsers.find(u => u.id === Number(id));
  return mem ? formatUserRow(mem) : null;
}

// 4. Find user by Google ID
async function findUserByGoogleId(googleId) {
  if (!googleId) return null;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
    if (rows.length > 0) return formatUserRow(rows[0]);
  } catch (err) {
    console.error('MySQL findUserByGoogleId error:', err.message);
  }
  const mem = inMemoryUsers.find(u => u.google_id === googleId);
  return mem ? formatUserRow(mem) : null;
}

// 5. Create new user (Sign Up / Google Sign In -> Inserts directly into MySQL)
async function createUser({ name, username, email, password_hash = null, avatar_url = null, google_id = null }) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = (username || name || 'User').trim();

  try {
    let result;
    try {
      [result] = await pool.query(
        `INSERT INTO users (username, email, password, profile_image, google_id)
         VALUES (?, ?, ?, ?, ?)`,
        [cleanName, cleanEmail, password_hash, avatar_url, google_id]
      );
    } catch (e) {
      [result] = await pool.query(
        `INSERT INTO users (name, email, password_hash, avatar_url, google_id)
         VALUES (?, ?, ?, ?, ?)`,
        [cleanName, cleanEmail, password_hash, avatar_url, google_id]
      );
    }

    console.log(`✅ User "${cleanName}" (${cleanEmail}) inserted into MySQL successfully with ID: ${result.insertId}`);

    return {
      id: result.insertId,
      name: cleanName,
      username: cleanName,
      email: cleanEmail,
      password_hash,
      avatar_url,
      google_id
    };
  } catch (err) {
    console.error('❌ MySQL createUser failed:', err.message);

    // Memory fallback if MySQL server is completely down
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
    return formatUserRow(newUser);
  }
}

// 6. Update User Profile
async function updateUserProfile(id, { name, avatar_url }) {
  try {
    try {
      await pool.query(
        'UPDATE users SET username = COALESCE(?, username), profile_image = COALESCE(?, profile_image) WHERE id = ?',
        [name, avatar_url, id]
      );
    } catch (e) {
      await pool.query(
        'UPDATE users SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
        [name, avatar_url, id]
      );
    }
  } catch (err) {
    console.error('MySQL updateUserProfile error:', err.message);
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
