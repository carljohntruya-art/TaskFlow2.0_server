const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { successResponse, errorResponse } = require('../utils/responseUtils');

router.post('/', protect, upload.single('image'), (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'Please upload an image file');
    }
    
    // Create the URL path for the uploaded file
    // Assumes express static serves the /uploads path
    const fileUrl = `/uploads/${req.file.filename}`;
    
    return successResponse(res, 200, 'Image uploaded successfully', { url: fileUrl });
  } catch (error) {
    next(error);
  }
});

// Handle multer specific errors
router.use((err, req, res, next) => {
  if (err.name === 'MulterError' || err.message === 'Invalid file type. Only JPEG, PNG, and WebP are allowed.') {
    return errorResponse(res, 400, err.message);
  }
  next(err);
});

module.exports = router;
