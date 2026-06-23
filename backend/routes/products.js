const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../middleware/authMiddleware');
const prisma = new PrismaClient();
const router = express.Router();

// [GET] /api/products
// Optional Queries: ?categoryId=123 & ?latest=true & ?trending=true & ?minPrice=10 & ?maxPrice=100 & ?search=abc
router.get('/', async (req, res) => {
  const { categoryId, latest, trending, minPrice, maxPrice, search } = req.query;

  let where = {};
  
  if (categoryId) where.categoryId = categoryId;
  if (trending === 'true') where.isTrending = true;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  let orderBy = {};
  if (latest === 'true') {
    orderBy.createdAt = 'desc';
  }

  try {
    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        professions: true
      }
    });

    // Optional personalization sorting based on customer professions
    let userProfessions = [];
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          include: { professions: true }
        });
        if (user) {
          userProfessions = user.professions.map(p => p.id);
        }
      } catch (error) {
        console.error('Optional auth verification failed during product listing:', error.message);
      }
    }

    if (userProfessions.length > 0) {
      products.sort((a, b) => {
        const aMatches = a.professions.some(p => userProfessions.includes(p.id));
        const bMatches = b.professions.some(p => userProfessions.includes(p.id));
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0; // Maintain original sorting
      });
    }

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// [GET] /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { 
        category: true,
        professions: true,
        reviews: { 
          include: { user: { select: { email: true, phone: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// [GET] /api/products/categories/all
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// [POST] /api/products/:id/reviews
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    // Strict 1 review per user logic
    const existingReview = await prisma.review.findFirst({
      where: { productId, userId }
    });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        productId,
        userId
      }
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error adding review' });
  }
});

module.exports = router;
