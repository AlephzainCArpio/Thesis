const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  getCaterings,
  getCateringById,
  createCatering,
  updateCatering,
  deleteCatering,
  viewCatering,
} = require("../controllers/cateringController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/catering/');
  },
  filename: function (req, file, cb) {
    cb(null, `catering-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
});

const router = express.Router();

router.get("/", getCaterings);
router.get("/:id", getCateringById);
router.post("/", protect, authorize("PROVIDER", "ADMIN"), upload.array('images', 5), createCatering);
router.put("/:id", protect, authorize("PROVIDER", "ADMIN"), upload.array('images', 5), updateCatering);
router.delete("/:id", protect, authorize("PROVIDER", "ADMIN"), deleteCatering);
router.post("/:id/view", protect, viewCatering);

module.exports = router;