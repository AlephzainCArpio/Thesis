const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getPendingServices,
  approveService,
  rejectService,
  getPendingProviders,
  getVerificationDocument,
  approveProvider,
  rejectProvider,
  getAdminVenues,
  getAdminCaterings,
  getAdminPhotographers,
  getAdminDesigners,
  approveVenueDirect,
  rejectVenueDirect,
  updateVenue,
  deleteVenue,
  approveCateringDirect,
  rejectCateringDirect,
  updateCatering,
  deleteCatering,
  approvePhotographerDirect,
  rejectPhotographerDirect,
  updatePhotographer,
  deletePhotographer,
  approveDesignerDirect,
  rejectDesignerDirect,
  updateDesigner,
  deleteDesigner,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect, authorize("ADMIN"));

// USERS
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// SERVICES (generic approve/reject)
router.get("/pending", getPendingServices);
router.put("/approve/:serviceType/:id", approveService);
router.put("/reject/:serviceType/:id", rejectService);

// ADMIN GET ALL
router.get("/venues", getAdminVenues);
router.get("/caterings", getAdminCaterings);
router.get("/photographers", getAdminPhotographers);
router.get("/designers", getAdminDesigners);

// PROVIDERS
router.get("/pending-providers", getPendingProviders);
router.get("/verification-document/:id", getVerificationDocument);
router.put("/approve-provider/:id", approveProvider);
router.put("/reject-provider/:id", rejectProvider);

// VENUES RESTFUL
router.put("/venues/:id/approve", approveVenueDirect);
router.put("/venues/:id/reject", rejectVenueDirect);
router.put("/venues/:id", updateVenue);
router.delete("/venues/:id", deleteVenue);

// CATERINGS RESTFUL
router.put("/caterings/:id/approve", approveCateringDirect);
router.put("/caterings/:id/reject", rejectCateringDirect);
router.put("/caterings/:id", updateCatering);
router.delete("/caterings/:id", deleteCatering);

// PHOTOGRAPHERS RESTFUL
router.put("/photographers/:id/approve", approvePhotographerDirect);
router.put("/photographers/:id/reject", rejectPhotographerDirect);
router.put("/photographers/:id", updatePhotographer);
router.delete("/photographers/:id", deletePhotographer);

// DESIGNERS RESTFUL
router.put("/designers/:id/approve", approveDesignerDirect);
router.put("/designers/:id/reject", rejectDesignerDirect);
router.put("/designers/:id", updateDesigner);
router.delete("/designers/:id", deleteDesigner);

module.exports = router;