// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const validator = require('validator');
require('dotenv').config();
const logger = require('../config/logger');
const { auditLog, securityLog } = require('../config/audit');

// Login handler.
exports.login = async (req, res) => {
  const { username, password } = req.body;

  // Validate required fields.
  if (!username || !password) {
    return res.status(400).json({ message: 'Invalid credentials.' });
  }

  // Validate data types.
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Invalid credentials.' });
  }

  // Validate field lengths.
  if (username.length < 3 || username.length > 50 || password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: 'Invalid credentials.' });
  }

  const sanitizedUsername = username.trim();
  const sanitizedPassword = password.trim();

  try {
    const user = await User.findOne({ username: sanitizedUsername });
    
    // Generic message to prevent user enumeration.
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(sanitizedPassword, user.password);
    
    if (!isMatch) {
      securityLog('LOGIN_FAILED', user._id, `Failed login attempt for ${sanitizedUsername}`);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    auditLog('LOGIN', user._id, { username: sanitizedUsername }, 'success');

    res.json({ token, role: user.role, username: user.username });
  } catch (error) {
    logger.error('Login error.', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

// Registration handler.
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  // Validate required fields.
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Validate data types.
  if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Invalid data format.' });
  }

  const sanitizedUsername = username.trim();
  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedPassword = password.trim();

  // Validate email format.
  if (!validator.isEmail(sanitizedEmail)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  // Validate username length.
  if (sanitizedUsername.length < 3 || sanitizedUsername.length > 50) {
    return res.status(400).json({ message: 'Username must be between 3 and 50 characters.' });
  }

  // Validate username characters.
  if (!/^[a-zA-Z0-9_]+$/.test(sanitizedUsername)) {
    return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores.' });
  }

  // Validate password length.
  if (sanitizedPassword.length < 8 || sanitizedPassword.length > 128) {
    return res.status(400).json({ message: 'Password must be between 8 and 128 characters.' });
  }

  // Validate password complexity.
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(sanitizedPassword)) {
    return res.status(400).json({ message: 'Password must contain uppercase, lowercase, and numbers.' });
  }

  try {
    // Check if email already exists.
    const existingEmail = await User.findOne({ email: sanitizedEmail });
    if (existingEmail) {
      return res.status(400).json({ message: 'This email is already in use.' });
    }

    // Check if username already exists.
    const existingUsername = await User.findOne({ username: sanitizedUsername });
    if (existingUsername) {
      return res.status(400).json({ message: 'This username is already in use.' });
    }

    // Create new user.
    const user = new User({ username: sanitizedUsername, email: sanitizedEmail, password: sanitizedPassword });
    await user.save();

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    logger.error('Registration error.', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
};