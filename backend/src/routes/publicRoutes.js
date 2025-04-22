const express = require("express")
const { getStats } = require("../controllers/publicController")
const { PrismaClient } = require('@prisma/client');  
const prisma = new PrismaClient();  

const router = express.Router()

router.get("/stats", getStats)

const getFeatured = async (req, res) => {
    try {
      const featuredVenues = await prisma.venue.findMany({
        where: {
          status: "APPROVED", 
        },
        take: 4, 
      });
  
      res.json({ featured: featuredVenues });
    } catch (error) {
      console.error('Error fetching featured venues:', error);
      res.status(500).json({ message: "Failed to fetch featured data" });
    }
  };
  
  router.get("/featured", getFeatured)  
module.exports = router
