const express = require("express")
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getPendingServices,
  approveService,
  rejectService,
  getDashboardStats,
  getPendingProviders,
  getVerificationDocument,
  approveProvider,
  rejectProvider
} = require("../controllers/adminController")
const { protect, authorize } = require("../middlewares/authMiddleware")

const router = express.Router()

// Protect all routes and authorize only admin
router.use(protect, authorize("ADMIN"))

// Existing routes
router.get("/users", getAllUsers)
router.get("/users/:id", getUserById)
router.put("/users/:id", updateUser)
router.delete("/users/:id", deleteUser)
router.get("/pending", getPendingServices)
router.put("/approve/:serviceType/:id", approveService)
router.put("/reject/:serviceType/:id", rejectService)
router.get("/stats", getDashboardStats)

// New provider management routes
router.get("/pending-providers", getPendingProviders)
router.get("/verification-document/:id", getVerificationDocument)
router.put("/approve-provider/:id", approveProvider)
router.put("/reject-provider/:id", rejectProvider)

module.exports = router