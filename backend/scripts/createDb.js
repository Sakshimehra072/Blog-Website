const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function createNewDatabase(newDbName) {
  const dbName = newDbName || process.argv[2] || process.env.DB_NAME || 'blogverse_db';

  console.log(`\n⚙️ Creating new MySQL database: "${dbName}"...\n`);

  try {
    // Connect to MySQL server without specifying a database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '3306')
    });

    // 1. Create Database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`✅ Database "${dbName}" created or verified successfully.`);

    // 2. Select Database
    await connection.query(`USE \`${dbName}\`;`);

    // 3. Create Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) DEFAULT NULL,
        avatar_url VARCHAR(255) DEFAULT NULL,
        google_id VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('  ├── Table `users` created.');

    // 4. Create Blogs Table
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('  ├── Table `blogs` created.');

    // 5. Create Likes Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        blog_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_blog_like (user_id, blog_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
      )
    `);
    console.log('  ├── Table `likes` created.');

    // 6. Create Favourites Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS favourites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        blog_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_blog_fav (user_id, blog_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
      )
    `);
    console.log('  ├── Table `favourites` created.');

    // 7. Create Comments Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        blog_id INT NOT NULL,
        user_id INT DEFAULT NULL,
        author_name VARCHAR(100) NOT NULL,
        author_avatar VARCHAR(255) DEFAULT NULL,
        text TEXT NOT NULL,
        parent_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
      )
    `);
    console.log('  └── Table `comments` created.');

    await connection.end();

    console.log(`\n🎉 New Database "${dbName}" initialized with all tables successfully!`);
    console.log(`👉 Remember to set DB_NAME=${dbName} in your backend/.env file.\n`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create database:', err.message);
    process.exit(1);
  }
}

createNewDatabase();
