const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const getProfile = async (req, res) => {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: true },
    })

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" })
    }

    res.json(profile)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const updateProfile = async (req, res) => {
  try {
    const { location, preferences, notifyEmail, notifyPhone, avatar } = req.body

    const updatedProfile = await prisma.userProfile.update({
      where: { userId: req.user.id },
      data: {
        location,
        preferences,
        notifyEmail,
        notifyPhone,
        avatar,
      },
    })

    res.json(updatedProfile)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getViewHistory = async (req, res) => {
  try {
    const history = await prisma.viewHistory.findMany({
      where: { userId: req.user.id },
      include: {
        venue: true,
        catering: true,
        photographer: true,
        designer: true,
      },
      orderBy: { viewedAt: "desc" },
    })

    res.json(history)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getProfile, updateProfile, getViewHistory }
