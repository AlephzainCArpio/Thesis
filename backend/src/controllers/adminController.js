const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");

// USERS
const getAllUsers = async (req, res) => {
  try {
    const { role, name, email } = req.query;

    const where = {};
    if (role) where.role = role;
    if (name) where.name = { contains: name };
    if (email) where.email = { contains: email };

    const users = await prisma.user.findMany({
      where,
      include: { profile: true },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        profile: true,
        venues: true,
        caterings: true,
        photographers: true,
        designers: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role, phone } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, email, role, phone },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    await prisma.user.delete({ where: { id: req.params.id } });

    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SERVICES
const getPendingServices = async (req, res) => {
  try {
    const [pendingVenues, pendingCaterings, pendingPhotographers, pendingDesigners] = await Promise.all([
      prisma.venue.findMany({ where: { status: "PENDING" }, include: { provider: true } }),
      prisma.catering.findMany({ where: { status: "PENDING" }, include: { provider: true } }),
      prisma.photographer.findMany({ where: { status: "PENDING" }, include: { provider: true } }),
      prisma.designer.findMany({ where: { status: "PENDING" }, include: { provider: true } }),
    ]);

    res.json({
      venues: pendingVenues,
      caterings: pendingCaterings,
      photographers: pendingPhotographers,
      designers: pendingDesigners,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveService = async (req, res) => {
  try {
    const { serviceType, id } = req.params;
    let result;

    switch (serviceType) {
      case "venue":
        result = await prisma.venue.update({ where: { id }, data: { status: "APPROVED" } });
        break;
      case "catering":
        result = await prisma.catering.update({ where: { id }, data: { status: "APPROVED" } });
        break;
      case "photographer":
        result = await prisma.photographer.update({ where: { id }, data: { status: "APPROVED" } });
        break;
      case "designer":
        result = await prisma.designer.update({ where: { id }, data: { status: "APPROVED" } });
        break;
      default:
        return res.status(400).json({ message: "Invalid service type" });
    }

    res.json({ message: `${serviceType} approved successfully`, result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectService = async (req, res) => {
  try {
    const { serviceType, id } = req.params;
    let result;

    switch (serviceType) {
      case "venue":
        result = await prisma.venue.update({ where: { id }, data: { status: "REJECTED" } });
        break;
      case "catering":
        result = await prisma.catering.update({ where: { id }, data: { status: "REJECTED" } });
        break;
      case "photographer":
        result = await prisma.photographer.update({ where: { id }, data: { status: "REJECTED" } });
        break;
      case "designer":
        result = await prisma.designer.update({ where: { id }, data: { status: "REJECTED" } });
        break;
      default:
        return res.status(400).json({ message: "Invalid service type" });
    }

    res.json({ message: `${serviceType} rejected`, result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PROVIDERS
const getPendingProviders = async (req, res) => {
  try {
    const pendingProviders = await prisma.user.findMany({
      where: {
        role: "PROVIDER",
        providerStatus: "PENDING",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        serviceType: true, // Ensure serviceType is included
        verificationDoc: true,
        createdAt: true,
      },
    });

    res.json(pendingProviders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVerificationDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { verificationDoc: true },
    });

    if (!user || !user.verificationDoc) {
      return res.status(404).json({ message: "Verification document not found" });
    }

    const filePath = path.join(__dirname, "../../uploads/verification", user.verificationDoc);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "PROVIDER" || user.providerStatus !== "PENDING") {
      return res.status(400).json({ message: "User is not a pending provider" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { providerStatus: "APPROVED" },
    });

    res.json({
      message: "Provider approved successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        providerStatus: updatedUser.providerStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "PROVIDER" || user.providerStatus !== "PENDING") {
      return res.status(400).json({ message: "User is not a pending provider" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: "USER",
        providerStatus: "REJECTED",
      },
    });

    res.json({
      message: "Provider rejected and downgraded to user",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        providerStatus: updatedUser.providerStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// VENUES
const getAdminVenues = async (req, res) => {
  try {
    const venues = await prisma.venue.findMany({
      include: { provider: true },
    });
    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch venues" });
  }
};

const getAdminCaterings = async (req, res) => {
  try {
    const caterings = await prisma.catering.findMany({
      include: { provider: true },
    });
    res.json(caterings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch caterings" });
  }
};

const getAdminPhotographers = async (req, res) => {
  try {
    const photographers = await prisma.photographer.findMany({
      include: { provider: true },
    });
    res.json(photographers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch photographers" });
  }
};

const getAdminDesigners = async (req, res) => {
  try {
    const designers = await prisma.designer.findMany({
      include: { provider: true },
    });
    res.json(designers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch designers" });
  }
};

module.exports = {
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
};