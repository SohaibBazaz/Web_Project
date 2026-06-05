const bcrypt = require('bcryptjs');

// Mock Database in-memory arrays
const users = [];

// Whitelist set to track valid/active refresh tokens
const refreshTokensWhitelist = new Set();

// Seed users helper
const seedUsers = () => {
  users.length = 0; // Clear the array

  const salt = bcrypt.genSaltSync(10);

  // 1. Admin User
  users.push({
    id: 'user-admin-1',
    email: 'admin@aigenius.com',
    password: bcrypt.hashSync('admin123', salt),
    role: 'Admin'
  });

  // 2. Premium User
  users.push({
    id: 'user-premium-2',
    email: 'premium@aigenius.com',
    password: bcrypt.hashSync('premium123', salt),
    role: 'Premium_User'
  });

  // 3. Free User
  users.push({
    id: 'user-free-3',
    email: 'free@aigenius.com',
    password: bcrypt.hashSync('free123', salt),
    role: 'Free_User'
  });
};

// Seed users immediately upon module initialization
seedUsers();

const findUserByEmail = (email) => {
  if (!email) return null;
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

const findUserById = (id) => {
  return users.find(u => u.id === id);
};

// Refresh Token whitelist helpers
const addRefreshToken = (token) => {
  refreshTokensWhitelist.add(token);
};

const isRefreshTokenValid = (token) => {
  return refreshTokensWhitelist.has(token);
};

const removeRefreshToken = (token) => {
  refreshTokensWhitelist.delete(token);
};

module.exports = {
  users,
  findUserByEmail,
  findUserById,
  seedUsers,
  addRefreshToken,
  isRefreshTokenValid,
  removeRefreshToken
};
