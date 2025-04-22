const axios = require('axios');

const getRecommendations = async ({ budget, location, guests, eventType, serviceType, userId }) => {
  try {
    const response = await axios.post('http://localhost:5001/recommend', {
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
