const express = require("express")
const { uploadFile, serveFile } = require("../controllers/uploadController")
const { protect } = require("../middlewares/authMiddleware")

const router = express.Router()

// Route for uploading files
router.post("/", protect, uploadFile)

// Route for serving files
router.get("/:filename", serveFile)

module.exports = router