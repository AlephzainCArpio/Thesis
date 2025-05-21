const {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  recordVenueView,
} = require("../services/venueService")

const getVenuesController = async (req, res) => {
  try {
    const venues = await getVenues(req.query)
    res.json(venues)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getVenueByIdController = async (req, res) => {
  try {
    const venue = await getVenueById(req.params.id, req.user?.id)
    res.json(venue)
  } catch (error) {
    if (error.message === "Venue not found") {
      return res.status(404).json({ message: "Venue not found" })
    }
    res.status(500).json({ message: error.message })
  }
}

const createVenueController = async (req, res) => {
  try {
    let images = null;
    if (req.files && req.files.length > 0) {
      // Only save filenames, not full path (they're already in correct folder)
      images = JSON.stringify(req.files.map(f => f.filename));
    } else if (req.body.images) {
      images = req.body.images;
    }
    // Merge images into body for service
    const venueData = { ...req.body, images };
    const venue = await createVenue(venueData, req.user.id, req.user.role)
    res.status(201).json(venue)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const updateVenueController = async (req, res) => {
  try {
    let images = undefined;
    if (req.files && req.files.length > 0) {
      images = JSON.stringify(req.files.map(f => f.filename));
    } else if (req.body.images) {
      images = req.body.images;
    }
    const venueData = { ...req.body, ...(images !== undefined ? { images } : {}) };
    const venue = await updateVenue(req.params.id, venueData, req.user.id, req.user.role)
    res.json(venue)
  } catch (error) {
    if (error.message === "Venue not found") {
      return res.status(404).json({ message: "Venue not found" })
    }
    if (error.message === "Not authorized") {
      return res.status(403).json({ message: "Not authorized" })
    }
    res.status(500).json({ message: error.message })
  }
}

const deleteVenueController = async (req, res) => {
  try {
    const result = await deleteVenue(req.params.id, req.user.id, req.user.role)
    res.json(result)
  } catch (error) {
    if (error.message === "Venue not found") {
      return res.status(404).json({ message: "Venue not found" })
    }
    if (error.message === "Not authorized") {
      return res.status(403).json({ message: "Not authorized" })
    }
    res.status(500).json({ message: error.message })
  }
}

const viewVenueController = async (req, res) => {
  try {
    await recordVenueView(req.params.id, req.user.id)
    res.status(200).json({ message: "View recorded" })
  } catch (error) {
    if (error.message === "Venue not found") {
      return res.status(404).json({ message: "Venue not found" })
    }
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getVenues: getVenuesController,
  getVenueById: getVenueByIdController,
  createVenue: createVenueController,
  updateVenue: updateVenueController,
  deleteVenue: deleteVenueController,
  viewVenue: viewVenueController,
}