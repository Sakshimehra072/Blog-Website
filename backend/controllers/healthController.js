const { testConnection } = require('../config/database');

async function checkHealth(req, res) {
  const dbStatus = await testConnection();
  res.json({
    success: true,
    message: 'BlogVerse REST API is running smoothly',
    timestamp: new Date().toISOString(),
    database: dbStatus ? 'connected' : 'disconnected/fallback'
  });
}

module.exports = {
  checkHealth
};
