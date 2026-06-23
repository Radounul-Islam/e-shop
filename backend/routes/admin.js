const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protect, admin } = require('../middleware/authMiddleware');
const prisma = new PrismaClient();
const router = express.Router();

// All routes require authentication AND admin role
router.use(protect, admin);

// --- Products Management ---
router.post('/products', async (req, res) => {
  try {
    const { professionIds, ...rest } = req.body;
    const data = { ...rest };
    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.discountPrice !== undefined && data.discountPrice !== "") {
      data.discountPrice = parseFloat(data.discountPrice);
    } else {
      data.discountPrice = null;
    }
    if (data.stock !== undefined) data.stock = parseInt(data.stock, 10);
    
    if (professionIds) {
      data.professions = {
        connect: professionIds.map(id => ({ id }))
      };
    }
    
    const product = await prisma.product.create({
      data,
      include: { professions: true }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { professionIds, ...rest } = req.body;
    const data = { ...rest };
    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.discountPrice !== undefined && data.discountPrice !== "") {
      data.discountPrice = parseFloat(data.discountPrice);
    } else {
      data.discountPrice = null;
    }
    if (data.stock !== undefined) data.stock = parseInt(data.stock, 10);
    
    if (professionIds) {
      data.professions = {
        set: professionIds.map(id => ({ id }))
      };
    }
    
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { professions: true }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// --- Categories Management ---
router.post('/categories', async (req, res) => {
  try {
    const category = await prisma.category.create({
      data: { name: req.body.name }
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category' });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name: req.body.name }
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
  }
});

// --- Orders Management ---
router.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
       include: { 
         user: { select: { email: true, phone: true } },
         items: { include: { product: true } }
       }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
});

router.delete('/orders/:id', async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: req.params.id } });
    res.json({ message: 'Order removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order' });
  }
});

// --- Banners Management ---
router.get('/banners', async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners' });
  }
});

router.post('/banners', async (req, res) => {
  try {
    const { imageUrl, isActive } = req.body;
    const banner = await prisma.banner.create({
      data: { imageUrl, isActive: isActive !== undefined ? isActive : true }
    });
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Error creating banner' });
  }
});

router.patch('/banners/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    const banner = await prisma.banner.update({
      where: { id: req.params.id },
      data: { isActive }
    });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Error updating banner status' });
  }
});

router.delete('/banners/:id', async (req, res) => {
  try {
    await prisma.banner.delete({ where: { id: req.params.id } });
    res.json({ message: 'Banner removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting banner' });
  }
});

// --- Professions Management ---
router.post('/professions', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Profession name is required' });
  try {
    const existing = await prisma.profession.findUnique({ where: { name } });
    if (existing) return res.status(400).json({ message: 'Profession name already exists' });
    const profession = await prisma.profession.create({ data: { name } });
    res.status(201).json(profession);
  } catch (error) {
    res.status(500).json({ message: 'Error creating profession', error });
  }
});

router.put('/professions/:id', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Profession name is required' });
  try {
    const profession = await prisma.profession.update({
      where: { id: req.params.id },
      data: { name }
    });
    res.json(profession);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profession', error });
  }
});

router.delete('/professions/:id', async (req, res) => {
  try {
    await prisma.profession.delete({ where: { id: req.params.id } });
    res.json({ message: 'Profession removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting profession. It may be in use by products or users.' });
  }
});

module.exports = router;
