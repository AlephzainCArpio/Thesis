const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register User
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, providerType } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationStatus = role === "PROVIDER" ? "PENDING_DOCUMENT" : "NOT_REQUIRED";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
        phone,
        providerType: providerType || null,
        verificationStatus,
        profile: { create: {} },
      },
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      providerType: user.providerType,
      verificationStatus: user.verificationStatus,
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        providerType: user.providerType,
        verificationStatus: user.verificationStatus,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      providerType: user.providerType,
      verificationStatus: user.verificationStatus,
      profile: user.profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Provider Type
const getProviderType = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ providerType: user.providerType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Validate Service Registration
const validateServiceRegistration = async (req, res) => {
  try {
    const { serviceType } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.providerType) {
      return res.json({ canProceed: true, message: "You can register any service type" });
    }

    if (user.providerType !== serviceType) {
      return res.json({
        canProceed: false,
        message: `You are registered as a ${user.providerType} provider. You cannot register services in multiple categories.`,
      });
    }

    res.json({ canProceed: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register Service
const registerService = async (req, res) => {
  try {
    const { serviceType, ...serviceData } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.providerType !== serviceType) {
      return res.status(400).json({ message: "Service type does not match your provider type." });
    }

    const newService = await prisma.service.create({
      data: {
        type: serviceType,
        providerId: req.user.id,
        ...serviceData,
        status: "PENDING", // Submitted for approval
      },
    });

    res.status(201).json({ message: "Service submitted for approval", newService });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register Provider with document
const registerProviderWithDocument = async (req, res) => {
  const { email, serviceType } = req.body;
  const verificationDoc = req.file?.filename;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser && existingUser.providerType) {
      return res.status(400).json({ error: 'Provider can only register one service type.' });
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        role: 'PENDING_PROVIDER',
        providerType: serviceType,
        verificationDoc,
        verificationStatus: 'PENDING_DOCUMENT',
      },
    });

    res.status(200).json({ message: 'Registration submitted successfully. Pending approval.', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register as provider', details: err.message });
  }
};


module.exports = {
  register,
  login,
  getMe,
  getProviderType,
  validateServiceRegistration,
  registerService,
  registerProviderWithDocument,
};

