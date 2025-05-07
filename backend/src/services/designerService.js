
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Get all designers with filtering options
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} - Array of designers
 */
const getDesigners = async (filters = {}) => {
  try {
    const {
      location,
      style,
      eventType,
      status = "APPROVED",
      page = 1,
      limit = 10,
      sortBy = "price_asc",
    } = filters;

    // Build where clause
    const where = { status };

    if (location) {
      where.location = { contains: location };
    }

    if (style) {
      where.style = style;
    }

    if (eventType) {
      where.eventTypes = { contains: eventType };
    }

    // Determine sort order
    let orderBy = {};
    switch (sortBy) {
      case "price_desc":
        orderBy = { priceRange: "desc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "price_asc":
      default:
        orderBy = { priceRange: "asc" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get designers
    const designers = await prisma.designer.findMany({
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
    });

    // Add images placeholder for now
    const enhancedDesigners = designers.map((designer) => ({
      ...designer,
      images: designer.images || ["https://example.com/designer1.jpg", "https://example.com/designer2.jpg"],
    }));

    // Get total count for pagination
    const total = await prisma.designer.count({ where });

    return {
      designers: enhancedDesigners,
      total,
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error getting designers:", error);
    throw error;
  }
};

// Export updated functions
module.exports = {
  getDesigners,
};
