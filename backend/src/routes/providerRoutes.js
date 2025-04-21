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

    if (existingUser && existingUser.serviceType) {
      return res.status(400).json({ error: 'Provider can only register one service type.' });
    }

    // Update user with service type and verification document
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: 'PENDING_PROVIDER',
        serviceType,
        verificationDoc,
        providerStatus: 'PENDING',
      },
    });

    res.status(200).json({ message: 'Registration submitted successfully. Pending approval.', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register as provider', details: err.message });
  }
});

module.exports = router;