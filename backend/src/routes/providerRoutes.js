const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middlewares/authMiddleware');
const {
  registerService,
  validateServiceRegistration,
  getProviderType,
  registerProviderWithDocument,
} = require('../controllers/providerController');

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

// Register provider with document
router.post('/register-provider', upload.single('verificationDoc'), registerProviderWithDocument);

// Register service
router.post('/register-service', protect, registerService);

// Validate service registration
router.post('/register-service/validate', protect, validateServiceRegistration);

// Get provider type
router.get('/type', protect, getProviderType);

module.exports = router;
