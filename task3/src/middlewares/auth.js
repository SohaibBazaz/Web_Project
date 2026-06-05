const jwt = require('jsonwebtoken');
const { findUserById } = require('../db');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

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

    const currentUser = findUserById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

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
