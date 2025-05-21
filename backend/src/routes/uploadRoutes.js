const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { handleUpload } = require('../middlewares/uploadMiddleware');

const prisma = new PrismaClient();
router.post('/venues', handleUpload('venues'), (req, res) => {
  if (!req.filePaths || req.filePaths.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  res.json({ images: req.filePaths });
});
router.post('/:serviceType', protect, (req, res, next) => {
  const folder = req.params.serviceType.toLowerCase();
  handleUpload(folder)(req, res, next);
}, async (req, res) => {
  const { serviceType } = req.params;

  if (!req.filePaths || req.filePaths.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'No files uploaded',
    });
  }

  try {
    const providerId = req.user.id;
    // Store as a JSON array string for database (so frontend can JSON.parse it)
    const images = JSON.stringify(req.filePaths);

    let result;
    switch (serviceType.toLowerCase()) {
      case 'venues':
        result = await prisma.venue.create({
          data: {
            images,
            providerId,
            status: 'PENDING',
          },
        });
        break;
      case 'photographers':
        result = await prisma.photographer.create({
          data: {
            images,
            providerId,
            status: 'PENDING',
          },
        });
        break;
      case 'designers':
        result = await prisma.designer.create({
          data: {
            images,
            providerId,
            status: 'PENDING',
          },
        });
        break;
      case 'caterings':
        result = await prisma.catering.create({
          data: {
            images,
            providerId,
            status: 'PENDING',
          },
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
      message: 'Files uploaded and saved successfully',
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