const express = require("express");
const { getProfile, updateProfile, getViewHistory, getDashboard } = require("../controllers/userController");
const favoriteController = require("../controllers/favoriteController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Profile routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/history", protect, getViewHistory);
router.get("/dashboard", protect, getDashboard);

// Favorites routes
router.post("/favorites", protect, favoriteController.toggleFavorite);
router.get("/favorites/check", protect, favoriteController.checkFavorite);
router.get("/favorites", protect, favoriteController.getFavorites);
router.delete("/favorites/:type/:id", protect, favoriteController.deleteFavorite);

module.exports = router;