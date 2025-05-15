const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  getProviderType,
  validateServiceRegistration, 
  registerService,
  upload,
  getServiceType
} = require('../controllers/providerController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.get('/provider-type', getServiceType);
router.post('/validate-service', validateServiceRegistration);

// Service routes
router.post('/register-service', upload.array('images', 5), registerService);

module.exports = router;  