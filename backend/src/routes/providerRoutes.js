const express = require("express");
const router = express.Router();
const { 
  register,
  login,
  getMe,
  getServiceType,
  validateServiceRegistration,
  registerService,
  upload,
  getMyServices
} = require("../controllers/providerController");
const { protect } = require("../middlewares/authMiddleware");

// Auth routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.use(protect);
router.get("/me", getMe);
router.get("/service-type", getServiceType);
router.post("/validate-service", validateServiceRegistration);
router.post("/register-service", upload.array('images', 5), registerService);
router.get("/services", getMyServices);

module.exports = router;
