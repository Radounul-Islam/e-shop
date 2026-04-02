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
    const data = { ...req.body };
    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.stock !== undefined) data.stock = parseInt(data.stock, 10);
    
    const product = await prisma.product.create({ data });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.stock !== undefined) data.stock = parseInt(data.stock, 10);
    
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data
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

module.exports = router;
