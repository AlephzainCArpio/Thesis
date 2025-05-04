const axios = require('axios');
require('dotenv').config();

const getRecommendations = async ({ budget, location, guests, eventType, serviceType, userId }) => {
  try {
    const response = await axios.post(`${process.env.ALGORITHM_SERVICE_URL}/recommendation`, {
      budget,
      location,
      guests,
      eventType,
      serviceType,
      userId
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