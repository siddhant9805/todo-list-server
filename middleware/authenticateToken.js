const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Authentication required.'
    });
  }

  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = tokenMatch ? tokenMatch[1].trim() : '';

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required.'
    });
  }

  try {
    const user = jwt.verify(token, jwtSecret);
    const userId = typeof user.sub === 'string' ? user.sub : '';

    if (!userId) {
      return res.status(403).json({
        error: 'Invalid or expired token.'
      });
    }

    req.user = { ...user, userId };
    return next();
  } catch (error) {
    return res.status(403).json({
      error: 'Invalid or expired token.'
    });
  }
}

module.exports = authenticateToken;
