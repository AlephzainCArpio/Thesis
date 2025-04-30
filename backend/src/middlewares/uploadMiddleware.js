const fs = require('fs');
const path = require('path');
const multer = require('multer');

const createUploadMiddleware = (serviceType) => {
  const uploadDir = path.join(__dirname, `../../uploads/${serviceType}`);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, `${serviceType}-${Date.now()}${path.extname(file.originalname)}`);
    }
  });

  return multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept images only
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  });
};

module.exports = createUploadMiddleware;