const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const {
  findUserByEmail,
  findUserById,
  addRefreshToken,
  isRefreshTokenValid,
  removeRefreshToken
} = require('./db');
const { protect } = require('./middlewares/auth');

const app = express();

app.use(express.json());
app.use(cookieParser());

// Generate Access Token (Short-lived, e.g. 15 minutes)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

// Generate Refresh Token (Long-lived, e.g. 7 days)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/login
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    const user = findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to whitelist to enforce strict lifecycles
    addRefreshToken(refreshToken);

    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      status: 'success',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh - Silent Refresh Endpoint
app.post('/api/auth/refresh', (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // 1. Check if token exists in cookie
    if (!refreshToken) {
      return res.status(401).json({
        status: 'fail',
        message: 'No refresh token found. Please log in again.'
      });
    }

    // 2. Check if refresh token is in the database whitelist (not revoked)
    if (!isRefreshTokenValid(refreshToken)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Refresh token has been revoked or is invalid. Please log in again.'
      });
    }

    // 3. Verify signature of the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        status: 'fail',
        message: 'Refresh token has expired or is invalid. Please log in again.'
      });
    }

    // 4. Ensure the user still exists
    const user = findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 5. Issue a new short-lived Access Token
    const accessToken = generateAccessToken(user);

    res.status(200).json({
      status: 'success',
      accessToken
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout - Revokes active refresh token and clears cookie
app.post('/api/auth/logout', (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      removeRefreshToken(refreshToken);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/profile - Protected route
app.get('/api/auth/profile', protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    user: req.user
  });
});

// Root Route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'AI-Genius Task 3 Server is running'
  });
});

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error Details:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`[Task 3] AI-Genius Auth Server is listening on port ${PORT}`);
});
