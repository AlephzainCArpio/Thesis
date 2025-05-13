const axios = require('axios');
require('dotenv').config();

const ALGORITHM_SERVICE_URL = process.env.ALGORITHM_SERVICE_URL;

const getRecommendations = async ({ budget, guests, eventType, serviceType, userId }) => {
  try {
    const response = await axios.post(`${ALGORITHM_SERVICE_URL}/recommendation`, {
      budget,
      guests,
      eventType,
      serviceType,
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