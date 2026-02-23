const Task = require('../models/taskModel');
const { successResponse, errorResponse } = require('../utils/responseUtils');

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    
    // Sanitize in simple terms (since we'll use express-validator too)
    const secureTitle = title.trim();
    const secureDescription = description ? description.trim() : null;

    const task = await Task.create(req.user.id, secureTitle, secureDescription, status, priority, dueDate);

    return successResponse(res, 201, 'Task created successfully', task);
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.findAllByUser(req.user.id);
    return successResponse(res, 200, 'Tasks retrieved successfully', tasks);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;

    // Check if task exists and belongs to user
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return errorResponse(res, 404, 'Task not found');
    }

    if (existingTask.user_id !== req.user.id) {
      return errorResponse(res, 403, 'Unauthorized to update this task');
    }

    const updatedTask = await Task.update(taskId, req.user.id, updates);
    return successResponse(res, 200, 'Task updated successfully', updatedTask);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return errorResponse(res, 404, 'Task not found');
    }

    if (existingTask.user_id !== req.user.id) {
      return errorResponse(res, 403, 'Unauthorized to delete this task');
    }

    const deleted = await Task.delete(taskId, req.user.id);
    
    return successResponse(res, 200, 'Task deleted successfully', { id: deleted.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
