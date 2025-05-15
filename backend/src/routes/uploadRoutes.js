const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { handleUpload } = require('../middlewares/uploadMiddleware');
const path = require('path');

const prisma = new PrismaClient();

// Protected upload route
router.post('/:serviceType', protect, handleUpload, async (req, res) => {
  const { serviceType } = req.params;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'No files uploaded',
    });
  }

  try {
    // Save file metadata to the database
    const uploadedFiles = req.filePaths.map((filePath) => ({
      images: filePath,
      providerId: req.user.id, // assuming `req.user.id` contains the user's ID
      status: 'PENDING',
    }));

    let result;
    switch (serviceType.toLowerCase()) {
      case 'venues':
        result = await prisma.venue.createMany({
          data: uploadedFiles,
        });
        break;
      case 'photographers':
        result = await prisma.photographer.createMany({
          data: uploadedFiles,
        });
        break;
      case 'designers':
        result = await prisma.designer.createMany({
          data: uploadedFiles,
        });
        break;
      case 'caterings':
        result = await prisma.catering.createMany({
          data: uploadedFiles,
        });
        break;
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid service type',
        });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Files uploaded and saved to database successfully',
      result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to save file metadata to database',
      error: error.message,
    });
  }
});

module.exports = router;