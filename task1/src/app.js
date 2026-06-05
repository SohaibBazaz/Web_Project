const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { findUserByEmail } = require('./db');

const app = express();

// Middleware to parse incoming JSON payloads and cookies
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

    // 1. Validation: Ensure both fields are provided
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }

    // 2. Check if user exists and password matches
    const user = findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    // 3. Generate Access & Refresh tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 4. Store Refresh Token in httpOnly, secure (in production), sameSite=strict cookie
    const cookieOptions = {
      // Calculate token expiration date (e.g. 7 days from now)
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    // 5. Send short-lived Access Token in the JSON payload
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

// Root Route for checking API status
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'AI-Genius Task 1 Server is running'
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`[Task 1] AI-Genius Auth Server is listening on port ${PORT}`);
});
