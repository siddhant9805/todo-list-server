const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const userModel = require('../models/userModel');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Email ko hamesha lowercase mein rakhte hain, taaki A@x.com aur a@x.com ek hi maane jayein
function readCredentials(body) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  return { email, password };
}

async function register(req, res, next) {
  try {
    const { email, password } = readCredentials(req.body);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists. Please login.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.createUser({ email, password: hashedPassword });

    if (!user) {
      return res.status(409).json({ error: 'An account with this email already exists. Please login.' });
    }

    return res.status(201).json({
      message: 'User registered successfully. You can now log in.',
      email: user.email
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = readCredentials(req.body);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await userModel.findByEmail(email);

    // Account hi nahi hai
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email. Please register first.' });
    }

    // Account hai, par password galat
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign(
      { email: user.email },
      jwtSecret,
      { subject: String(user.id), expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful.',
      token,
      email: user.email
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login };