const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Register provider with legitimacy image
router.post('/register-provider', upload.single('image'), async (req, res) => {
  const { userId } = req.body;
  const imageName = req.file?.filename;

  try {
    const user = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        role: 'PENDING_PROVIDER',
        legitimacyImage: imageName
      }
    });
    res.status(200).json({ message: 'Submitted for approval', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register as provider', details: err.message });
  }
});

// Admin approve or reject
router.post('/approve-provider', async (req, res) => {
  const { userId, action } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        role: action === 'approve' ? 'PROVIDER' : 'USER'
      }
    });
    res.json({ message: `User ${action}d`, user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update provider status' });
  }
});

module.exports = router;
