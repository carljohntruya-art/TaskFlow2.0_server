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

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return errorResponse(res, 403, 'Not authorized as an admin');
  }
};

module.exports = { protect, admin };
