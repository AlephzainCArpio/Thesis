const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { getRecommendationsController } = require("../controllers/recommendationController");


router.post("/recommendation", protect, getRecommendationsController);

module.exports = router;