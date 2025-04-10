const express = require("express")
const { getProfile, updateProfile, getViewHistory } = require("../controllers/userController")
const { protect } = require("../middlewares/authMiddleware")

const router = express.Router()

router.get("/profile", protect, getProfile)
router.put("/profile", protect, updateProfile)
router.get("/history", protect, getViewHistory)

module.exports = router
