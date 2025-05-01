const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { handleUpload } = require('../middlewares/uploadMiddleware');
const path = require('path');

// Serve static files
router.get('/:serviceType/:filename', (req, res) => {
  const { serviceType, filename } = req.params;
  const filePath = path.join(__dirname, `../../uploads/${serviceType}`, filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({
        status: 'error',
        message: 'File not found'
      });
    }
  });
});

// Protected upload route
router.post('/:serviceType', protect, handleUpload, (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'No files uploaded'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Files uploaded successfully',
    files: req.filePaths
  });
});

module.exports = router;