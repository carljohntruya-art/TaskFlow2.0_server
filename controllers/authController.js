const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const { signToken } = require('../utils/jwtUtils');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const env = require('../config/env');

const isProduction = process.env.NODE_ENV === 'production';

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findByEmail(email);
    if (userExists) {
      return errorResponse(res, 400, 'User already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create(name, email, passwordHash);

    // Generate token
    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    // Set cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: isProduction,          // HTTPS only in production
      sameSite: isProduction ? 'none' : 'lax',  // 'none' required for cross-domain
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in ms
    });

    return successResponse(res, 201, 'User registered successfully', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    return successResponse(res, 200, 'Logged in successfully', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax'
    });

    return successResponse(res, 200, 'User logged out successfully');
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware
    if (!req.user) {
      return errorResponse(res, 401, 'User not found');
    }

    return successResponse(res, 200, 'User retrieved successfully', {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.created_at,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
