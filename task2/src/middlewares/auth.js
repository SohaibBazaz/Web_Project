const jwt = require('jsonwebtoken');
const { findUserById } = require('../db');

const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Read token from the Authorization: Bearer <token> header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token is provided, return 401 Unauthorized
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // 2. Verify token signature and check expiration
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'fail',
          code: 'TOKEN_EXPIRED',
          message: 'Your token has expired. Please refresh your token or log in again.'
        });
      }
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token. Please log in again.'
      });
    }

    // 3. Ensure the user still exists in the mock database
    const currentUser = findUserById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4. Attach the user payload to the req.user object (excluding password)
    req.user = {
      id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect };
