require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDatabase() {
  console.log('\n🔍 Connecting to MySQL Database...\n');

  try {
    const isCloudDb = process.env.DB_HOST && !process.env.DB_HOST.includes('localhost') && !process.env.DB_HOST.includes('127.0.0.1');

    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'blogverse_db',
      port: parseInt(process.env.DB_PORT || '3306'),
      ssl: isCloudDb ? { rejectUnauthorized: false } : undefined
    });

    // 1. Check Blogs
    console.log('--------------------------------------------------');
    console.log('📚 BLOGS IN DATABASE:');
    console.log('--------------------------------------------------');
    const [blogs] = await pool.query('SELECT id, title, category, author_name, created_at FROM blogs ORDER BY created_at DESC');
    if (blogs.length === 0) {
      console.log('⚠️ No blogs found in database.');
    } else {
      console.table(blogs);
      console.log(`\nTotal Blogs Count: ${blogs.length}\n`);
    }

    // 2. Check Users
    console.log('--------------------------------------------------');
    console.log('👤 USERS IN DATABASE:');
    console.log('--------------------------------------------------');
    const [users] = await pool.query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC');
    if (users.length === 0) {
      console.log('⚠️ No users found in database.');
    } else {
      console.table(users);
      console.log(`\nTotal Users Count: ${users.length}\n`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Database Query Error:', err.message);
    process.exit(1);
  }
}

checkDatabase();
