const multer = require('multer');
const path = require('path');
const fs = require('fs');


const createServiceDirectories = () => {
  const serviceTypes = ['venues', 'photographers', 'designers', 'caterings'];
  const baseUploadDir = path.join(__dirname, '../../uploads');

  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

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
    // Extract the service type from the URL and determine the destination folder
    const urlParts = req.originalUrl.split('/');
    const serviceType = urlParts[urlParts.length - 1].replace(/s$/, 's'); 
    const uploadDir = path.join(__dirname, `../../uploads/${serviceType}`);
    
    // Create service-specific folder if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Specify the destination for file uploads
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with a timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase(); // Get the file extension (e.g., .jpg)
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// File filter to ensure only image files are uploaded
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/; // Allowed image types
  const mimetype = allowedTypes.test(file.mimetype); // Validate MIME type
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase()); // Validate file extension

  if (mimetype && extname) {
    return cb(null, true); // Allow file upload
  }
  cb(new Error('Only image files (jpg, jpeg, png) are allowed!')); // Reject non-image files
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB size limit
    files: 5 // Maximum 5 files per upload
  }
});

// Middleware to handle file uploads and save file paths
const handleUpload = async (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific error handling
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
      // Handle other errors
      return res.status(400).json({
        status: 'error',
        message: err.message
      });
    }

    // After the files are uploaded, store the file paths in req.filePaths
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

module.exports = {
  handleUpload
};
