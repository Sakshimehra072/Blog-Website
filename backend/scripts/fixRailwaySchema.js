const mysql = require('mysql2/promise');

async function fixRailwaySchema() {
  console.log('🚀 Connecting to Railway Database to update schema...');
  try {
    const conn = await mysql.createConnection({
      host: process.argv[2] || 'interchange.proxy.rlwy.net',
      port: parseInt(process.argv[3] || '59392'),
      user: process.argv[4] || 'root',
      password: process.argv[5] || 'esbJgUBXLvcorLZRnsyjRWMDFEnpZWVI',
      database: process.argv[6] || 'railway'
    });

    console.log('✅ Connected to Railway MySQL.');

    // 1. Add 'category' column to blogs table if it doesn't exist
    try {
      await conn.query(`ALTER TABLE blogs ADD COLUMN category VARCHAR(100) DEFAULT 'Technology';`);
      console.log('✅ Added `category` column to blogs table.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ `category` column already exists in blogs table.');
      } else {
        console.log('Notice on `category` column:', e.message);
      }
    }

    // 2. Add 'author_id', 'author_name', 'author_avatar' columns if they don't exist
    try {
      await conn.query(`ALTER TABLE blogs ADD COLUMN author_id INT DEFAULT NULL;`);
    } catch (e) {}

    try {
      await conn.query(`ALTER TABLE blogs ADD COLUMN author_name VARCHAR(100) DEFAULT 'Registered Author';`);
    } catch (e) {}

    try {
      await conn.query(`ALTER TABLE blogs ADD COLUMN author_avatar TEXT DEFAULT NULL;`);
    } catch (e) {}

    console.log('🎉 Railway Schema successfully synchronized!');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Schema Fix Error:', err.message);
    process.exit(1);
  }
}

fixRailwaySchema();
