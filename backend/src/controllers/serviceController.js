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
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(401).json({ message: "Unauthorized: Admin access required" });
    }

    upload.array("images", 5)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const serviceData = {
        serviceType: req.body.serviceType,
        name: req.body.name,
        description: req.body.description,
        location: req.body.location,
        status: "APPROVED", // Automatically mark as approved
        images: req.files ? req.files.map((file) => file.filename) : [],
      };

      const service = await prisma.service.create({
        data: serviceData,
      });

      res.status(201).json(service);
    });
  } catch (error) {
    console.error("Error in registerService:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all services
const getServices = async (req, res) => {
  try {
    // Fetch approved services from the database
    const services = await prisma.service.findMany({
      where: {
        status: 'APPROVED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Respond with the list of services
    res.status(200).json(services);
  } catch (error) {
    console.error("Error in getServices:", error); // Log the error
    res.status(500).json({ message: "Internal server error while retrieving services" });
  }
};

// Get service by ID
const getServiceById = async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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
        userId: req.user.id,
        status: 'APPROVED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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
  getProviderServices,
};