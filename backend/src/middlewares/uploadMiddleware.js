const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage based on service type
const configureStorage = (serviceType) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsDir = path.join(__dirname, `../../uploads/${serviceType}`);
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `${serviceType}-${uniqueSuffix}${ext}`);
    },
  });
};

module.exports = {
  configureStorage,
};