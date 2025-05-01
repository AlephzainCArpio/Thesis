const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Add to favorites
const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { venueId, cateringId, photographerId, designerId } = req.body;

    // Check if favorite already exists
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId,
        OR: [
          { venueId: venueId || null },
          { cateringId: cateringId || null },
          { photographerId: photographerId || null },
          { designerId: designerId || null },
        ],
      },
    });

    if (existingFavorite) {
      // Remove favorite if it exists
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });
      res.json({ message: 'Removed from favorites', isFavorited: false });
    } else {
      // Add new favorite
      await prisma.favorite.create({
        data: {
          userId,
          venueId,
          cateringId,
          photographerId,
          designerId,
        },
      });
      res.json({ message: 'Added to favorites', isFavorited: true });
    }
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    res.status(500).json({ message: 'Failed to update favorites' });
  }
};

// Check if item is favorited
const checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { venueId, cateringId, photographerId, designerId } = req.query;

    const favorite = await prisma.favorite.findFirst({
      where: {
        userId,
        OR: [
          { venueId: venueId || null },
          { cateringId: cateringId || null },
          { photographerId: photographerId || null },
          { designerId: designerId || null },
        ],
      },
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Error in checkFavorite:', error);
    res.status(500).json({ message: 'Failed to check favorite status' });
  }
};

// Get user's favorites
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        venue: true,
        catering: true,
        photographer: true,
        designer: true,
      },
    });

    res.json(favorites);
  } catch (error) {
    console.error('Error in getFavorites:', error);
    res.status(500).json({ message: 'Failed to get favorites' });
  }
};

// Delete a favorite
const deleteFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const serviceType = req.params.type; // 'venue', 'catering', etc.
    const serviceId = req.params.id;

    const where = {
      userId,
      [`${serviceType}Id`]: serviceId,
    };

    const favorite = await prisma.favorite.findFirst({ where });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    await prisma.favorite.delete({
      where: { id: favorite.id },
    });

    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Error in deleteFavorite:', error);
    res.status(500).json({ message: 'Failed to remove favorite' });
  }
};

module.exports = {
  toggleFavorite,
  checkFavorite,
  getFavorites,
  deleteFavorite,
};