const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { getRecommendationsController } = require("../controllers/recommendationController");

// Apply the protect middleware
router.post("/recommendation", protect, getRecommendationsController);

module.exports = router;