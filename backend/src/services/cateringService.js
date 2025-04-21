const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Get all caterings with filtering options
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array>} - Array of caterings
 */
const getCaterings = async (filters = {}) => {
  try {
    const {
      location,
      maxPeople,
      minPricePerPerson,
      maxPricePerPerson,
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

    if (maxPeople) {
      where.maxPeople = { gte: Number.parseInt(maxPeople) };
    }

    if (minPricePerPerson) {
      where.pricePerPerson = { ...where.pricePerPerson, gte: Number.parseFloat(minPricePerPerson) };
    }

    if (maxPricePerPerson) {
      where.pricePerPerson = { ...where.pricePerPerson, lte: Number.parseFloat(maxPricePerPerson) };
    }

    // Determine sort order
    let orderBy = {};
    switch (sortBy) {
      case "price_desc":
        orderBy = { pricePerPerson: "desc" };
        break;
      case "maxPeople_asc":
        orderBy = { maxPeople: "asc" };
        break;
      case "maxPeople_desc":
        orderBy = { maxPeople: "desc" };
        break;
      case "name_asc":
        orderBy = { name: "asc" };
        break;
      case "price_asc":
      default:
        orderBy = { pricePerPerson: "asc" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get caterings
    const caterings = await prisma.catering.findMany({
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
    const enhancedCaterings = caterings.map((catering) => ({
      ...catering,
      images: catering.images || ["https://example.com/catering1.jpg", "https://example.com/catering2.jpg"],
    }));

    // Get total count for pagination
    const total = await prisma.catering.count({ where });

    return {
      caterings: enhancedCaterings,
      total,
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error getting caterings:", error);
    throw error;
  }
};

// Export updated functions
module.exports = {
  getCaterings,
};