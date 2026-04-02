const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('Seeding Database...');
  
  const techCategory = await prisma.category.create({
    data: { name: 'Electronics & Gadgets' }
  });
  
  const apparelCategory = await prisma.category.create({
    data: { name: 'Apparel & Clothing' }
  });

  const homeCategory = await prisma.category.create({
    data: { name: 'Home & Kitchen' }
  });

  const sportsCategory = await prisma.category.create({
    data: { name: 'Sports & Outdoors' }
  });

  await prisma.product.createMany({
    data: [
      {
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Immersive sound with industry-leading noise cancellation.',
        price: 299.99,
        isTrending: true,
        categoryId: techCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'
      },
      {
        name: 'Smart Fitness Watch Series X',
        description: 'Track your health, workouts, and sleep accurately.',
        price: 199.50,
        isTrending: true,
        categoryId: techCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
      },
      {
        name: 'Minimalist Cotton T-Shirt',
        description: 'Premium everyday cotton comfortably tailored.',
        price: 24.99,
        isTrending: false,
        categoryId: apparelCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80'
      },
      {
        name: 'Classic Leather Jacket',
        description: 'Stylish, robust, and designed to last a lifetime.',
        price: 159.00,
        isTrending: true,
        categoryId: apparelCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80'
      },
      {
        name: '4K Ultra HD Action Camera',
        description: 'Capture your adventures in stunning 4K detail.',
        price: 129.99,
        isTrending: true,
        categoryId: techCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80'
      },
      {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB backlit keyboard with tactile switches.',
        price: 89.99,
        isTrending: false,
        categoryId: techCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80'
      },
      {
        name: 'Portable Power Bank 20000mAh',
        description: 'High-capacity charger for all your devices on the go.',
        price: 49.99,
        isTrending: false,
        categoryId: techCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&q=80'
      },
      {
        name: 'Classic Denim Jeans',
        description: 'Comfortable fit, everyday washed denim jeans.',
        price: 54.00,
        isTrending: true,
        categoryId: apparelCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80'
      },
      {
        name: 'Waterproof Hiking Jacket',
        description: 'Lightweight, breathable rain protection for the trail.',
        price: 110.00,
        isTrending: false,
        categoryId: apparelCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=500&q=80'
      },
      {
        name: 'Espresso Coffee Machine',
        description: 'Brew cafe-quality espresso at home.',
        price: 249.00,
        isTrending: true,
        categoryId: homeCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&q=80'
      },
      {
        name: 'Ceramic Non-stick Pan',
        description: 'Healthy cooking with easy cleanup.',
        price: 45.00,
        isTrending: false,
        categoryId: homeCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1584990347449-5ebda5490f23?w=500&q=80'
      },
      {
        name: 'Modern Desk Lamp',
        description: 'Minimalist LED lamp with adjustable brightness.',
        price: 35.99,
        isTrending: true,
        categoryId: homeCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80'
      },
      {
        name: 'Professional Yoga Mat',
        description: 'Eco-friendly, non-slip mat with alignment lines.',
        price: 39.50,
        isTrending: true,
        categoryId: sportsCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1592432678016-e910b06b3855?w=500&q=80'
      },
      {
        name: 'Adjustable Dumbbell Set',
        description: 'Space-saving weights for home workouts.',
        price: 189.99,
        isTrending: true,
        categoryId: sportsCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&q=80'
      },
      {
        name: 'Camping Tent 4-Person',
        description: 'Spacious and weather-resistant family tent.',
        price: 145.00,
        isTrending: false,
        categoryId: sportsCategory.id,
        imageUrl: 'https://images.unsplash.com/photo-1504280327387-5c32359f1369?w=500&q=80'
      }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
