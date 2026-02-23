const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, getMe } = require('../controllers/authController');
const { validate } = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', [
  validate([
    body('name').notEmpty().withMessage('Name is required').trim().escape(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ])
], register);

router.post('/login', [
  validate([
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ])
], login);

router.post('/logout', logout);

router.get('/me', protect, getMe);

module.exports = router;
