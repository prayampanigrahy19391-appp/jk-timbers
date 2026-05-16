import { getCatalogProducts, getCatalogProductById } from '@/repositories/catalogRepository';
import { findAllProductsWithCategory } from '@/repositories/productRepository';
import { findAllOrdersForCustomerAggregation } from '@/repositories/orderRepository';
import type { CustomerProfile } from '@/types/admin';

export function fetchCatalogProducts() {
  return getCatalogProducts();
}

export function fetchCatalogProductById(id: string) {
  return getCatalogProductById(id);
}

/** Fetch all products from database for admin inventory. */
export async function getAdminProducts() {
  return findAllProductsWithCategory();
}

/** Aggregate orders by customer contact info to build customer profiles. */
export async function getCustomerProfiles(): Promise<CustomerProfile[]> {
  const orders = await findAllOrdersForCustomerAggregation();

  const customersMap = new Map<string, CustomerProfile>();

  orders.forEach((order) => {
    const key = order.email || order.phone || order.id;
    if (!customersMap.has(key)) {
      customersMap.set(key, {
        id: key,
        name: order.customerName || 'Guest Customer',
        email: order.email || 'N/A',
        phone: order.phone || 'N/A',
        location: order.city ? `${order.city}, ${order.zipCode}` : 'N/A',
        totalOrders: 0,
        totalSpend: 0,
        lastOrderDate: order.createdAt,
      });
    }

    const customer = customersMap.get(key)!;
    customer.totalOrders += 1;
    customer.totalSpend += order.total.toNumber();
  });

  return Array.from(customersMap.values());
}
