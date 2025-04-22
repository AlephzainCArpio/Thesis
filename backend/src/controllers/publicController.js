const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const getStats = async (req, res) => {
  try {
    const usersCount = await prisma.user.count()
    const venuesCount = await prisma.venue.count()
    const cateringsCount = await prisma.catering.count()
    const photographersCount = await prisma.photographer.count()
    const designersCount = await prisma.designer.count()

    res.json({
      users: usersCount,
      venues: venuesCount,
      caterings: cateringsCount,
      photographers: photographersCount,
      designers: designersCount,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


module.exports = { getStats }
