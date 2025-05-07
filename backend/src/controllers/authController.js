const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const prisma = new PrismaClient();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "../../uploads/verification");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `verification-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register route
const register = async (req, res) => {
  try {
    upload.single("verificationDocument")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      const { name, email, password, role, phone, serviceType } = req.body;

      const userExists = await prisma.user.findUnique({ where: { email } });
      if (userExists) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "User already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userData = {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role || "USER",
        profile: { create: {} },
      };

      if (role === "PROVIDER") {
        if (!req.file) {
          return res.status(400).json({
            message: "Verification document is required for provider registration",
          });
        }

        userData.providerStatus = "PENDING";
        userData.verificationDoc = req.file.filename;
        userData.serviceType = serviceType; 
      }

      const user = await prisma.user.create({ data: userData });

      if (user) {
        res.status(201).json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          providerStatus: user.providerStatus,
          providerType: user.serviceType || null, 
          token: generateToken(user.id),
        });
      } else {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(400).json({ message: "Invalid user data" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login route
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
        providerStatus: user.providerStatus,
        providerType: user.serviceType || null,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user (me) route
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
      providerStatus: user.providerStatus,
      providerType: user.serviceType || null,
      profile: user.profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe };