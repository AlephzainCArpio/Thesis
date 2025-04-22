const { getRecommendations } = require("../services/recommendationService");

const getRecommendationsController = async (req, res) => {
  try {
    const { budget, location, guests, eventType, serviceType } = req.body;

    // Validate required parameters
    if (!budget || !location || !guests || !eventType || !serviceType) {
      return res.status(400).json({
        message: "Missing required parameters. Please provide budget, location, guests, eventType, and serviceType.",
      });
    }

    // Call the recommendation service
    const recommendations = await getRecommendations({
      budget,
      location,
      guests,
      eventType,
      serviceType,
      userId: req.user.id,
    });

    res.json({ recommendations });
  } catch (error) {
    console.error("Error in recommendation controller:", error);
    res.status(500).json({ message: "Internal Server Error", details: error.message });
  }
};

module.exports = {
  getRecommendationsController,
};
