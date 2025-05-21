const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const getDesigners = async (req, res) => {
  try {
    const { location, style, eventTypes, status } = req.query

    const where = {
      status: status || "APPROVED",
    }

    if (location) {
      where.location = { contains: location }
    }

    if (style) {
      where.style = style
    }

    if (eventTypes) {
      where.eventTypes = { contains: eventTypes }
    }

    const designers = await prisma.designer.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    res.json(designers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getDesignerById = async (req, res) => {
  try {
    const designer = await prisma.designer.findUnique({
      where: { id: req.params.id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" })
    }

    // Don't return unapproved designers unless it's the owner or an admin
    if (
      designer.status !== "APPROVED" &&
      (!req.user || (req.user.id !== designer.providerId && req.user.role !== "ADMIN"))
    ) {
      return res.status(404).json({ message: "Designer not found" })
    }

    res.json(designer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const createDesigner = async (req, res) => {
  try {
    let images = null;
    if (req.files && req.files.length > 0) {
      images = JSON.stringify(req.files.map(f => f.filename));
    } else if (req.body.images) {
      images = req.body.images;
    }

    const { name, description, location, style, priceRange, eventTypes, portfolio } = req.body

    const designer = await prisma.designer.create({
      data: {
        name,
        description,
        location,
        style,
        priceRange,
        eventTypes,
        portfolio,
        images: images || null,
        providerId: req.user.id,
        status: req.user.role === "ADMIN" ? "APPROVED" : "PENDING",
      },
    })

    res.status(201).json(designer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const updateDesigner = async (req, res) => {
  try {
    const designer = await prisma.designer.findUnique({
      where: { id: req.params.id },
    })

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" })
    }

    // Check if user is provider of this designer or an admin
    if (designer.providerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" })
    }

    let images = undefined;
    if (req.files && req.files.length > 0) {
      images = JSON.stringify(req.files.map(f => f.filename));
    } else if (req.body.images) {
      images = req.body.images;
    }

    const { name, description, location, style, priceRange, eventTypes, portfolio, status } = req.body

    const updatedDesigner = await prisma.designer.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        location,
        style,
        priceRange,
        eventTypes,
        portfolio,
        images,
        status: req.user.role === "ADMIN" ? status : designer.status,
      },
    })

    res.json(updatedDesigner)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const deleteDesigner = async (req, res) => {
  try {
    const designer = await prisma.designer.findUnique({
      where: { id: req.params.id },
    })

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" })
    }

    // Check if user is provider of this designer or an admin
    if (designer.providerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" })
    }

    await prisma.designer.delete({
      where: { id: req.params.id },
    })

    res.json({ message: "Designer removed" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const viewDesigner = async (req, res) => {
  try {
    // Check if designer exists
    const designer = await prisma.designer.findUnique({
      where: { id: req.params.id },
    })

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" })
    }

    // Record the view
    await prisma.viewHistory.create({
      data: {
        userId: req.user.id,
        designerId: req.params.id,
      },
    })

    res.status(200).json({ message: "View recorded" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getDesigners,
  getDesignerById,
  createDesigner,
  updateDesigner,
  deleteDesigner,
  viewDesigner,
}