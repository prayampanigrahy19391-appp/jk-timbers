import { z } from 'zod';

export const cartItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.string().min(1),
  unit: z.string().min(1),
  image: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const checkoutCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters').regex(/^[a-zA-Z\s]+$/, 'City can only contain letters and spaces'),
  zipCode: z.string().regex(/^\d{6}$/, 'PIN/Zip Code must be exactly 6 digits'),
});

export const checkoutRequestSchema = z.object({
  cartToken: z.string().min(1),
  customer: checkoutCustomerSchema,
  paymentMethod: z.enum(['COD', 'BANK', 'UPI']),
  paymentProvider: z.enum(['RAZORPAY', 'STRIPE', 'PAYPAL', 'UPI', 'PHONEPE', 'GOOGLE_PAY', 'PAYTM', 'BHIM', 'COD']).optional(),
  paymentIdempotencyKey: z.string().min(1).optional(),
  total: z.number().nonnegative(),
});

export const contactRequestSchema = z.object({
  firstName: z.string().min(2, 'First Name must be at least 2 characters').regex(/^[a-zA-Z\s]+$/, 'First Name can only contain letters and spaces'),
  lastName: z.string().regex(/^[a-zA-Z\s]*$/, 'Last Name can only contain letters').optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  message: z.string().optional(),
});

export const contractorRequestSchema = z.object({
  firstName: z.string().min(2, 'First Name must be at least 2 characters').regex(/^[a-zA-Z\s]+$/, 'First Name can only contain letters and spaces'),
  lastName: z.string().regex(/^[a-zA-Z\s]*$/, 'Last Name can only contain letters').optional().or(z.literal('')),
  company: z.string().optional(),
  gstNumber: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits').optional().or(z.literal('')),
  city: z.string().regex(/^[a-zA-Z\s]*$/, 'City can only contain letters and spaces').optional().or(z.literal('')),
  businessType: z.string().optional(),
});

export const trackParamsSchema = z.object({
  id: z.string().min(1),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED']),
  notes: z.string().optional(),
});

export const adminLoginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export const adminProductMediaSchema = z.object({
  type: z.enum(['IMAGE', 'THUMBNAIL', 'VIDEO']).optional(),
  url: z.string().min(1),
  storageKey: z.string().optional(),
  altText: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const adminProductVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  unit: z.string().optional(),
  image: z.string().optional(),
  attributes: z.record(z.unknown()).optional(),
  dimensions: z.record(z.unknown()).optional(),
  stock: z.number().int().nonnegative().optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const adminProductWriteSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  sku: z.string().min(1),
  categoryId: z.string().min(1),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  description: z.string().min(1),
  basePrice: z.number().nonnegative(),
  unit: z.string().optional(),
  stock: z.number().int().nonnegative().optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  badge: z.string().nullable().optional(),
  features: z.array(z.string()).optional(),
  specifications: z.record(z.unknown()).optional(),
  searchKeywords: z.array(z.string()).optional(),
  origin: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  model3D: z.string().nullable().optional(),
  thickness: z.string().nullable().optional(),
  density: z.string().nullable().optional(),
  durabilityScore: z.number().int().min(0).max(100).nullable().optional(),
  waterResistant: z.boolean().optional(),
  fireResistant: z.boolean().optional(),
  termiteResistant: z.boolean().optional(),
  weight: z.string().nullable().optional(),
  dimensions: z.string().nullable().optional(),
  grade: z.string().nullable().optional(),
  warranty: z.string().nullable().optional(),
  deliveryTimeline: z.string().nullable().optional(),
  variants: z.array(adminProductVariantSchema).optional(),
  media: z.array(adminProductMediaSchema).optional(),
  tagNames: z.array(z.string()).optional(),
});

export const adminCategoryWriteSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const inventoryAdjustmentSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  quantityChange: z.number().int(),
  reason: z.string().min(1),
  warehouseId: z.string().optional(),
}).refine((data) => data.productId || data.variantId, {
  message: 'productId or variantId is required',
});

export const contractorReviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  adminNotes: z.string().optional(),
  discountRate: z.number().min(0).max(100).optional(),
});
