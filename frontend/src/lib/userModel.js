import pool from './db';

// Helper to format consistent User JSON payload
function formatUserResponse(u) {
  return {
    id: u.id,
    name: u.name,
    username: u.name,
    email: u.email,
    avatar_url: u.avatar_url || null,
    avatar: u.avatar_url || null,
    createdAt: u.created_at || new Date().toISOString()
  };
}

// 1. Create a new user in MySQL
export async function createUserInDb({ name, email, password, avatarUrl }) {
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const cleanAvatar = avatarUrl || null;

  // Check if user already exists
  const [existing] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
  if (existing && existing.length > 0) {
    throw new Error('An account with this email already exists.');
  }

  const [result] = await pool.query(
    `INSERT INTO users (name, email, password, avatar_url, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [cleanName, cleanEmail, password, cleanAvatar]
  );

  const insertedId = result.insertId;
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [insertedId]);
  if (rows && rows.length > 0) {
    return formatUserResponse(rows[0]);
  }

  return formatUserResponse({
    id: insertedId,
    name: cleanName,
    email: cleanEmail,
    avatar_url: cleanAvatar,
    created_at: new Date().toISOString()
  });
}

// 2. Find user by Email or Name
export async function findUserByEmailInDb(emailOrName) {
  if (!emailOrName) return null;
  const cleanInput = emailOrName.trim().toLowerCase();

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(name) = ?',
      [cleanInput, cleanInput]
    );
    if (rows && rows.length > 0) {
      return rows[0];
    }
  } catch (err) {
    console.error('MySQL Find User Error:', err);
  }

  return null;
}

// 3. Find user by ID
export async function findUserByIdInDb(userId) {
  const uId = Number(userId);
  if (!uId) return null;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [uId]);
    if (rows && rows.length > 0) {
      return formatUserResponse(rows[0]);
    }
  } catch (err) {}

  return null;
}
