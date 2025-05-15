const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const multer = require('multer');
const path = require('path');
const prisma = new PrismaClient();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

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

// Export upload middleware to be used in routes
const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  }
});

// Validation functions
const validatePriceRange = (priceRange) => {
  if (!priceRange) throw new Error('Price range is required');
  
  const priceRangeRegex = /^\d+(-\d+)?$/;
  if (!priceRangeRegex.test(priceRange)) {
    throw new Error('Invalid price range format. Use format: 5000 or 5000-10000');
  }

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
      if (!serviceData.amenities || (!Array.isArray(serviceData.amenities) && typeof serviceData.amenities !== 'string')) {
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

// User registration
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, providerType } = req.body;

    // Check if user exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set verification status based on role
    const verificationStatus = role === "PROVIDER" ? "PENDING_DOCUMENT" : "NOT_REQUIRED";

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
        phone,
        providerType: providerType || null,
        verificationStatus,
        profile: { create: {} },
      },
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        providerType: user.providerType,
        verificationStatus: user.verificationStatus,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        providerType: user.providerType,
        verificationStatus: user.verificationStatus,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register a service with file uploads
const registerService = async (req, res) => {
  try {
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
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify service type matches user's providerType if set
    if (user.providerType && user.providerType !== serviceType) {
      return res.status(400).json({ 
        message: `You are registered as a ${user.providerType} provider. You cannot register services in other categories.` 
      });
    }

    // Check files uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Validate service data
    try {
      validateServiceData(serviceData, serviceType);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    // Validate priceRange if present
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

    // Prepare image URLs
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    // Process arrays and JSON fields
    const processedData = { ...serviceData };
    ['amenities', 'dietaryOptions', 'eventTypes'].forEach(field => {
      if (processedData[field]) {
        try {
          if (typeof processedData[field] === 'string' && processedData[field].includes(',')) {
            processedData[field] = processedData[field].split(',').map(s => s.trim());
          } else if (typeof processedData[field] === 'string') {
            try {
              processedData[field] = JSON.parse(processedData[field]);
            } catch {
              processedData[field] = [processedData[field]];
            }
          }
        } catch {
          // ignore parsing errors, keep as is
        }
      }
    });

    // Create the service record in DB according to service type
    let newService;

    switch (serviceType) {
      case "PHOTOGRAPHER":
        newService = await prisma.photographer.create({
          data: {
            name: processedData.name,
            location: processedData.location,
            description: processedData.description,
            experienceYears: Number(processedData.experienceYears),
            style: processedData.style,
            copyType: processedData.copyType,
            priceRange: processedData.priceRange,
            contact: processedData.contact,
            images: imageUrls,
            userId,
          },
        });
        break;

      case "VENUE":
        newService = await prisma.venue.create({
          data: {
            name: processedData.name,
            location: processedData.location,
            description: processedData.description,
            capacity: Number(processedData.capacity),
            amenities: processedData.amenities,
            price: Number(processedData.price),
            contact: processedData.contact,
            images: imageUrls,
            userId,
          },
        });
        break;

      case "CATERING":
        newService = await prisma.catering.create({
          data: {
            name: processedData.name,
            location: processedData.location,
            description: processedData.description,
            maxPeople: Number(processedData.maxPeople),
            cuisineType: processedData.cuisineType,
            pricePerPerson: Number(processedData.pricePerPerson),
            contact: processedData.contact,
            images: imageUrls,
            userId,
          },
        });
        break;

      case "DESIGNER":
        newService = await prisma.designer.create({
          data: {
            name: processedData.name,
            location: processedData.location,
            description: processedData.description,
            style: processedData.style,
            experienceYears: Number(processedData.experienceYears),
            priceRange: processedData.priceRange,
            contact: processedData.contact,
            images: imageUrls,
            userId,
          },
        });
        break;
    }

    // Update user's providerType if not set
    if (!user.providerType) {
      await prisma.user.update({
        where: { id: userId },
        data: { providerType: serviceType }
      });
    }

    res.status(201).json({ message: "Service registered successfully", service: newService });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProviderType = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ providerType: user.providerType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      providerType: user.providerType,
      verificationStatus: user.verificationStatus,
      profile: user.profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validateServiceRegistration = async (req, res) => {
  try {
    const { serviceType } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.providerType) {
      return res.json({ canProceed: true, message: "You can register any service type" });
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
};
module.exports = {
  register,
  login,
  registerService,
getMe,
  validateServiceRegistration,
 getProviderType,
  upload, // multer middleware
};
