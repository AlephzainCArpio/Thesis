const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const { errorHandler } = require("./middlewares/errorHandlers")
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const venueRoutes = require("./routes/venueRoutes")
const cateringRoutes = require("./routes/cateringRoutes")
const photographerRoutes = require("./routes/photographerRoutes")
const designerRoutes = require("./routes/designerRoutes")
const adminRoutes = require("./routes/adminRoutes")
const recommendationRoutes = require("./routes/recommendationRoutes")
const publicRoutes = require("./routes/publicRoutes")

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/venues", venueRoutes)
app.use("/api/catering", cateringRoutes)
app.use("/api/photographers", photographerRoutes)
app.use("/api/designers", designerRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/recommendations", recommendationRoutes)
app.use("/api/public", publicRoutes)

// Error handling
app.use(errorHandler)

module.exports = app
