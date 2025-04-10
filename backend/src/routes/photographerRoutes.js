const express = require("express")
const {
  getPhotographers,
  getPhotographerById,
  createPhotographer,
  updatePhotographer,
  deletePhotographer,
  viewPhotographer,
} = require("../controllers/photographerController")
const { protect, authorize } = require("../middlewares/authMiddleware")

const router = express.Router()

router.get("/", getPhotographers)
router.get("/:id", getPhotographerById)
router.post("/", protect, authorize("PROVIDER", "ADMIN"), createPhotographer)
router.put("/:id", protect, authorize("PROVIDER", "ADMIN"), updatePhotographer)
router.delete("/:id", protect, authorize("PROVIDER", "ADMIN"), deletePhotographer)
router.post("/:id/view", protect, viewPhotographer)

module.exports = router
