const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { protect, authorize } = require('../middlewares/authMiddleware');

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

// Multer file filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG and WebP images are allowed.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  }
});

// Apply middleware to ensure all routes require authentication
router.use(protect);

// Validation functions
const validatePriceRange = (priceRange) => {
  if (!priceRange) throw new Error('Price range is required');
  
  const priceRangeRegex = /^\d+(-\d+)?$/;
  if (!priceRangeRegex.test(priceRange)) {
    throw new Error('Invalid price range format. Use format: 5000 or 5000-10000');
  }

  // If range is provided, ensure first number is less than second
  if (priceRange.includes('-')) {
    const [min, max] = priceRange.split('-').map(Number);
    if (min >= max) {
      throw new Error('Minimum price must be less than maximum price');
    }
  }

  return priceRange;
};

const validateServiceData = (serviceData, serviceType) => {
  // Common validations
  const requiredFields = ['name', 'description', 'location'];
  for (const field of requiredFields) {
    if (!serviceData[field]?.trim()) {
      throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
    }
  }

  // Service-specific validations
  switch (serviceType) {
    case 'PHOTOGRAPHER':
      if (!serviceData.experienceYears || isNaN(serviceData.experienceYears)) {
        throw new Error('Valid experience years are required for photographers');
      }
      if (!serviceData.style || !['traditional', 'photojournalistic', 'contemporary'].includes(serviceData.style)) {
        throw new Error('Valid photography style is required');
      }
      if (!serviceData.copyType || !['virtual', 'physical', 'both'].includes(serviceData.copyType)) {
        throw new Error('Valid copy type is required');
      }
      break;
      
    case 'VENUE':
      if (!serviceData.capacity || isNaN(serviceData.capacity)) {
        throw new Error('Valid capacity is required for venues');
      }
      if (!serviceData.amenities || !Array.isArray(JSON.parse(serviceData.amenities))) {
        throw new Error('Valid amenities list is required');
      }
      break;
      
    case 'CATERING':
      if (!serviceData.maxPeople || isNaN(serviceData.maxPeople)) {
        throw new Error('Valid maximum people capacity is required');
      }
      if (!serviceData.cuisineType) {
        throw new Error('Cuisine type is required');
      }
      if (!serviceData.pricePerPerson || isNaN(serviceData.pricePerPerson)) {
        throw new Error('Valid price per person is required');
      }
      break;
      
    case 'DESIGNER':
      if (!serviceData.style || !['modern', 'classic', 'minimalist'].includes(serviceData.style)) {
        throw new Error('Valid design style is required');
      }
      if (!serviceData.experienceYears || isNaN(serviceData.experienceYears)) {
        throw new Error('Valid experience years are required');
      }
      break;

    default:
      throw new Error('Invalid service type');
  }
};

// Register Service Route
router.post('/register-service', upload.array('images', 5), async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Register service request received from user: ${req.user.id}`);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userId = req.user.id;
    const { serviceType, ...serviceData } = req.body;

    // Validate service type
    if (!['PHOTOGRAPHER', 'VENUE', 'CATERING', 'DESIGNER'].includes(serviceType)) {
      return res.status(400).json({ message: 'Invalid service type' });
    }

    // Get user to verify provider type
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the service type matches the provider type
    if (user.providerType && user.providerType !== serviceType) {
      return res.status(400).json({ 
        message: `You are registered as a ${user.providerType} provider. You cannot register services in other categories.` 
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Validate service data
    try {
      validateServiceData(serviceData, serviceType);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    // Handle priceRange formatting and validation
    if (serviceData.priceRange) {
      try {
        serviceData.priceRange = validatePriceRange(
          Array.isArray(serviceData.priceRange) 
            ? serviceData.priceRange.join('-')
            : serviceData.priceRange
        );
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    // Process uploaded files
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    // Process arrays and JSON fields
    const processedData = { ...serviceData };
    ['amenities', 'dietaryOptions'].forEach(field => {
      if (processedData[field]) {
        try {
          processedData[field] = typeof processedData[field] === 'string' 
            ? JSON.parse(processedData[field])
            : processedData[field];
        } catch (e) {
          console.warn(`Failed to parse ${field}, keeping original value`);
        }
      }
    });

    // Prepare the create data
    const createData = {
      type: serviceType,
      providerId: userId,
      ...processedData,
      images: JSON.stringify(imageUrls),
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create the service based on type
    let newService;
    try {
      switch(serviceType) {
        case 'PHOTOGRAPHER':
          newService = await prisma.photographer.create({
            data: createData
          });
          break;
          
        case 'VENUE':
          newService = await prisma.venue.create({
            data: createData
          });
          break;
          
        case 'CATERING':
          newService = await prisma.catering.create({
            data: createData
          });
          break;
          
        case 'DESIGNER':
          newService = await prisma.designer.create({
            data: createData
          });
          break;
      }

      console.log(`[${new Date().toISOString()}] Service created successfully:`, newService.id);
      
      res.status(201).json({ 
        message: 'Service submitted for approval', 
        newService 
      });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Database error:`, error);
      if (error.code === 'P2002') {
        return res.status(400).json({ message: 'A service with these details already exists' });
      }
      throw error;
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in register-service:`, error);
    res.status(500).json({ 
      message: error.message || 'An error occurred while registering the service' 
    });
  }
});

// Get Provider Services Route
router.get('/services', async (req, res) => {
  try {
    const userId = req.user.id;
    const services = await prisma.service.findMany({
      where: {
        providerId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(services);
  } catch (error) {
    console.error('Error fetching provider services:', error);
    res.status(500).json({ message: 'Failed to fetch services' });
  }
});

// Update Service Status Route
router.patch('/services/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const service = await prisma.service.findFirst({
      where: {
        id,
        providerId: userId
      }
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: { status }
    });

    res.json(updatedService);
  } catch (error) {
    console.error('Error updating service status:', error);
    res.status(500).json({ message: 'Failed to update service status' });
  }
});

module.exports = router;