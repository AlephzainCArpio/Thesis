const { getRecommendations } = require("../services/recommendationService");

const getRecommendationsController = async (req, res) => {
  try {
    const { budget, guests, eventTypes, serviceType } = req.body;

    // Validate required fields based on service type
    const missingFields = [];
    if (!budget) missingFields.push("budget");
    if (serviceType === "DESIGNER" && !eventTypes) missingFields.push("eventTypes");
    if (serviceType !== "PHOTOGRAPHER" && serviceType !== "DESIGNER" && !guests) missingFields.push("guests");
    if (!serviceType) missingFields.push("serviceType");

    // Return error if any required field is missing
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required parameters: ${missingFields.join(", ")}`,
      });
    }

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Not authorized, user not found",
      });
    }

    // Call the recommendation service
    const recommendations = await getRecommendations({
      budget,
      guests,
      eventTypes: eventTypes || null,
      serviceType,
      userId: req.user.id,
    });

    // Return the response with metadata
    res.status(200).json({
      recommendations,
      metadata: {
        total_results: {
          best_match: recommendations.bestMatch.length,
          above_budget: recommendations.aboveBudget.length,
          below_budget: recommendations.belowBudget.length,
        },
        filters_applied: {
          budget,
          guests,
          eventTypes,
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
