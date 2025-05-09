const axios = require('axios');
require('dotenv').config();

const ALGORITHM_SERVICE_URL = process.env.ALGORITHM_SERVICE_URL;

const getRecommendations = async ({ budget, location, guests, eventType, serviceType, userId }) => {
  try {
    // Flatten serviceType if it's nested
    const flattenedServiceType = Array.isArray(serviceType[0]) ? serviceType.flat() : serviceType;

    const response = await axios.post(`${ALGORITHM_SERVICE_URL}/recommendation`, {
      budget,
      location,
      guests,
      eventType,
      serviceType: flattenedServiceType,
      userId,
    });

    return response.data.recommendations;
  } catch (error) {
    console.error("Error calling Python recommendation service:", error.message);
    throw error;
  }
};
module.exports = {
  getRecommendations,
};