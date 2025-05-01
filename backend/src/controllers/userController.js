const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json(user);
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ message: "Internal Server Error", details: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email },
    });
    res.json(updatedUser);
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ message: "Internal Server Error", details: error.message });
  }
};

const getViewHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const viewHistory = await prisma.viewHistory.findMany({
      where: { userId },
      include: { venue: true, catering: true, photographer: true, designer: true },
      orderBy: { viewedAt: "desc" },
    });
    res.json(viewHistory);
  } catch (error) {
    console.error("Error in getViewHistory:", error);
    res.status(500).json({ message: "Internal Server Error", details: error.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get recent views with full service details
    const recentViews = await prisma.viewHistory.findMany({
      where: { userId },
      include: {
        venue: true,
        catering: true,
        photographer: true,
        designer: true,
      },
      orderBy: { viewedAt: "desc" },
      take: 10,
    });

    // Get favorites with full service details
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        venue: true,
        catering: true,
        photographer: true,
        designer: true,
      },
    });

    // Debug log to check the data structure
    console.log('Favorites found:', favorites.length);
    console.log('Sample favorite:', favorites[0]);

    const stats = {
      totalViews: await prisma.viewHistory.count({ where: { userId } }),
      totalFavorites: await prisma.favorite.count({ where: { userId } }),
    };

    res.json({ 
      recentViews, 
      favorites,
      stats
    });
  } catch (error) {
    console.error("Error in getDashboard:", error);
    res.status(500).json({ 
      message: "Internal Server Error", 
      details: error.message 
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getViewHistory,
  getDashboard,
};