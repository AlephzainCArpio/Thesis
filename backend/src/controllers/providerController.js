const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const multer = require('multer');
const path = require('path');
const prisma = new PrismaClient();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

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
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type. Only JPEG, JPG, PNG and WebP images are allowed.'), false);
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }
});

const validatePriceRange = (priceRange) => {
  if (!priceRange) throw new Error('Price range is required');
  const priceRangeRegex = /^\d+(-\d+)?$/;
  if (!priceRangeRegex.test(priceRange)) throw new Error('Invalid price range format. Use format: 5000 or 5000-10000');
  if (priceRange.includes('-')) {
    const [min, max] = priceRange.split('-').map(Number);
    if (min >= max) throw new Error('Minimum price must be less than maximum price');
  }
  return priceRange;
};
const validateServiceData = (serviceData, serviceType) => {
  const requiredFields = ['name', 'description', 'location'];
  for (const field of requiredFields) {
    if (!serviceData[field]?.trim()) throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
  }
  switch (serviceType) {
    case 'PHOTOGRAPHER':
      if (!serviceData.experienceYears || isNaN(serviceData.experienceYears)) throw new Error('Valid experience years are required for photographers');
      if (!serviceData.style || !['traditional', 'photojournalistic', 'contemporary'].includes(serviceData.style)) throw new Error('Valid photography style is required');
      if (!serviceData.copyType || !['virtual', 'physical', 'both'].includes(serviceData.copyType)) throw new Error('Valid copy type is required');
      break;
    case 'VENUE':
      if (!serviceData.capacity || isNaN(serviceData.capacity)) throw new Error('Valid capacity is required for venues');
      if (!serviceData.amenities || (!Array.isArray(serviceData.amenities) && typeof serviceData.amenities !== 'string')) throw new Error('Valid amenities list is required');
      break;
    case 'CATERING':
      if (!serviceData.maxPeople || isNaN(serviceData.maxPeople)) throw new Error('Valid maximum people capacity is required');
      if (!serviceData.cuisineType) throw new Error('Cuisine type is required');
      if (!serviceData.pricePerPerson || isNaN(serviceData.pricePerPerson)) throw new Error('Valid price per person is required');
      break;
    case 'DESIGNER':
      if (!serviceData.style || !['modern', 'classic', 'minimalist'].includes(serviceData.style)) throw new Error('Valid design style is required');
      if (!serviceData.experienceYears || isNaN(serviceData.experienceYears)) throw new Error('Valid experience years are required');
      break;
    default:
      throw new Error('Invalid service type');
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, serviceType } = req.body;
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ message: "User already exists" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationStatus = role === "PROVIDER" ? "PENDING_DOCUMENT" : "NOT_REQUIRED";
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
        phone,
        serviceType: serviceType || null,
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
        serviceType: user.serviceType,
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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        serviceType: user.serviceType,
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

const registerService = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const userId = req.user.id;
    const { serviceType, ...serviceData } = req.body;

    if (!['PHOTOGRAPHER', 'VENUE', 'CATERING', 'DESIGNER'].includes(serviceType)) {
      return res.status(400).json({ message: 'Invalid service type' });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.serviceType && user.serviceType !== serviceType) {
      return res.status(400).json({
        message: `You are registered as a ${user.serviceType} service provider. You cannot register services in other categories.`
      });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }
    try {
      validateServiceData(serviceData, serviceType);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
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

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    let imagesField = "";
    if (imageUrls.length === 1) imagesField = imageUrls[0];
    else imagesField = imageUrls.join(",");

    const processedData = { ...serviceData };
    ['dietaryOptions'].forEach(field => {
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

    let singleEventType = "";
    if (processedData.eventTypes) {
      if (Array.isArray(processedData.eventTypes)) {
        singleEventType = processedData.eventTypes[0];
      } else {
        singleEventType = processedData.eventTypes;
      }
    }

    // --- amenities fix: always store as JSON stringified array ---
    let amenitiesString = "[]";
    if (processedData.amenities) {
      if (Array.isArray(processedData.amenities)) {
        amenitiesString = JSON.stringify(processedData.amenities);
      } else if (typeof processedData.amenities === 'string') {
        amenitiesString = JSON.stringify([processedData.amenities]);
      }
    }

    // Remove undefined contact field if present
    const contactData = {};
    if (
      typeof processedData.contact === "string" &&
      processedData.contact.trim() !== ""
    ) {
      contactData.contact = processedData.contact;
    }

    const venueData = {
      name: processedData.name,
      location: processedData.location,
      description: processedData.description,
      capacity: Number(processedData.capacity),
      amenities: amenitiesString,
      price: Number(processedData.price),
      images: imagesField,
      providerId: userId,
      eventTypes: singleEventType,
      ...contactData
    };
    console.log('Venue creation data:', venueData);

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
            images: imagesField,
            providerId: userId,
            serviceType,
            portfolio: processedData.portfolio,
            ...contactData
          },
        });
        break;
      case "VENUE":
        newService = await prisma.venue.create({ data: venueData });
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
            images: imagesField,
            providerId: userId,
            dietaryOptions: Array.isArray(processedData.dietaryOptions) ? processedData.dietaryOptions.join(",") : processedData.dietaryOptions,
            serviceType,
            ...contactData
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
            images: imagesField,
            providerId: userId,
            eventTypes: singleEventType,
            portfolio: processedData.portfolio,
            ...contactData
          },
        });
        break;
    }
    if (!user.serviceType) {
      await prisma.user.update({
        where: { id: userId },
        data: { serviceType: serviceType }
      });
    }
    res.status(201).json({ message: "Service registered successfully", service: newService });
  } catch (error) {
    console.error("Error in registerService:", error);
    res.status(500).json({ message: error.message });
  }
};

const getServiceType = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ serviceType: user.serviceType });
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
      serviceType: user.serviceType,
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
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.serviceType) return res.json({ canProceed: true, message: "You can register any service type" });
    if (user.serviceType !== serviceType) {
      return res.json({
        canProceed: false,
        message: `You are registered as a ${user.serviceType} provider. You cannot register services in multiple categories.`,
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
  getServiceType,
  upload
};