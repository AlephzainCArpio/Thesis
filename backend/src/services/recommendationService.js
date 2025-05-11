const { getRecommendations } = require("../services/recommendationService");

const getRecommendationsController = async (req, res) => {
  try {
    const { budget, location, guests, eventTypes, serviceType } = req.body;

    if (!budget || !location || !guests || !eventTypes || !serviceType) {
      return res.status(400).json({
        message: "Missing required parameters",
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Not authorized, user not found",
      });
    }

    const recommendations = await getRecommendations({
      budget,
      location,
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
          location,
          guests,
          eventType,
          serviceType,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in recommendation controller:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      message: "Internal Server Error",
      details: error.message,
    });
  }
};

module.exports = { getRecommendationsController };