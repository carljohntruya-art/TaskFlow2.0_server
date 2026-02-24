const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
    statusCode
  });
};

const sanitizeUser = (user) => {
  const { password_hash, ...safe } = user;
  return safe;
};

module.exports = {
  successResponse,
  errorResponse,
  sanitizeUser
};
