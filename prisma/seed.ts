import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Default Admin
  const adminEmail = 'admin@jktimbers.com';
  const adminSeedPassword = process.env.ADMIN_SEED_PASSWORD;

  if (!adminSeedPassword || adminSeedPassword.length < 12) {
    throw new Error('ADMIN_SEED_PASSWORD must be set to at least 12 characters before seeding the admin user.');
  }

  const hashedPassword = await bcrypt.hash(adminSeedPassword, 12);
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
    create: {
      name: 'JK Admin',
      email: adminEmail,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
  });
  console.log(`✅ Admin user upserted: ${adminEmail}`);

  // 2. Create Categories
  const categoriesData = [
    { name: 'Timber', slug: 'timber', description: 'Raw wood and timber products', sortOrder: 1 },
    { name: 'Plywood', slug: 'plywood', description: 'Engineered plywood sheets', sortOrder: 2 },
    { name: 'Engineered', slug: 'engineered', description: 'MDF and engineered boards', sortOrder: 3 },
    { name: 'Veneers', slug: 'veneers', description: 'Decorative wood veneers', sortOrder: 4 },
    { name: 'Laminates', slug: 'laminates', description: 'Synthetic laminates', sortOrder: 5 },
    { name: 'Doors', slug: 'doors', description: 'Flush doors and entryways', sortOrder: 6 },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ Seeded ${categoriesData.length} categories.`);

  await prisma.warehouse.upsert({
    where: { code: 'MAIN' },
    update: { isActive: true },
    create: {
      name: 'Main Timber Yard',
      code: 'MAIN',
      address: 'Primary JK Timbers warehouse',
    },
  });
  console.log('✅ Seeded default warehouse.');

  // 3. Create Products
  // This replaces the static data/products.ts file
  const productsData = [
    {
      name: 'Premium Sagwan (Teak) Wood',
      slug: 'sagwan',
      categorySlug: 'timber',
      price: 20000.0,
      unit: 'cubic ft',
      images: ['/textures/teak.webp'],
      badge: 'Best Seller',
      description: 'Known as the king of timber, Sagwan offers a beautiful golden-brown grain. It is highly resistant to moisture, making it perfect for premium furniture and outdoor use.',
      features: ['High natural oil content', 'Distinctive grain pattern', 'Low shrinkage ratio'],
      origin: 'Nagpur & CP Region',
      stock: 145,
    },
    {
      name: 'Gathwa Wood',
      slug: 'gathwa',
      categorySlug: 'timber',
      price: 1100.0,
      unit: 'cubic ft',
      images: ['/textures/gathwa_wood.webp'],
      badge: 'Cost Effective',
      description: 'Gathwa is a locally favored hardwood known for its excellent strength-to-weight ratio. It is widely used for heavy structural work and framing where durability is required without the premium cost of Teak.',
      features: ['Cost-effective structural timber', 'Good nail holding capacity', 'High density'],
      origin: 'Local Forests',
      stock: 200,
    },
    {
      name: 'Sal Wood (Hardwood)',
      slug: 'sal',
      categorySlug: 'timber',
      price: 1200.0,
      unit: 'cubic ft',
      images: ['/textures/sal_wood.webp'],
      badge: 'Termite Proof',
      description: 'One of the toughest woods available in India. Sal wood is incredibly heavy and strong, traditionally used for door frames, beams, and structural construction.',
      features: ['Extremely hard and heavy', 'Water resistant', 'Ideal for door/window frames'],
      origin: 'Malaysia & India',
      stock: 80,
    },
    {
      name: 'Standard Hardwood',
      slug: 'hardwood',
      categorySlug: 'timber',
      price: 850.0,
      unit: 'cubic ft',
      images: ['/textures/hardwood.webp'],
      badge: null,
      description: 'A blend of durable hardwoods processed for stability. This timber is perfect for internal framing, basic furniture skeletons, and hidden structural supports.',
      features: ['Highly versatile', 'Takes polish well', 'Economical choice'],
      origin: 'Various',
      stock: 450,
    },
    {
      name: 'BWP Marine Plywood 18mm',
      slug: 'marine-ply',
      categorySlug: 'plywood',
      price: 85.0,
      unit: 'sq.ft',
      images: ['/textures/marine_plywood.webp'],
      badge: 'Waterproof',
      description: 'Engineered for environments exposed to high moisture and water. The ultimate choice for kitchen cabinets, bathrooms, and marine applications.',
      features: ['Bonded with undiluted Phenol Formaldehyde', 'Borer & Termite Proof', 'High load bearing capacity'],
      origin: 'Engineered',
      stock: 500,
    },
    {
      name: 'Commercial Plywood 12mm',
      slug: 'commercial-ply',
      categorySlug: 'plywood',
      price: 33.0,
      unit: 'sq.ft',
      images: ['/textures/commercial_plywood.webp'],
      badge: null,
      description: 'Moisture-resistant plywood ideal for interior paneling, partitions, and standard furniture. It provides excellent surface smoothness for laminating and painting.',
      features: ['Smooth uniform surface', 'Lightweight yet strong', 'Excellent for living room furniture'],
      origin: 'Engineered',
      stock: 800,
    },
    {
      name: 'MDF Board 18mm',
      slug: 'mdf',
      categorySlug: 'engineered',
      price: 30.0,
      unit: 'sq.ft',
      images: ['/textures/mdf.webp'],
      badge: 'Smooth Finish',
      description: 'Medium Density Fiberboard is engineered without grain, meaning it can be routed, cut, and painted with absolutely flawless, smooth edges for modern cabinetry.',
      features: ['No knots or grain', 'Perfect for 3D routing', 'Takes paint perfectly'],
      origin: 'Engineered',
      stock: 300,
    },
    {
      name: 'Decorative Walnut Veneer',
      slug: 'veneer',
      categorySlug: 'veneers',
      price: 75.0,
      unit: 'sq.ft',
      images: ['/textures/walnut.webp'],
      badge: 'Premium',
      description: 'Thin slices of natural walnut wood applied over plywood to give the appearance of solid walnut. Prized for its rich chocolate color and stunning natural grain patterns.',
      features: ['Rich chocolate brown color', 'Real wood feel and warmth', 'Eco-friendly solid wood alternative'],
      origin: 'Imported',
      stock: 50,
    },
    {
      name: 'High-Gloss Laminates',
      slug: 'laminates',
      categorySlug: 'laminates',
      price: 950.0,
      unit: 'sheet',
      images: ['/textures/laminate.webp'],
      badge: 'New',
      description: 'Synthetic decorative sheets pressed under high heat. Available in hundreds of textures and colors, offering a highly durable, easy-to-clean surface for wardrobes and kitchens.',
      features: ['Scratch & heat resistant', 'Zero maintenance required', 'Endless design options'],
      origin: 'Engineered',
      stock: 1200,
    },
    {
      name: 'Solid Wood Flush Doors',
      slug: 'flush-doors',
      categorySlug: 'doors',
      price: 2800.0,
      unit: 'piece',
      images: ['/textures/flush_door.webp'],
      badge: null,
      description: 'Constructed with a solid blockboard core and cross-bands, these doors provide excellent acoustic insulation and security while resisting warping over time.',
      features: ['High impact resistance', 'Sound insulating core', 'Pre-calibrated thickness'],
      origin: 'Engineered',
      stock: 45,
    }
  ];

  for (const prod of productsData) {
    const { categorySlug, price, ...productData } = prod;
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      console.warn(`⚠️ Category ${categorySlug} not found for product ${prod.slug}`);
      continue;
    }

    const sku = `JK-${prod.slug.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`;

    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        ...productData,
        sku,
        basePrice: price,
        categoryId: category.id,
      },
      create: {
        ...productData,
        sku,
        basePrice: price,
        categoryId: category.id,
      },
    });
  }
  
  console.log(`✅ Seeded ${productsData.length} products.`);
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
