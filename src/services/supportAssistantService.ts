import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface SupportSession {
  sessionId: string;
  userId?: string;
  history: { role: 'user' | 'assistant'; text: string }[];
}

export interface SupportResponse {
  reply: string;
  suggestedAction?: string;
  escalate: boolean;
}

// Support prompt context builder (Retrieval Augmented Generation)
export async function handleSupportQuery(query: string, session: SupportSession): Promise<SupportResponse> {
  const lowercaseQuery = query.toLowerCase();
  
  logger.info('[SupportAssistant] Processing customer support query', {
    sessionId: session.sessionId,
    userId: session.userId,
    queryLength: query.length,
  });

  // Check for safe inputs first (AI Governance shield)
  const isQuestionLong = query.length > 500;
  if (isQuestionLong) {
    return {
      reply: 'Your query is a bit too long for me to process. Could you summarize it in a few sentences?',
      escalate: false,
    };
  }

  // 1. Order Status Inquiries: e.g. "where is my order JK-2026-102"
  const orderMatch = lowercaseQuery.match(/jk-\d+-\w+/);
  if (orderMatch && orderMatch[0]) {
    const orderNumber = orderMatch[0].toUpperCase();
    
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: { status: true, customerName: true, total: true, deliveryAddress: true },
    });

    if (order) {
      return {
        reply: `Hi ${order.customerName}, I located Order ${orderNumber}. Its current status is "${order.status}". It is slated for delivery to: ${order.deliveryAddress}.`,
        suggestedAction: `TRACK_ORDER:${orderNumber}`,
        escalate: false,
      };
    } else {
      return {
        reply: `I see you are asking about order ${orderNumber}, but I could not locate that order number in our database. Please double-check your receipt.`,
        escalate: true,
      };
    }
  }

  // 2. Product Spec/Inquiry RAG: e.g. "water resistant plywood" or "sagwan teak durability"
  if (lowercaseQuery.includes('plywood') || lowercaseQuery.includes('teak') || lowercaseQuery.includes('wood') || lowercaseQuery.includes('spec')) {
    // Find active products matching terms
    const terms = lowercaseQuery.split(/\s+/).filter((t) => t.length > 3);
    const matchedProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        status: 'PUBLISHED',
        OR: terms.map((t) => ({ name: { contains: t, mode: 'insensitive' } })),
      },
      select: { name: true, sku: true, basePrice: true, waterResistant: true, fireResistant: true, termiteResistant: true, durabilityScore: true },
      take: 2,
    });

    if (matchedProducts.length > 0) {
      const bulletList = matchedProducts.map((p) => 
        `- **${p.name}** (SKU: ${p.sku}): Base Price ₹${p.basePrice.toNumber()}. Features: ${p.waterResistant ? 'Water-Resistant' : 'Standard'}, ${p.fireResistant ? 'Fire-Resistant' : 'Standard'}, Durability Score: ${p.durabilityScore || 'N/A'}/10.`
      ).join('\n');

      return {
        reply: `I found some timber/plywood products matching your criteria:\n\n${bulletList}\n\nWould you like me to show you detailed options or redirect you to checkout?`,
        suggestedAction: 'SHOW_CATALOG',
        escalate: false,
      };
    }
  }

  // 3. Fallback human-routing rule (Avoid over-automation / hallucinations)
  return {
    reply: "I am not quite sure how to answer that question about timber stock or account configuration. Let me route this message to our human team support desk, who will follow up with you shortly.",
    escalate: true,
    suggestedAction: 'ROUTE_TO_STAFF',
  };
}
