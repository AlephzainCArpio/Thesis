const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  getDesigners,
  getDesignerById,
  createDesigner,
  updateDesigner,
  deleteDesigner,
  viewDesigner,
} = require("../controllers/designerController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/designers/');
  },
  filename: function (req, file, cb) {
    cb(null, `designer-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const router = express.Router();

router.get("/", getDesigners);
router.get("/:id", getDesignerById);
router.post("/", protect, authorize("PROVIDER", "ADMIN"), upload.array('images', 5), createDesigner);
router.put("/:id", protect, authorize("PROVIDER", "ADMIN"), upload.array('images', 5), updateDesigner);
router.delete("/:id", protect, authorize("PROVIDER", "ADMIN"), deleteDesigner);
router.post("/:id/view", protect, viewDesigner);

module.exports = router;