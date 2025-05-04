const { getRecommendations } = require("../services/recommendationService");

const getRecommendationsController = async (req, res) => {
  try {
    const { 
      budget, 
      location, 
      guests, 
      eventType, 
      serviceType,
    } = req.body;

    // Validate required parameters
    if (!budget || !location || !guests || !eventType || !serviceType) {
      return res.status(400).json({
        message: "Missing required parameters"
      });
    }

   
    const recommendations = await getRecommendations({
      budget,
      location,
      guests,
      eventType,
      serviceType,
      userId: req.user.id,
      preferences
    });

  
    res.json({
      recommendations,
      metadata: {
        total_results: recommendations.length,
        filters_applied: {
          budget,
          location,
          guests,
          eventType,
          serviceType
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in recommendation controller:", error);
    res.status(500).json({
      message: "Internal Server Error",
      details: error.message
    });
  }
};

module.exports = {
  getRecommendationsController,
};
