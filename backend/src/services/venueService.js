const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

/**
 * Get all venues with filtering options
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} - Array of venues
 */
const getVenues = async (filters = {}) => {
  try {
    const {
      location,
      capacity,
      minPrice,
      maxPrice,
      status = "APPROVED",
      page = 1,
      limit = 10,
      sortBy = "price_asc",
    } = filters

    // Build where clause
    const where = { status }

    if (location) {
      where.location = { contains: location }
    }

    if (capacity) {
      where.capacity = { gte: Number.parseInt(capacity) }
    }

    if (minPrice) {
      where.price = { ...where.price, gte: Number.parseFloat(minPrice) }
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: Number.parseFloat(maxPrice) }
    }

    // Determine sort order
    let orderBy = {}
    switch (sortBy) {
      case "price_desc":
        orderBy = { price: "desc" }
        break
      case "capacity_asc":
        orderBy = { capacity: "asc" }
        break
      case "capacity_desc":
        orderBy = { capacity: "desc" }
        break
      case "name_asc":
        orderBy = { name: "asc" }
        break
      case "price_asc":
      default:
        orderBy = { price: "asc" }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get venues
    const venues = await prisma.venue.findMany({
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
    const total = await prisma.venue.count({ where })

    return {
      venues,
      total,
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error("Error getting venues:", error)
    throw error
  }
}

/**
 * Get venue by ID
 * @param {string} id - Venue ID
 * @param {string} userId - User ID (optional, for authorization)
 * @returns {Promise<Object>} - Venue object
 */
const getVenueById = async (id, userId = null) => {
  try {
    const venue = await prisma.venue.findUnique({
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

    if (!venue) {
      throw new Error("Venue not found")
    }

    // Don't return unapproved venues unless it's the owner or an admin
    if (venue.status !== "APPROVED") {
      if (!userId) {
        throw new Error("Venue not found")
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (user.id !== venue.providerId && user.role !== "ADMIN") {
        throw new Error("Venue not found")
      }
    }

    return venue
  } catch (error) {
    console.error("Error getting venue by ID:", error)
    throw error
  }
}

/**
 * Create a new venue
 * @param {Object} venueData - Venue data
 * @param {string} providerId - Provider ID
 * @param {string} userRole - User role
 * @returns {Promise<Object>} - Created venue
 */
const createVenue = async (venueData, providerId, userRole) => {
  try {
    const { name, description, location, capacity, price, amenities, images } = venueData

    const venue = await prisma.venue.create({
      data: {
        name,
        description,
        location,
        capacity: Number.parseInt(capacity),
        price: Number.parseFloat(price),
        amenities,
        images,
        providerId,
        status: userRole === "ADMIN" ? "APPROVED" : "PENDING",
      },
    })

    return venue
  } catch (error) {
    console.error("Error creating venue:", error)
    throw error
  }
}

/**
 * Update an existing venue
 * @param {string} id - Venue ID
 * @param {Object} venueData - Updated venue data
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @returns {Promise<Object>} - Updated venue
 */
const updateVenue = async (id, venueData, userId, userRole) => {
  try {
    const venue = await prisma.venue.findUnique({
      where: { id },
    })

    if (!venue) {
      throw new Error("Venue not found")
    }

    // Check if user is provider of this venue or an admin
    if (venue.providerId !== userId && userRole !== "ADMIN") {
      throw new Error("Not authorized")
    }

    const { name, description, location, capacity, price, amenities, images, status } = venueData

    const updatedVenue = await prisma.venue.update({
      where: { id },
      data: {
        name,
        description,
        location,
        capacity: Number.parseInt(capacity),
        price: Number.parseFloat(price),
        amenities,
        images,
        status: userRole === "ADMIN" ? status : venue.status,
      },
    })

    return updatedVenue
  } catch (error) {
    console.error("Error updating venue:", error)
    throw error
  }
}

/**
 * Delete a venue
 * @param {string} id - Venue ID
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @returns {Promise<Object>} - Deleted venue
 */
const deleteVenue = async (id, userId, userRole) => {
  try {
    const venue = await prisma.venue.findUnique({
      where: { id },
    })

    if (!venue) {
      throw new Error("Venue not found")
    }

    // Check if user is provider of this venue or an admin
    if (venue.providerId !== userId && userRole !== "ADMIN") {
      throw new Error("Not authorized")
    }

    await prisma.venue.delete({
      where: { id },
    })

    return { message: "Venue removed" }
  } catch (error) {
    console.error("Error deleting venue:", error)
    throw error
  }
}

/**
 * Record a view of a venue
 * @param {string} id - Venue ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - View record
 */
const recordVenueView = async (id, userId) => {
  try {
    // Check if venue exists
    const venue = await prisma.venue.findUnique({
      where: { id },
    })

    if (!venue) {
      throw new Error("Venue not found")
    }

    // Record the view
    const view = await prisma.viewHistory.create({
      data: {
        userId,
        venueId: id,
      },
    })

    return view
  } catch (error) {
    console.error("Error recording venue view:", error)
    throw error
  }
}

module.exports = {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  recordVenueView,
}