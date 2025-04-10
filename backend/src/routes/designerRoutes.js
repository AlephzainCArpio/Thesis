const express = require("express")
const {
  getDesigners,
  getDesignerById,
  createDesigner,
  updateDesigner,
  deleteDesigner,
  viewDesigner,
} = require("../controllers/designerController")
const { protect, authorize } = require("../middlewares/authMiddleware")

const router = express.Router()

router.get("/", getDesigners)
router.get("/:id", getDesignerById)
router.post("/", protect, authorize("PROVIDER", "ADMIN"), createDesigner)
router.put("/:id", protect, authorize("PROVIDER", "ADMIN"), updateDesigner)
router.delete("/:id", protect, authorize("PROVIDER", "ADMIN"), deleteDesigner)
router.post("/:id/view", protect, viewDesigner)

module.exports = router
