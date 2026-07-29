const mysql = require('mysql2/promise');

async function testDelete() {
  console.log('🚀 Connecting to Railway Database to test deletion...');
  try {
    const conn = await mysql.createConnection({
      host: 'interchange.proxy.rlwy.net',
      port: 59392,
      user: 'root',
      password: 'esbJgUBXLvcorLZRnsyjRWMDFEnpZWVI',
      database: 'railway'
    });

    console.log('✅ Connected to Railway MySQL.');

    const [blogs] = await conn.query('SELECT id, title FROM blogs LIMIT 5');
    console.log('Current Railway blogs:', blogs);

    if (blogs.length > 0) {
      const testId = blogs[0].id;
      console.log(`Testing deletion of blog ID: ${testId}...`);

      await conn.query('SET FOREIGN_KEY_CHECKS = 0');
      try { await conn.query('DELETE FROM comments WHERE blog_id = ?', [testId]); } catch (e) { console.log('comments del notice:', e.message); }
      try { await conn.query('DELETE FROM likes WHERE blog_id = ?', [testId]); } catch (e) { console.log('likes del notice:', e.message); }
      try { await conn.query('DELETE FROM favourites WHERE blog_id = ?', [testId]); } catch (e) { console.log('favourites del notice:', e.message); }
      
      const [delRes] = await conn.query('DELETE FROM blogs WHERE id = ?', [testId]);
      console.log(`DELETE result: affectedRows=${delRes.affectedRows}`);
      await conn.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log(`🎉 Successfully deleted blog ID ${testId}!`);
    } else {
      console.log('No blogs in Railway database to test deletion.');
    }

    await conn.end();
  } catch (err) {
    console.error('❌ Deletion Test Failed:', err);
  }
}

testDelete();
