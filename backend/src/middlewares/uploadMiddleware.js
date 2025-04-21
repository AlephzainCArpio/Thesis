const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Configure storage for different service types
const configureStorage = (serviceType) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsDir = path.join(__dirname, `../../uploads/${serviceType}`)
      // Ensure the directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }
      cb(null, uploadsDir)
    },
    filename: (req, file, cb) => {
      // Generate unique filename with original extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const ext = path.extname(file.originalname)
      cb(null, `${serviceType}-${uniqueSuffix}${ext}`)
    }
  })
}

// Image filter
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
}

// Create upload instances for each service type
const venueUpload = multer({
  storage: configureStorage('venues'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
})

const cateringUpload = multer({
  storage: configureStorage('caterings'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
})

const photographerUpload = multer({
  storage: configureStorage('photographers'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
})

const designerUpload = multer({
  storage: configureStorage('designers'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
})

// Helper function to process multiple files and return file paths
const processUploadedFiles = (files) => {
  if (!files || files.length === 0) return []
  return files.map(file => file.filename)
}

// Middleware to serve static images
const serveImage = (serviceType) => {
  return (req, res) => {
    const { filename } = req.params
    const filePath = path.join(__dirname, `../../uploads/${serviceType}`, filename)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Image not found" })
    }

    res.sendFile(filePath)
  }
}

module.exports = {
  venueUpload,
  cateringUpload,
  photographerUpload,
  designerUpload,
  processUploadedFiles,
  serveImage
}
