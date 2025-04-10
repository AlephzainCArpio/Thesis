const express = require("express")
const {
  getCaterings,
  getCateringById,
  createCatering,
  updateCatering,
  deleteCatering,
  viewCatering,
} = require("../controllers/cateringController")
const { protect, authorize } = require("../middlewares/authMiddleware")

const router = express.Router()

router.get("/", getCaterings)
router.get("/:id", getCateringById)
router.post("/", protect, authorize("PROVIDER", "ADMIN"), createCatering)
router.put("/:id", protect, authorize("PROVIDER", "ADMIN"), updateCatering)
router.delete("/:id", protect, authorize("PROVIDER", "ADMIN"), deleteCatering)
router.post("/:id/view", protect, viewCatering)

module.exports = router
