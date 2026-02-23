const { errorResponse } = require('../utils/responseUtils');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.code === '23505') {
    // Postgres unique violation
    statusCode = 409;
    message = 'Resource already exists';
  }

  errorResponse(res, statusCode, env.NODE_ENV === 'development' ? err.message : message);
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
