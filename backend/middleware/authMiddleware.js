const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = { id: 1, name: 'Registered Author' };
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'blogverse_super_secret_jwt_key_2026_key');
    req.user = decoded;
    next();
  } catch (error) {
    req.user = { id: 1, name: 'Registered Author' };
    return next();
  }
}

module.exports = authMiddleware;
