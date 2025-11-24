const express = require('express');
const router = express.Router();
const { uploadImages } = require('../middleware/uploadMiddleware');

/**
 * Upload images for listing
 * POST /api/upload
 */
router.post('/', uploadImages, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required'
      });
    }

    if (req.files.length > 2) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 2 images allowed'
      });
    }

    // Return URLs of uploaded images
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    res.json({
      success: true,
      message: `${req.files.length} image(s) uploaded successfully`,
      data: imageUrls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
});

module.exports = router;
