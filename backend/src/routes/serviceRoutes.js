const express = require("express");
const {
  registerService,
  getServices,
  getServiceById,
  getProviderServices,
} = require("../controllers/serviceController");

const router = express.Router();

// POST: Register a new service
router.post("/", registerService);

// GET: Get all services
router.get("/", getServices);

// GET: Get provider's services
router.get("/provider-services", getProviderServices);

// GET: Get service by ID
router.get("/:id", getServiceById);

module.exports = router;