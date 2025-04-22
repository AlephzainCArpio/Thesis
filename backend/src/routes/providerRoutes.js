const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../uploads/');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Register provider with service type and verification document
router.post('/register-provider', upload.single('verificationDoc'), async (req, res) => {
  const { email, serviceType } = req.body;
  const verificationDoc = req.file?.filename;

  try {
    // Check if the user already has a service type
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.providerType) {
      return res.status(400).json({ error: 'Provider can only register one service type.' });
    }

    // Update user with service type and verification document
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: 'PENDING_PROVIDER',
        providerType: serviceType, // Dynamically assigning the provider type
        verificationDoc,
        verificationStatus: 'PENDING_DOCUMENT', // Assuming this status for pending providers
      },
    });

    res.status(200).json({ message: 'Registration submitted successfully. Pending approval.', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register as provider', details: err.message });
  }
});

// Get Provider Type
router.get('/type', async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ providerType: user.providerType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validate Service Registration
router.post('/register-service/validate', async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceType } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.providerType) {
      return res.json({ canProceed: true, message: 'You can register any service type' });
    }

    if (user.providerType !== serviceType) {
      return res.json({
        canProceed: false,
        message: `You are registered as a ${user.providerType} provider. You cannot register services in multiple categories.`,
      });
    }

    res.json({ canProceed: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register Service
router.post('/register-service', async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceType, ...serviceData } = req.body;

    const newService = await prisma.service.create({
      data: {
        type: serviceType,
        providerId: userId,
        ...serviceData,
        status: 'PENDING',
      },
    });

    res.status(201).json({ message: 'Service submitted for approval', newService });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
