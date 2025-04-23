const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for service images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../uploads/services');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `service-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Register a new service
const registerService = async (req, res) => {
  try {
    console.log('Starting service registration process');
    
    upload.array('images', 5)(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err.message);
        return res.status(400).json({ message: err.message });
      }

      const { serviceType } = req.body;
      console.log('Service registration request:', { 
        userId: req.user.id,
        serviceType,
        files: req.files?.length || 0
      });
      
      // Check if user is a provider
      if (req.user.role !== 'PROVIDER') {
        console.warn('Non-provider attempting to register service:', req.user.id);
        // Delete uploaded files if any
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => fs.unlinkSync(file.path));
        }
        return res.status(403).json({ message: 'Only providers can register services' });
      }

      // Get the user's service type from database
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { serviceType: true, providerStatus: true }
      });

      console.log('Provider status check:', { 
        userId: req.user.id,
        serviceType: user.serviceType,
        providerStatus: user.providerStatus,
        requestedType: serviceType
      });

      // Check if the user's service type matches the requested service type
      if (user.serviceType !== serviceType) {
        console.warn('Service type mismatch:', { 
          userType: user.serviceType, 
          requestedType: serviceType 
        });
        // Delete uploaded files if any
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => fs.unlinkSync(file.path));
        }
        return res.status(403).json({ 
          message: `You can only register services of type: ${user.serviceType}` 
        });
      }

      // Check if provider is approved
      if (user.providerStatus !== 'APPROVED') {
        console.warn('Non-approved provider attempting to register service:', {
          userId: req.user.id,
          status: user.providerStatus
        });
        // Delete uploaded files if any
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => fs.unlinkSync(file.path));
        }
        return res.status(403).json({ 
          message: 'Your provider account must be approved before registering services' 
        });
      }

      // Prepare base service data
      let serviceData = {
        userId: req.user.id,
        serviceType,
        name: req.body.name,
        description: req.body.description,
        location: req.body.location,
        status: 'PENDING', // All services start in pending status
        images: req.files ? req.files.map(file => file.filename) : [],
      };

      // Add type-specific fields
      switch (serviceType) {
        case 'venue':
          serviceData = {
            ...serviceData,
            capacity: parseInt(req.body.capacity || 0),
            price: parseFloat(req.body.price || 0),
            amenities: req.body.amenities ? JSON.parse(req.body.amenities) : [],
          };
          break;
        case 'photographer':
          serviceData = {
            ...serviceData,
            hourlyRate: parseFloat(req.body.hourlyRate || 0),
            packages: req.body.packages || '',
            photographyStyles: req.body.photographyStyles ? JSON.parse(req.body.photographyStyles) : [],
            experienceYears: parseInt(req.body.experienceYears || 0),
          };
          break;
        case 'designer':
          serviceData = {
            ...serviceData,
            price: parseFloat(req.body.price || 0),
            designStyles: req.body.designStyles ? JSON.parse(req.body.designStyles) : [],
          };
          break;
        case 'catering':
          serviceData = {
            ...serviceData,
            maxPeople: parseInt(req.body.maxPeople || 0),
            pricePerPerson: parseFloat(req.body.pricePerPerson || 0),
            cuisineTypes: req.body.cuisineTypes ? JSON.parse(req.body.cuisineTypes) : [],
            dietaryOptions: req.body.dietaryOptions ? JSON.parse(req.body.dietaryOptions) : [],
          };
          break;
        default:
          console.error('Invalid service type:', serviceType);
          if (req.files && req.files.length > 0) {
            req.files.forEach(file => fs.unlinkSync(file.path));
          }
          return res.status(400).json({ message: 'Invalid service type' });
      }

      try {
        console.log('Creating service in database');
        const service = await prisma.service.create({
          data: serviceData
        });

        console.log('Service created successfully:', service.id);
        res.status(201).json(service);
      } catch (dbError) {
        console.error('Database error while creating service:', dbError);
        // Clean up files if database operation fails
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => fs.unlinkSync(file.path));
        }
        res.status(500).json({ message: 'Error creating service record', details: dbError.message });
      }
    });
  } catch (error) {
    console.error('Unhandled error in registerService:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all services
const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        status: 'APPROVED' // Only return approved services
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get service by ID
const getServiceById = async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get provider's services
const getProviderServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        userId: req.user.id
      }
    });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  registerService,
  getServices,
  getServiceById,
  getProviderServices
};