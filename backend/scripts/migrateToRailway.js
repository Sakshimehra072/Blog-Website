const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function migrateLocalToRailway() {
  const localHost = 'localhost';
  const localUser = process.env.DB_USER || 'root';
  const localPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'Sakshi@sql123';
  const localDb = 'blogverse_db';

  const railwayHost = process.argv[2] || process.env.RAILWAY_DB_HOST;
  const railwayPort = parseInt(process.argv[3] || process.env.RAILWAY_DB_PORT || '3306');
  const railwayUser = process.argv[4] || process.env.RAILWAY_DB_USER || 'root';
  const railwayPassword = process.argv[5] || process.env.RAILWAY_DB_PASSWORD;
  const railwayDb = process.argv[6] || process.env.RAILWAY_DB_NAME || 'railway';

  if (!railwayHost || !railwayPassword) {
    console.log('\n❌ Missing Railway Connection Details!');
    console.log('\nUsage:');
    console.log('  node backend/scripts/migrateToRailway.js <RAILWAY_HOST> <RAILWAY_PORT> <RAILWAY_USER> <RAILWAY_PASSWORD> <RAILWAY_DB_NAME>\n');
    process.exit(1);
  }

  console.log(`\n🚀 Starting Migration from Local Database (${localDb}) to Railway Database (${railwayHost}:${railwayPort})...\n`);

  try {
    // 1. Connect to Local Database
    const localConn = await mysql.createConnection({
      host: localHost,
      user: localUser,
      password: localPassword,
      database: localDb
    });
    console.log('✅ Connected to Local MySQL Database.');

    // 2. Connect to Railway Database
    let railwayConn;
    try {
      railwayConn = await mysql.createConnection({
        host: railwayHost,
        port: railwayPort,
        user: railwayUser,
        password: railwayPassword,
        database: railwayDb,
        connectTimeout: 10000
      });
    } catch (e) {
      railwayConn = await mysql.createConnection({
        host: railwayHost,
        port: railwayPort,
        user: railwayUser,
        password: railwayPassword,
        database: railwayDb,
        ssl: { rejectUnauthorized: false },
        connectTimeout: 10000
      });
    }
    console.log('✅ Connected to Railway MySQL Database.');

    // Disable foreign key checks on Railway for clean import
    await railwayConn.query('SET FOREIGN_KEY_CHECKS = 0;');

    // 3. Fetch all tables from local DB
    const [tables] = await localConn.query('SHOW TABLES');
    const tableKey = Object.keys(tables[0])[0];

    for (const t of tables) {
      const tableName = t[tableKey];
      console.log(`\n📦 Migrating Table: \`${tableName}\`...`);

      // Get CREATE TABLE DDL
      const [createResult] = await localConn.query(`SHOW CREATE TABLE \`${tableName}\``);
      const createSql = createResult[0]['Create Table'];

      // Create table on Railway
      await railwayConn.query(`DROP TABLE IF EXISTS \`${tableName}\``);
      await railwayConn.query(createSql);

      // Copy rows
      const [rows] = await localConn.query(`SELECT * FROM \`${tableName}\``);
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]).map(col => `\`${col}\``).join(', ');
        const placeholders = Object.keys(rows[0]).map(() => '?').join(', ');
        const insertSql = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeholders})`;

        for (const row of rows) {
          await railwayConn.query(insertSql, Object.values(row));
        }
        console.log(`  └── Transferred ${rows.length} rows.`);
      } else {
        console.log(`  └── Table empty (0 rows transferred).`);
      }
    }

    await railwayConn.query('SET FOREIGN_KEY_CHECKS = 1;');

    await localConn.end();
    await railwayConn.end();

    console.log('\n🎉 Migration Completed Successfully! All local data is now live on Railway.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Failed:', err.message);
    process.exit(1);
  }
}

migrateLocalToRailway();
