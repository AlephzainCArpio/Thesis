const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const { errorHandler } = require("./middlewares/errorHandlers");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const venueRoutes = require("./routes/venueRoutes");
const cateringRoutes = require("./routes/cateringRoutes");
const photographerRoutes = require("./routes/photographerRoutes");
const designerRoutes = require("./routes/designerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const publicRoutes = require("./routes/publicRoutes");
const providerRoutes = require("./routes/providerRoutes");
const recommendationRoute = require('./routes/recommendationRoutes');

const fs = require("fs"); 

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Create uploads directories if they don't exist
const uploadDirs = ['venues', 'catering', 'photographers', 'designers'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, `../uploads/${dir}`);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/catering", cateringRoutes);
app.use("/api/photographers", photographerRoutes);
app.use("/api/designers", designerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/recommendation", recommendationRoute);

// Error handling
app.use(errorHandler);

module.exports = app;