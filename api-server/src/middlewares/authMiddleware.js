const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const verifyJwtToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};

const extractUserFromToken = async (req) => {
  const token = req.cookies?.authToken;

  if (!token) {
    throw new Error('Missing token');
  }

  const decoded = await verifyJwtToken(token);
  return decoded;
};

const authenticateUser = async (req, res, next) => {
  try {
    const decoded = await extractUserFromToken(req);
    req.userId = decoded._id;
    next();
  } catch (error) {
    logger.warn(`Authentication failed: ${error.message}`);
    return res.status(401).json({
      error: { message: 'Invalid or missing authentication token.' }
    });
  }
};

const authenticateUserOptional = async (req, res, next) => {
  try {
    const decoded = await extractUserFromToken(req);
    req.userId = decoded._id;
  } catch (error) {
    logger.debug('Optional authentication skipped or failed');
    // No token or invalid token – continue without throwing
  }
  next();
};

module.exports = {
  authenticateUser,
  authenticateUserOptional
};