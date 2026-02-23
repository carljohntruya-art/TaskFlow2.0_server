const { verifyToken } = require('../utils/jwtUtils');
const { errorResponse } = require('../utils/responseUtils');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized, no token');
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return errorResponse(res, 401, 'Not authorized, token failed');
  }

  try {
    const user = await User.findById(decoded.userId);
    if (!user) {
      return errorResponse(res, 401, 'User no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
