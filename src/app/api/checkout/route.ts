import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customer, paymentMethod, total } = body;

    // 1. Check if user exists by email, if not create a new User (optional, since order captures details now)
    // Here we'll just create the Order and attach customer details directly to it.
    
    // We need to resolve product IDs from our mock data to ensure they match if Prisma is enforcing relations.
    // For this implementation, we assume products exist in the DB or we disable foreign key checks, 
    // but the schema requires valid productIds. If the mock products aren't in the DB, this will fail.
    // To make this fully functional, we should ideally upsert products or just store snapshot details.
    // Assuming the user wants a working system, let's create the order.
    // Note: Since this is an MVP without a seeded product DB, let's just create the Order and bypass OrderItems
    // if relations fail, or we can use generic strings if we modify schema. 
    // Wait, OrderItem requires a valid productId. Let's try inserting the products first if they don't exist.

    // Upsert products to ensure they exist in DB
    for (const item of items) {
      // Find category first (we'll just use a generic 'Timber' category for all if not exists)
      const category = await prisma.category.upsert({
        where: { name: 'Timber' },
        update: {},
        create: { name: 'Timber', description: 'General Timber' }
      });

      await prisma.product.upsert({
        where: { slug: item.id },
        update: {},
        create: {
          id: item.id,
          name: item.name,
          slug: item.id,
          description: 'Product description',
          price: parseFloat(item.price.replace(/[^0-9.]/g, '')),
          unit: item.unit,
          images: JSON.stringify([item.image]),
          categoryId: category.id,
        }
      });
    }

    // 2. Create the Order
    const order = await prisma.order.create({
      data: {
        customerName: customer.name,
        email: customer.email,
        phone: customer.phone,
        deliveryAddress: customer.address,
        city: customer.city,
        zipCode: customer.zipCode,
        total: total,
        paymentStatus: paymentMethod === 'COD' ? 'UNPAID' : 'PENDING',
        status: 'PENDING',
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: parseFloat(item.price.replace(/[^0-9.]/g, ''))
          }))
        }
      }
    });

    // Background Notifications (Fire and Forget)
    // In a real production environment, this would call Twilio or WhatsApp Cloud API
    const notifyVendor = async () => {
      try {
        const message = `*NEW ORDER ALERT*
Order ID: ${order.id}
Customer: ${customer.name}
Phone: ${customer.phone}
Address: ${customer.address}, ${customer.city}, ${customer.zipCode}
Total: ₹${total.toLocaleString('en-IN')}

Please check the Admin Dashboard to process this order.`;

        console.log('==============================================');
        console.log('BACKGROUND WHATSAPP NOTIFICATION SENT TO VENDOR');
        console.log('Payload:', JSON.stringify({ to: '+918260761620', body: message }, null, 2));
        console.log('==============================================');
        
        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('BACKGROUND EMAIL SENT TO VENDOR');
      } catch (e) {
        console.error('Failed to send background notification', e);
      }
    };

    // Execute notification asynchronously
    notifyVendor();

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process order' }, { status: 500 });
  }
}
