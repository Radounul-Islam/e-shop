const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const { sendOtpEmail } = require('../utils/emailSender');

const router = express.Router();
const prisma = new PrismaClient();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// [POST] /api/auth/request-otp
// Request an OTP (creates user if new, updates OTP if existing)
router.post('/request-otp', async (req, res) => {
  const { email, phone } = req.body;
  if (!email && !phone) return res.status(400).json({ message: 'Please provide email or phone' });

  let user = await prisma.user.findFirst({
    where: { OR: [{ email: email || '' }, { phone: phone || '' }] }
  });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { otp }
    });
  } else {
    user = await prisma.user.create({
      data: { email, phone, otp }
    });
  }

  // Handle sending OTP
  if (email) {
    const emailSent = await sendOtpEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }
    // For email, we don't send OTP in response for security
    return res.status(200).json({ message: 'OTP sent to your email', userId: user.id });
  } else if (phone) {
    // For phone, as per your request, we send it to the frontend
    return res.status(200).json({ message: 'OTP sent successfully', otp, userId: user.id });
  }
});

// [POST] /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { userId, otp } = req.body;
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // Clear OTP
  await prisma.user.update({
    where: { id: userId },
    data: { otp: null }
  });

  res.json({
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    token: generateToken(user.id)
  });
});

// [POST] /api/auth/admin-login
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;

  // Simple mock logic: if email is admin@admin.com and pass is admin123, generate token
  // Let's check DB first.
  let adminUser = await prisma.user.findUnique({ where: { email } });
  
  // Seed admin if none exists
  if (!adminUser && email === 'admin@admin.com') {
     const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash('admin123', salt);
     adminUser = await prisma.user.create({
       data: {
         email,
         password: hashedPassword,
         role: 'ADMIN'
       }
     });
  }

  if (adminUser && adminUser.role === 'ADMIN') {
     if (bcrypt.compareSync(password, adminUser.password)) {
       res.json({
         id: adminUser.id,
         email: adminUser.email,
         role: adminUser.role,
         token: generateToken(adminUser.id)
       });
       return;
     }
  }

  res.status(401).json({ message: 'Invalid admin credentials' });
});

module.exports = router;
