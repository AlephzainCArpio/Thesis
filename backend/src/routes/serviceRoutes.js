const express = require('express');
const router = express.Router();
const { 
  registerService, 
  getServices, 
  getServiceById, 
  getProviderServices 
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

// Service routes
router.post('/', protect, registerService);
router.get('/', getServices);
router.get('/provider', protect, getProviderServices);
router.get('/:id', getServiceById);

module.exports = router;