const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper: Format arrays from JSON strings
const formatArrayFields = (catering) => ({
  ...catering,
  dietaryOptions: catering.dietaryOptions ? JSON.parse(catering.dietaryOptions) : [],
  images: catering.images ? JSON.parse(catering.images) : [],
});

// GET /caterings
const getCaterings = async (req, res) => {
  try {
    const { location, maxPeople, cuisineType, serviceType, status } = req.query;

    const where = {
      status: status || "APPROVED",
    };

    if (location) where.location = { contains: location };
    if (maxPeople) where.maxPeople = { gte: Number.parseInt(maxPeople) };
    if (cuisineType) where.cuisineType = cuisineType;
    if (serviceType) where.serviceType = serviceType;

    const caterings = await prisma.catering.findMany({
      where,
      include: {
        provider: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(caterings.map(formatArrayFields));
  } catch (error) {
    console.error("Catering error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /caterings/:id
const getCateringById = async (req, res) => {
  try {
    const catering = await prisma.catering.findUnique({
      where: { id: req.params.id },
      include: {
        provider: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!catering) return res.status(404).json({ message: "Catering not found" });

    // Restrict viewing unapproved caterings
    if (
      catering.status !== "APPROVED" &&
      (!req.user || (req.user.id !== catering.providerId && req.user.role !== "ADMIN"))
    ) {
      return res.status(404).json({ message: "Catering not found" });
    }

    res.json(formatArrayFields(catering));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /caterings
const createCatering = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      maxPeople,
      pricePerPerson,
      cuisineType,
      serviceType,
      dietaryOptions,
      images,
    } = req.body;

    if (!name || !description || !location || !maxPeople || !pricePerPerson || !cuisineType || !serviceType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const catering = await prisma.catering.create({
      data: {
        name,
        description,
        location,
        maxPeople: Number.parseInt(maxPeople),
        pricePerPerson: Number.parseFloat(pricePerPerson),
        cuisineType,
        serviceType,
        dietaryOptions: Array.isArray(dietaryOptions) ? JSON.stringify(dietaryOptions) : JSON.stringify([]),
        images: Array.isArray(images) ? JSON.stringify(images) : JSON.stringify([]),
        providerId: req.user.id,
        status: req.user.role === "ADMIN" ? "APPROVED" : "PENDING",
      },
    });

    res.status(201).json(catering);
  } catch (error) {
    console.error("Error creating catering:", error);
    res.status(500).json({ message: error.message });
  }
};

// PUT /caterings/:id
const updateCatering = async (req, res) => {
  try {
    const catering = await prisma.catering.findUnique({
      where: { id: req.params.id },
    });

    if (!catering) return res.status(404).json({ message: "Catering not found" });

    if (catering.providerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const {
      name,
      description,
      location,
      maxPeople,
      pricePerPerson,
      cuisineType,
      serviceType,
      dietaryOptions,
      images,
      status,
    } = req.body;

    const updatedCatering = await prisma.catering.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        location,
        maxPeople: Number.parseInt(maxPeople),
        pricePerPerson: Number.parseFloat(pricePerPerson),
        cuisineType,
        serviceType,
        dietaryOptions: Array.isArray(dietaryOptions)
          ? JSON.stringify(dietaryOptions)
          : catering.dietaryOptions,
        images: Array.isArray(images) ? JSON.stringify(images) : catering.images,
        status: req.user.role === "ADMIN" ? status : catering.status,
      },
    });

    res.json(updatedCatering);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /caterings/:id
const deleteCatering = async (req, res) => {
  try {
    const catering = await prisma.catering.findUnique({
      where: { id: req.params.id },
    });

    if (!catering) return res.status(404).json({ message: "Catering not found" });

    if (catering.providerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.catering.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Catering removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /caterings/:id/view
const viewCatering = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const catering = await prisma.catering.findUnique({
      where: { id: req.params.id },
    });

    if (!catering) return res.status(404).json({ message: "Catering not found" });

    await prisma.viewHistory.create({
      data: {
        userId: req.user.id,
        cateringId: req.params.id,
      },
    });

    res.status(200).json({ message: "View recorded" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCaterings,
  getCateringById,
  createCatering,
  updateCatering,
  deleteCatering,
  viewCatering,
};
