const { errorResponse } = require('../utils/responseUtils');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.code === '23505') {
    statusCode = 409;
    message = 'Resource already exists';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
  }

  if (env.NODE_ENV === 'production') {
    delete err.stack;
  } else {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: env.NODE_ENV === 'development' ? (err.message || message) : message,
    statusCode
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound,
};
