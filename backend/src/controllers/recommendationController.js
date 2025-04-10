const { getRecommendations } = require("../services/recommendationService")

const getRecommendationsController = async (req, res) => {
  try {
    const { budget, location, guests, eventType, serviceType } = req.body

    // Validate required parameters
    if (!budget || !location || !guests || !eventType || !serviceType) {
      return res.status(400).json({
        message: "Missing required parameters. Please provide budget, location, guests, eventType, and serviceType.",
      })
    }

    // Get recommendations using the service
    const recommendations = await getRecommendations({
      budget,
      location,
      guests,
      eventType,
      serviceType,
      userId: req.user.id,
    })

    // Return the recommendations
    res.json({ recommendations })
  } catch (error) {
    console.error("Error in recommendation controller:", error)
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getRecommendations: getRecommendationsController }
