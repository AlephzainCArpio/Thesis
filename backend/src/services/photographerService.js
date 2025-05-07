const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

/**
 * Get all photographers with filtering options
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} - Array of photographers
 */
const getPhotographers = async (filters = {}) => {
  try {
    const { location, style, serviceType, status = "APPROVED", page = 1, limit = 10, sortBy = "price_asc" } = filters

    // clause
    const where = { status }

    if (location) {
      where.location = { contains: location }
    }

    if (style) {
      where.style = style
    }

    if (serviceType) {
      where.serviceType = serviceType
    }

    // Determine sort order
    let orderBy = {}
    switch (sortBy) {
      case "price_desc":
        orderBy = { priceRange: "desc" }
        break
      case "experience_asc":
        orderBy = { experienceYears: "asc" }
        break
      case "experience_desc":
        orderBy = { experienceYears: "desc" }
        break
      case "name_asc":
        orderBy = { name: "asc" }
        break
      case "price_asc":
      default:
        orderBy = { priceRange: "asc" }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get photographers
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
      orderBy,
      skip,
      take: Number.parseInt(limit),
    })

    // Get total count for pagination
    const total = await prisma.photographer.count({ where })

    return {
      photographers,
      total,
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error("Error getting photographers:", error)
    throw error
  }
}

/**
 * Get photographer by ID
 * @param {string} id - Photographer ID
 * @param {string} userId - User ID (optional, for authorization)
 * @returns {Promise<Object>} - Photographer object
 */
const getPhotographerById = async (id, userId = null) => {
  try {
    const photographer = await prisma.photographer.findUnique({
      where: { id },
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
      throw new Error("Photographer not found")
    }

    // Don't return unapproved photographers unless it's the owner or an admin
    if (photographer.status !== "APPROVED") {
      if (!userId) {
        throw new Error("Photographer not found")
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (user.id !== photographer.providerId && user.role !== "ADMIN") {
        throw new Error("Photographer not found")
      }
    }

    return photographer
  } catch (error) {
    console.error("Error getting photographer by ID:", error)
    throw error
  }
}

/**
 * Create a new photographer
 * @param {Object} photographerData - Photographer data
 * @param {string} providerId - Provider ID
 * @param {string} userRole - User role
 * @returns {Promise<Object>} - Created photographer
 */
const createPhotographer = async (photographerData, providerId, userRole) => {
  try {
    const { name, description, location, style, experienceYears, priceRange, copyType, serviceType, portfolio } =
      photographerData

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
        providerId,
        status: userRole === "ADMIN" ? "APPROVED" : "PENDING",
      },
    })

    return photographer
  } catch (error) {
    console.error("Error creating photographer:", error)
    throw error
  }
}

/**
 * Update an existing photographer
 * @param {string} id - Photographer ID
 * @param {Object} photographerData - Updated photographer data
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @returns {Promise<Object>} - Updated photographer
 */
const updatePhotographer = async (id, photographerData, userId, userRole) => {
  try {
    const photographer = await prisma.photographer.findUnique({
      where: { id },
    })

    if (!photographer) {
      throw new Error("Photographer not found")
    }

    // Check if user is provider of this photographer or an admin
    if (photographer.providerId !== userId && userRole !== "ADMIN") {
      throw new Error("Not authorized")
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
    } = photographerData

    const updatedPhotographer = await prisma.photographer.update({
      where: { id },
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
        status: userRole === "ADMIN" ? status : photographer.status,
      },
    })

    return updatedPhotographer
  } catch (error) {
    console.error("Error updating photographer:", error)
    throw error
  }
}

/**
 * Delete a photographer
 * @param {string} id - Photographer ID
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @returns {Promise<Object>} - Deleted photographer
 */
const deletePhotographer = async (id, userId, userRole) => {
  try {
    const photographer = await prisma.photographer.findUnique({
      where: { id },
    })

    if (!photographer) {
      throw new Error("Photographer not found")
    }

    // Check if user is provider of this photographer or an admin
    if (photographer.providerId !== userId && userRole !== "ADMIN") {
      throw new Error("Not authorized")
    }

    await prisma.photographer.delete({
      where: { id },
    })

    return { message: "Photographer removed" }
  } catch (error) {
    console.error("Error deleting photographer:", error)
    throw error
  }
}

/**
 * Record a view of a photographer
 * @param {string} id - Photographer ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - View record
 */
const recordPhotographerView = async (id, userId) => {
  try {
    // Check if photographer exists
    const photographer = await prisma.photographer.findUnique({
      where: { id },
    })

    if (!photographer) {
      throw new Error("Photographer not found")
    }

    // Record the view
    const view = await prisma.viewHistory.create({
      data: {
        userId,
        photographerId: id,
      },
    })

    return view
  } catch (error) {
    console.error("Error recording photographer view:", error)
    throw error
  }
}

module.exports = {
  getPhotographers,
  getPhotographerById,
  createPhotographer,
  updatePhotographer,
  deletePhotographer,
  recordPhotographerView,
}