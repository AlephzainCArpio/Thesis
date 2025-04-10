const express = require("express")
const { getRecommendations } = require("../controllers/recommendationController")
const { protect } = require("../middlewares/authMiddleware")

const router = express.Router()

router.post("/", protect, getRecommendations)

module.exports = router
