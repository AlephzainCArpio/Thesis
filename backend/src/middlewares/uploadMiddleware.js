const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories for each service type
const createServiceDirectories = () => {
  const serviceTypes = ['venues', 'photographers', 'designers', 'caterings'];
  const baseUploadDir = path.join(__dirname, '../../uploads');

  // Create base uploads directory if it doesn't exist
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  // Create directories for each service type
  serviceTypes.forEach(serviceType => {
    const serviceDir = path.join(baseUploadDir, serviceType);
    if (!fs.existsSync(serviceDir)) {
      fs.mkdirSync(serviceDir, { recursive: true });
    }
  });
};

// Initialize directories
createServiceDirectories();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Extract service type from the request URL
    const urlParts = req.originalUrl.split('/');
    const serviceType = urlParts[urlParts.length - 1].replace(/s$/, 's'); // Ensure plural form
    const uploadDir = path.join(__dirname, `../../uploads/${serviceType}`);
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// File filter to validate image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'));
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files per upload
  }
});

// Middleware to handle file uploads
const handleUpload = async (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'error',
          message: 'File size too large. Maximum size is 5MB'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          status: 'error',
          message: 'Too many files. Maximum is 5 files'
        });
      }
      return res.status(400).json({
        status: 'error',
        message: 'File upload error',
        error: err.message
      });
    } else if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }
    
    // Add file paths to request
    if (req.files) {
      req.filePaths = req.files.map(file => {
        const relativePath = path.relative(
          path.join(__dirname, '../../uploads'),
          file.path
        );
        return relativePath.replace(/\\/g, '/'); // Convert Windows paths to URL format
      });
    }
    
    next();
  });
};

// Middleware to handle file deletion
const deleteFiles = async (files) => {
  if (!files || !Array.isArray(files)) return;

  for (const file of files) {
    const filePath = path.join(__dirname, '../../uploads', file);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }
};

module.exports = {
  handleUpload,
  deleteFiles
};