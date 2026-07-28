import mysql from 'mysql2/promise';

const isCloudDb = process.env.DB_HOST && !process.env.DB_HOST.includes('localhost') && !process.env.DB_HOST.includes('127.0.0.1');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'blogverse_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 15000,
  ssl: isCloudDb ? { rejectUnauthorized: false } : undefined
});

// Auto-initialize MySQL tables if they don't exist yet
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        cover_image TEXT,
        description TEXT,
        author_id INT DEFAULT NULL,
        author_name VARCHAR(100) DEFAULT 'Registered Author',
        author_avatar TEXT DEFAULT NULL,
        read_time VARCHAR(50) DEFAULT '5 min read',
        likes_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error('MySQL Auto Table Init Error:', err);
  }
}

initDb();

export default pool;
