const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createUploadDir = (folder) => {
  const baseUploadDir = path.join(__dirname, '../../uploads');
  const dir = path.join(baseUploadDir, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const storage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = createUploadDir(folder);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const isValid = allowedTypes.test(file.mimetype) && allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png) are allowed!'));
  }
};

const uploadFiles = (folder, maxFiles = 5) => multer({
  storage: storage(folder),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: maxFiles,
  }
}).array('images', maxFiles);

const handleUpload = (folder) => (req, res, next) => {
  uploadFiles(folder)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ status: 'error', message: 'File too large (max 5MB)' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ status: 'error', message: 'Too many files (max 5)' });
        }
        return res.status(400).json({ status: 'error', message: 'Upload error', error: err.message });
      }
      return res.status(400).json({ status: 'error', message: err.message });
    }

    if (req.files) {
      req.filePaths = req.files.map(file =>
        path.relative(path.join(__dirname, '../../uploads'), file.path).replace(/\\/g, '/')
      );
    }

    next();
  });
};

module.exports = {
  handleUpload,
};
