const express = require("express")
const {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  viewVenue,
} = require("../controllers/venueController")
const { protect, authorize } = require("../middlewares/authMiddleware")

const router = express.Router()

router.get("/", getVenues)
router.get("/:id", getVenueById)
router.post("/", protect, authorize("PROVIDER", "ADMIN"), createVenue)
router.put("/:id", protect, authorize("PROVIDER", "ADMIN"), updateVenue)
router.delete("/:id", protect, authorize("PROVIDER", "ADMIN"), deleteVenue)
router.post("/:id/view", protect, viewVenue)

module.exports = router
