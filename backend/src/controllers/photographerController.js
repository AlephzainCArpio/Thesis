const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
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

    // Don't return unapproved photographers unless it's the owner or an admin
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

const createPhotographer = async (req, res) => {
  try {
    const { name, description, location, style, experienceYears, priceRange, copyType, serviceType, portfolio } =
      req.body

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
        portfolio,
        providerId: req.user.id,
        status: req.user.role === "ADMIN" ? "APPROVED" : "PENDING",
      },
    })

    res.status(201).json(photographer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

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
        portfolio,
        status: req.user.role === "ADMIN" ? status : photographer.status,
      },
    })

    res.json(updatedPhotographer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

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
