const express = require('express');
const { body } = require('express-validator');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const { validate } = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all task routes
router.use(protect);

router.post('/', [
  validate([
    body('title').notEmpty().withMessage('Title is required').trim().escape(),
    body('description').optional().trim().escape(),
    body('status').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  ])
], createTask);

router.get('/', getTasks);

router.patch('/:id', [
  validate([
    body('title').optional().trim().escape(),
    body('description').optional().trim().escape(),
    body('status').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  ])
], updateTask);

router.delete('/:id', deleteTask);

module.exports = router;
