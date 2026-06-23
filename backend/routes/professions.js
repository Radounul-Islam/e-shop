const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// [GET] /api/professions
router.get('/', async (req, res) => {
  try {
    const professions = await prisma.profession.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(professions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching professions' });
  }
});

// [POST] /api/professions/setup
router.post('/setup', protect, async (req, res) => {
  const { professionIds } = req.body;
  
  if (!Array.isArray(professionIds)) {
    return res.status(400).json({ message: 'professionIds must be an array of IDs' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        hasCompletedProfessionSetup: true,
        professions: {
          set: professionIds.map(id => ({ id }))
        }
      },
      include: {
        professions: true
      }
    });

    res.json({
      message: 'Profession setup completed',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        hasCompletedProfessionSetup: updatedUser.hasCompletedProfessionSetup,
        professions: updatedUser.professions
      }
    });
  } catch (error) {
    console.error('Error in profession setup:', error);
    res.status(500).json({ message: 'Error saving professions' });
  }
});

module.exports = router;
