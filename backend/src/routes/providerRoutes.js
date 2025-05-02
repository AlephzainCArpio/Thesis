const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { protect, authorize } = require('../middlewares/authMiddleware'); // Make sure path is correct

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

// Apply middleware to ensure all routes require authentication
// IMPORTANT: This line ensures protect middleware is applied to ALL routes below
router.use(protect);

// Test route to verify authentication is working
router.get('/auth-test', (req, res) => {
  res.status(200).json({ 
    message: 'Authentication successful', 
    userId: req.user.id,
    userRole: req.user.role
  });
});

// Register provider with service type and verification document
router.post('/register-provider', upload.single('verificationDoc'), async (req, res) => {
  const { email, serviceType } = req.body;
  const verificationDoc = req.file?.filename;
  
  try {
    // Ensure we use the authenticated user's email, not from the body
    const userEmail = req.user.email;
    
    // Check if the user already has a service type
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (existingUser && existingUser.providerType) {
      return res.status(400).json({ error: 'Provider can only register one service type.' });
    }

    // Update user with service type and verification document
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        role: 'PENDING_PROVIDER',
        providerType: serviceType, // Dynamically assigning the provider type
        verificationDoc,
        verificationStatus: 'PENDING_DOCUMENT', // Assuming this status for pending providers
      },
    });

    res.status(200).json({ message: 'Registration submitted successfully. Pending approval.', user: updatedUser });
  } catch (err) {
    console.error("Error in register-provider:", err);
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
    console.error("Error in get provider type:", error);
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
    console.error("Error in validate service:", error);
    res.status(500).json({ message: error.message });
  }
});

// Register Service
router.post('/register-service', upload.array('images', 5), async (req, res) => {
  try {
    // Debug logging
    console.log("Register service request received");
    console.log("User:", req.user);
    console.log("Body:", req.body);
    console.log("Files:", req.files);
    
    // Make sure we have a user
    if (!req.user || !req.user.id) {
      console.error("No authenticated user found in request");
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userId = req.user.id;
    const { serviceType, ...serviceData } = req.body;

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
    
    // Process uploaded files if any
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    // Handle arrays that might have been stringified
    const processedData = { ...serviceData };
    ['amenities', 'dietaryOptions'].forEach(field => {
      if (processedData[field] && typeof processedData[field] === 'string') {
        try {
          processedData[field] = JSON.parse(processedData[field]);
        } catch (e) {
          // If it's not valid JSON, leave it as is
        }
      }
    });
    
    // Create the service with properly processed data
    const newService = await prisma.service.create({
      data: {
        type: serviceType,
        providerId: userId,
        ...processedData,
        images: imageUrls,
        status: 'PENDING',
      },
    });

    console.log("Service created successfully:", newService);
    res.status(201).json({ message: 'Service submitted for approval', newService });
  } catch (error) {
    console.error("Error in register-service:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;