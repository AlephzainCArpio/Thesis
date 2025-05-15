const axios = require('axios');
require('dotenv').config();

const ALGORITHM_SERVICE_URL = process.env.ALGORITHM_SERVICE_URL;

const getRecommendations = async ({ budget, guests, eventTypes, serviceType, userId }) => {
  try {
    // Prepare the payload for the recommendation algorithm
    const payload = {
      budget: parseFloat(budget) || 0,
      guests: parseInt(guests) || 0,
      eventTypes: eventTypes || "", 
      serviceType: serviceType || "",
      userId: userId || "",
    };

    console.log("Calling recommendation service with payload:", payload);

    const response = await axios.post(`${ALGORITHM_SERVICE_URL}/recommendation`, payload)

    // Process the response
    const data = response.data;
    if (data && data.recommendations) {
      const recommendations = JSON.parse(data.recommendations)
      return {
        bestMatch: recommendations.best_match || [],
        aboveBudget: recommendations.above_budget || [],
        belowBudget: recommendations.below_budget || []
      };
    } else {
      throw new Error("Unexpected response format from recommendation service");
    }

  } catch (error) {
    console.error("Error calling Python recommendation service:", error.message);
    throw error;
  }
};

module.exports = {
  getRecommendations,
};