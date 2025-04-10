const axios = require("axios")
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

/**
 * Get recommendations from the algorithm service
 * @param {Object} params - Parameters for recommendation
 * @param {number} params.budget - User's budget
 * @param {string} params.location - User's preferred location
 * @param {number} params.guests - Number of guests
 * @param {string} params.eventType - Type of event (wedding, corporate, etc.)
 * @param {string} params.serviceType - Type of service (venue, catering, photographer, designer)
 * @param {string} params.userId - User ID for personalization
 * @returns {Promise<Object>} - Recommendations object
 */
const getRecommendations = async (params) => {
  try {
    // Call the Python algorithm service
    const algorithmServiceUrl = process.env.ALGORITHM_SERVICE_URL || "http://localhost:5001"
    const response = await axios.post(`${algorithmServiceUrl}/recommend`, params)
    return response.data.recommendations
  } catch (error) {
    console.error("Error calling recommendation algorithm:", error.message)

    // backup to basic recommendations if algorithm service is unavailable
    return await getBasicRecommendations(params)
  }
}

/**
 * backup method to get basic recommendations if the algorithm service is unavailable
 * @param {Object} params - Parameters for recommendation
 * @returns {Promise<Object>} - Basic recommendations object
 */
const getBasicRecommendations = async ({ budget, location, guests, eventType, serviceType }) => {
  try {
    let recommendations = []

    switch (serviceType.toLowerCase()) {
      case "venue":
        recommendations = await prisma.venue.findMany({
          where: {
            status: "APPROVED",
            price: { lte: budget },
            capacity: { gte: guests },
            location: { contains: location },
          },
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          take: 3,
        })
        break

      case "catering":
        recommendations = await prisma.catering.findMany({
          where: {
            status: "APPROVED",
            pricePerPerson: { lte: budget / guests },
            maxPeople: { gte: guests },
            location: { contains: location },
          },
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          take: 3,
        })
        break

      case "photographer":
        recommendations = await prisma.photographer.findMany({
          where: {
            status: "APPROVED",
            location: { contains: location },
          },
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          take: 3,
        })
        break

      case "designer":
        recommendations = await prisma.designer.findMany({
          where: {
            status: "APPROVED",
            location: { contains: location },
          },
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          take: 3,
        })
        break

      default:
        throw new Error(`Invalid service type: ${serviceType}`)
    }

    return recommendations
  } catch (error) {
    console.error("Error getting basic recommendations:", error)
    return []
  }
}

module.exports = {
  getRecommendations,
}
