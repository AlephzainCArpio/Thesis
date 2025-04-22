const express = require("express");
const { getProfile, updateProfile, getViewHistory, getDashboard } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/history", protect, getViewHistory);
router.get("/dashboard", protect, getDashboard);

module.exports = router;