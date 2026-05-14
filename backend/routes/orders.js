const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../middleware/authMiddleware');
const prisma = new PrismaClient();
const router = express.Router();

// [POST] /api/orders
router.post('/', protect, async (req, res) => {
  const { orderItems, deliveryAddress, paymentMethod } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  } else {
    try {
      // Calculate total amounts on backend for security
      // In a real app we'd fetch prices from DB to avoid client-side injection
      // Here we assume orderItems have { productId, quantity, price }
      let totalAmount = 0;
      const formattedItems = [];

      for (let item of orderItems) {
        const product = await prisma.product.findUnique({ where: { id: item.productId }});
        if (product) {
          if (product.stock < item.quantity) {
             return res.status(400).json({ message: `Not enough stock for ${product.name}` });
          }
          const activePrice = product.discountPrice != null ? parseFloat(product.discountPrice) : parseFloat(product.price);
          totalAmount += (activePrice * item.quantity);
          formattedItems.push({
            productId: product.id,
            quantity: item.quantity,
            price: activePrice
          });

          // Deduct stock simultaneously
          await prisma.product.update({
             where: { id: product.id },
             data: { stock: product.stock - item.quantity }
          });
        }
      }

      const order = await prisma.order.create({
        data: {
          userId: req.user.id,
          totalAmount,
          deliveryAddress,
          paymentMethod,
          items: {
             create: formattedItems
          }
        },
        include: { items: true }
      });

      res.status(201).json(order);
    } catch (error) {
       res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
  }
});

// [GET] /api/orders/myorders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

module.exports = router;
