const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const isVercel = !!(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV || (process.env.NODE_ENV === 'production'));

const defaultHost = isVercel ? 'interchange.proxy.rlwy.net' : 'localhost';
const defaultPort = isVercel ? 59392 : 3306;
const defaultUser = 'root';
const defaultPassword = isVercel ? 'esbJgUBXLvcorLZRnsyjRWMDFEnpZWVI' : 'Sakshi@sql123';
const defaultDb = isVercel ? 'railway' : 'blogverse_db';

const host = process.env.DB_HOST || defaultHost;
const port = parseInt(process.env.DB_PORT || String(defaultPort));
const user = process.env.DB_USER || defaultUser;
const password = process.env.DB_PASSWORD !== undefined && process.env.DB_PASSWORD !== '' ? process.env.DB_PASSWORD : defaultPassword;
const database = process.env.DB_NAME || defaultDb;

const isCloudDb = host && !host.includes('localhost') && !host.includes('127.0.0.1');

const pool = mysql.createPool({
  host,
  user,
  password,
  database,
  port,
  ssl: isCloudDb ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully.');

    // Auto-create blogs table if not existing
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        author_id INT DEFAULT NULL,
        author_name VARCHAR(100) NOT NULL,
        author_avatar VARCHAR(255) DEFAULT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        cover_image VARCHAR(500) DEFAULT NULL,
        description TEXT NOT NULL,
        read_time VARCHAR(20) DEFAULT '5 min read',
        likes_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    connection.release();
    return true;
  } catch (error) {
    console.warn(`⚠️ MySQL Connection Warning: ${error.message}`);
    console.warn('Backend running in fallback mode until MySQL service is started.');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
