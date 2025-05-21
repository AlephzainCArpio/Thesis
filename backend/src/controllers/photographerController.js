const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

// Helper function to parse portfolio
const parsePortfolio = (portfolioInput) => {
  try {
    const parsed = typeof portfolioInput === "string" ? JSON.parse(portfolioInput) : portfolioInput
    return Array.isArray(parsed) ? JSON.stringify(parsed) : JSON.stringify([])
  } catch {
    return JSON.stringify([])
  }
}

// Get all photographers based on query parameters
const getPhotographers = async (req, res) => {
  try {
    const { location, style, serviceType, status } = req.query

    const where = {
      status: status || "APPROVED",
    }

    if (location) {
      where.location = { contains: location }
    }

    if (style) {
      where.style = style
    }

    if (serviceType) {
      where.serviceType = serviceType
    }

    const photographers = await prisma.photographer.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    res.json(photographers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get a single photographer by ID
const getPhotographerById = async (req, res) => {
  try {
    const photographer = await prisma.photographer.findUnique({
      where: { id: req.params.id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }

    // Check if photographer is approved or if the user is authorized to view
    if (
      photographer.status !== "APPROVED" &&
      (!req.user || (req.user.id !== photographer.providerId && req.user.role !== "ADMIN"))
    ) {
      return res.status(404).json({ message: "Photographer not found" })
    }

    res.json(photographer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create a new photographer
const createPhotographer = async (req, res) => {
  try {
    let images = null;
    if (req.files && req.files.length > 0) {
      images = JSON.stringify(req.files.map(f => f.filename));
    } else if (req.body.images) {
      images = req.body.images;
    }
    const { name, description, location, style, experienceYears, priceRange, copyType, serviceType, portfolio } =
      req.body

    const parsedPortfolio = parsePortfolio(portfolio)

    const photographer = await prisma.photographer.create({
      data: {
        name,
        description,
        location,
        style,
        experienceYears: Number.parseInt(experienceYears),
        priceRange,
        copyType,
        serviceType,
        portfolio: parsedPortfolio,
        images: images || null,
        providerId: req.user.id,
        status: req.user.role === "ADMIN" ? "APPROVED" : "PENDING",
      },
    })

    res.status(201).json(photographer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update a photographer's details
const updatePhotographer = async (req, res) => {
  try {
    const photographer = await prisma.photographer.findUnique({
      where: { id: req.params.id },
    })

    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }

    // Check if user is provider of this photographer or an admin
    if (photographer.providerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" })
    }

    let images = undefined;
    if (req.files && req.files.length > 0) {
      images = JSON.stringify(req.files.map(f => f.filename));
    } else if (req.body.images) {
      images = req.body.images;
    }

    const {
      name,
      description,
      location,
      style,
      experienceYears,
      priceRange,
      copyType,
      serviceType,
      portfolio,
      status,
    } = req.body

    const parsedPortfolio = parsePortfolio(portfolio)

    const updatedPhotographer = await prisma.photographer.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        location,
        style,
        experienceYears: Number.parseInt(experienceYears),
        priceRange,
        copyType,
        serviceType,
        portfolio: parsedPortfolio,
        images,
        status: req.user.role === "ADMIN" ? status : photographer.status,
      },
    })

    res.json(updatedPhotographer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete a photographer from the system
const deletePhotographer = async (req, res) => {
  try {
    const photographer = await prisma.photographer.findUnique({
      where: { id: req.params.id },
    })

    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }

    // Check if user is provider of this photographer or an admin
    if (photographer.providerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" })
    }

    await prisma.photographer.delete({
      where: { id: req.params.id },
    })

    res.json({ message: "Photographer removed" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Record a photographer's view
const viewPhotographer = async (req, res) => {
  try {
    // Check if photographer exists
    const photographer = await prisma.photographer.findUnique({
      where: { id: req.params.id },
    })

    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }

    // Record the view
    await prisma.viewHistory.create({
      data: {
        userId: req.user.id,
        photographerId: req.params.id,
      },
    })

    res.status(200).json({ message: "View recorded" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getPhotographers,
  getPhotographerById,
  createPhotographer,
  updatePhotographer,
  deletePhotographer,
  viewPhotographer,
}