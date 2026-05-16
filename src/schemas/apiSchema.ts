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
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  address: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(3),
});

export const checkoutRequestSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  customer: checkoutCustomerSchema,
  paymentMethod: z.enum(['COD', 'BANK']),
  total: z.number().nonnegative(),
});

export const contactRequestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  phone: z.string().min(6),
  message: z.string().optional(),
});

export const contractorRequestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  company: z.string().optional(),
  gstNumber: z.string().optional(),
  email: z.string().email(),
});

export const trackParamsSchema = z.object({
  id: z.string().min(1),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']),
});

export const adminLoginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});
