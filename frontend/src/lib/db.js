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

// Auto-initialize ALL required MySQL database tables if they don't exist yet
async function initDb() {
  try {
    // 1. Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar_url TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Blogs Table
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

    // 3. Comments Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        blog_id INT NOT NULL,
        user_id INT DEFAULT NULL,
        author_name VARCHAR(100) DEFAULT 'Anonymous User',
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Likes Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        blog_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Favourites Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favourites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        blog_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed sample blogs if table is empty
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM blogs');
    if (rows.length > 0 && Number(rows[0].total) === 0) {
      await pool.query(`
        INSERT INTO blogs (title, category, cover_image, description, author_name, read_time, created_at)
        VALUES 
        (
          'Architecting Scalable Real-Time Web Applications',
          'Technology',
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
          'An in-depth technical exploration into building high-performance web systems using modern frameworks, database connection pooling, and resilient API architectures.',
          'Antigravity Engineering',
          '6 min read',
          NOW()
        ),
        (
          'The Evolution of Modern JavaScript and React Ecosystem',
          'Programming',
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
          'Discover the state of frontend development in 2026, focusing on serverless rendering, state synchronization, and component design patterns.',
          'Dev Insights',
          '4 min read',
          NOW()
        ),
        (
          'Artificial Intelligence and Autonomous Code Generation',
          'Artificial Intelligence',
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          'How AI agents and generative intelligence models are transforming software engineering, automated testing, and developer workflows.',
          'AI Frontier',
          '5 min read',
          NOW()
        );
      `);
    }
  } catch (err) {
    console.error('MySQL Auto Table Init Error:', err);
  }
}

initDb();

export default pool;
