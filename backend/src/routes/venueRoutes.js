const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  viewVenue,
} = require("../controllers/venueController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/venues/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// Main Routes
router.get("/", getVenues);
router.get("/:id", getVenueById);

// Create Venue with Images
router.post(
  "/",
  protect,
  authorize("PROVIDER", "ADMIN"),
  upload.array("images", 5),
  createVenue
);

// Update Venue with New Images
router.put(
  "/:id",
  protect,
  authorize("PROVIDER", "ADMIN"),
  upload.array("images", 5),
  updateVenue
);

// Delete Venue
router.delete("/:id", protect, authorize("PROVIDER", "ADMIN"), deleteVenue);

// View count route
router.post("/:id/view", protect, viewVenue);

module.exports = router;
