const { getRecommendations } = require("../services/recommendationService");

const getRecommendationsController = async (req, res) => {
  try {
    const { budget, guests, eventTypes, serviceType } = req.body;

    // Check if all required fields are present
    if (!budget || !guests || !eventTypes || !serviceType) {
      return res.status(400).json({
        message: "Missing required parameters",
      });
    }

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Not authorized, user not found",
      });
    }

    const eventType = Array.isArray(eventTypes) ? eventTypes[0] : eventTypes;

    
    const recommendations = await getRecommendations({
      budget,
      guests,
      eventType,
      serviceType,
      userId: req.user.id,
    });

    res.json({
      recommendations,
      metadata: {
        total_results: {
          best_match: recommendations.best_match.length,
          above_budget: recommendations.above_budget.length,
          below_budget: recommendations.below_budget.length,
        },
        filters_applied: {
          budget,
          guests,
          eventType,
          serviceType,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in recommendation controller:", error);
    res.status(500).json({
      message: "Internal Server Error",
      details: error.message,
    });
  }
};

module.exports = { getRecommendationsController };