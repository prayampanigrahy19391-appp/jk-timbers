# JK Timbers Refactoring Guide

## Quick Navigation

### For Developers
- [Architecture Overview](#architecture-overview)
- [Layer Explanations](#layer-explanations)
- [Adding New Features](#adding-new-features)
- [Conventions & Standards](#conventions--standards)

### For DevOps/Infrastructure
- [Environment Setup](#environment-setup)
- [Build & Deployment](#build--deployment)
- [Database Migrations](#database-migrations)

---

## Architecture Overview

JK Timbers uses a **layered architecture** with clear separation of concerns:

```
Browser Request
       ↓
  Route Handler (thin)
       ↓
  Controller (validation + orchestration)
       ↓
  Service Layer (business logic)
       ↓
  Repository Layer (data access)
       ↓
  Database
```

### Why This Pattern?

✅ **Testability** - Services can be unit tested without database  
✅ **Maintainability** - Each layer has single responsibility  
✅ **Scalability** - Easy to add new features without touching existing code  
✅ **Type Safety** - Full TypeScript support with Zod validation  

---

## Layer Explanations

### 1. Route Handlers (`src/app/api/*/route.ts`)

**Responsibility**: Accept HTTP request, delegate to controller

**Pattern**:
```typescript
import { checkoutController } from '@/controllers/api/checkoutController';

export async function POST(request: Request) {
  return checkoutController(request);
}
```

**Rules**:
- ✅ Should be < 5 lines
- ✅ Call controller, return response
- ❌ NO database queries
- ❌ NO business logic
- ❌ NO validation

### 2. Controllers (`src/controllers/api/*Controller.ts`)

**Responsibility**: Parse & validate request, orchestrate services, format response

**Pattern**:
```typescript
export async function checkoutController(request: Request) {
  const parsed = await parseJsonBody(request, checkoutRequestSchema);
  if (!parsed.success) {
    return errorResponse('Invalid checkout data.', 400);
  }

  try {
    const order = await createCheckoutOrder(parsed.data);
    return jsonResponse({ success: true, data: { orderId: order.id } }, 201);
  } catch (error) {
    return errorResponse('Failed to process order.', 500);
  }
}
```

**Rules**:
- ✅ Validate input with Zod schema
- ✅ Handle errors gracefully
- ✅ Call service functions
- ❌ NO database queries
- ❌ NO complex business logic
- ❌ Keep < 30 lines

### 3. Services (`src/services/*Service.ts`)

**Responsibility**: Implement business logic, orchestrate repositories

**Pattern**:
```typescript
export async function createCheckoutOrder(options: { items; customer; paymentMethod; total }) {
  const category = await upsertTimberCategory();
  await Promise.all(items.map(item => upsertProductFromCartItem(item, category.id)));
  
  const order = await createOrder({
    customerName: options.customer.name,
    // ... map data ...
    orderItems: { create: ... }
  });

  return order;
}
```

**Rules**:
- ✅ Contains all business logic
- ✅ Calls repositories for data access
- ✅ Pure functions (same input = same output)
- ❌ NO HTTP handling
- ❌ NO validation (use schemas at controller)
- ✅ Can throw errors (controller catches them)

### 4. Repositories (`src/repositories/*Repository.ts`)

**Responsibility**: Abstract database access, provide CRUD operations

**Pattern**:
```typescript
export async function createOrder(orderData: Parameters<typeof prisma.order.create>[0]['data']) {
  return prisma.order.create({ data: orderData });
}

export async function findOrderById(id: string) {
  return prisma.order.findUnique({ where: { id }, select: { ... } });
}
```

**Rules**:
- ✅ Only Prisma queries
- ✅ Simple, single-purpose functions
- ✅ No business logic
- ❌ NO loops or conditionals (use services)
- ✅ Reusable across services

### 5. Schemas (`src/schemas/apiSchema.ts`)

**Responsibility**: Define validation rules using Zod

**Pattern**:
```typescript
export const checkoutRequestSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  customer: checkoutCustomerSchema,
  paymentMethod: z.enum(['COD', 'BANK']),
  total: z.number().nonnegative(),
});
```

**Rules**:
- ✅ Use Zod for all input validation
- ✅ Reusable schemas composed together
- ✅ Include helpful error messages
- ✅ One schema per API operation

---

## Adding New Features

### Example: Add a "Subscribe to Newsletter" API

#### Step 1: Define Schema (`src/schemas/apiSchema.ts`)

```typescript
export const newsletterSubscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});
```

#### Step 2: Create Repository (`src/repositories/newsletterRepository.ts`)

```typescript
import { prisma } from '@/lib/prisma';

export async function createSubscriber(email: string, name: string) {
  return prisma.newsletterSubscriber.create({
    data: { email, name }
  });
}

export async function findSubscriberByEmail(email: string) {
  return prisma.newsletterSubscriber.findUnique({ where: { email } });
}
```

#### Step 3: Create Service (`src/services/newsletterService.ts`)

```typescript
import { createSubscriber, findSubscriberByEmail } from '@/repositories/newsletterRepository';

export async function subscribeToNewsletter(email: string, name: string) {
  const existing = await findSubscriberByEmail(email);
  if (existing) {
    throw new Error('Email already subscribed');
  }
  
  return createSubscriber(email, name);
}
```

#### Step 4: Create Controller (`src/controllers/api/newsletterController.ts`)

```typescript
import { newsletterSubscribeSchema } from '@/schemas/apiSchema';
import { parseJsonBody, errorResponse, jsonResponse } from '@/utils/api';
import { subscribeToNewsletter } from '@/services/newsletterService';

export async function newsletterController(request: Request) {
  const parsed = await parseJsonBody(request, newsletterSubscribeSchema);
  if (!parsed.success) {
    return errorResponse('Invalid subscription data.', 400);
  }

  try {
    await subscribeToNewsletter(parsed.data.email, parsed.data.name);
    return jsonResponse({ success: true, data: { message: 'Subscribed!' } }, 201);
  } catch (error) {
    if ((error as Error).message.includes('already subscribed')) {
      return errorResponse('Email already subscribed.', 409);
    }
    return errorResponse('Failed to subscribe.', 500);
  }
}
```

#### Step 5: Create Route (`src/app/api/newsletter/subscribe/route.ts`)

```typescript
import { newsletterController } from '@/controllers/api/newsletterController';

export async function POST(request: Request) {
  return newsletterController(request);
}
```

#### Step 6: Update Prisma Schema (`prisma/schema.prisma`)

```prisma
model NewsletterSubscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Step 7: Run Migration

```bash
npx prisma migrate dev --name add_newsletter_subscribers
```

---

## Conventions & Standards

### Naming

| Item | Pattern | Example |
|------|---------|---------|
| **Repository Functions** | verb + noun | `findOrderById`, `createUser`, `updateOrderStatus` |
| **Service Functions** | descriptive action | `processCheckoutOrder`, `sendNotification` |
| **Controller Functions** | `[routeName]Controller` | `checkoutController`, `newsletterController` |
| **Schema Definitions** | `[domain]Schema` or `[action]Schema` | `checkoutRequestSchema`, `userSchema` |
| **Type Definitions** | PascalCase | `CartItem`, `OrderData`, `ApiResponse` |
| **Utility Functions** | camelCase | `parsePrice`, `jsonResponse`, `errorResponse` |

### Error Handling

**Controllers** catch and handle errors:
```typescript
try {
  const result = await someService();
  return jsonResponse(result);
} catch (error) {
  console.error('Error:', error);
  return errorResponse('User-friendly message', statusCode);
}
```

**Services** throw meaningful errors:
```typescript
if (!order) {
  throw new Error('Order not found');
}
```

### Type Safety

Always use proper types:
```typescript
// ❌ BAD
async function createOrder(data: any) { }

// ✅ GOOD
async function createOrder(data: Parameters<typeof prisma.order.create>[0]['data']) { }

// Or with types:
interface CreateOrderInput {
  customerName: string;
  email: string;
  // ...
}
async function createOrder(data: CreateOrderInput) { }
```

### Response Format

All API responses follow standard format:

**Success**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Error**:
```json
{
  "success": false,
  "error": "User-friendly error message"
}
```

---

## Environment Setup

### Required Environment Variables

Create `.env.local`:
```env
DATABASE_URL="file:./dev.db"
ADMIN_SECRET="your-secure-admin-password-here"
```

Create `.env.production`:
```env
DATABASE_URL="postgresql://user:pass@host/db"
ADMIN_SECRET="production-admin-secret"
```

Create `.env.example` (for documentation):
```env
DATABASE_URL="file:./dev.db"
ADMIN_SECRET="change-this-in-production"
```

### Installation

```bash
# Install dependencies
npm install

# Setup Prisma
npx prisma generate
npx prisma migrate dev

# Start dev server
npm run dev

# Open http://localhost:3000
```

---

## Build & Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Linting & Type Checking

```bash
npm run lint
npx tsc --noEmit
```

---

## Database Migrations

### Create New Migration

```bash
# Make schema.prisma changes, then:
npx prisma migrate dev --name description_of_change
```

### Rollback (Development Only)

```bash
npx prisma migrate resolve --rolled-back migration_name
```

### Production Deployment

```bash
# Backup database first!
npx prisma migrate deploy
```

---

## Testing Strategy (Phase 2)

### Unit Tests (Services)

```typescript
// __tests__/services/orderService.test.ts
describe('orderService', () => {
  it('should create checkout order', async () => {
    const order = await createCheckoutOrder({
      items: [...],
      customer: {...},
      paymentMethod: 'COD',
      total: 5000
    });
    
    expect(order.id).toBeDefined();
    expect(order.status).toBe('PENDING');
  });
});
```

### Integration Tests (Routes)

```typescript
// __tests__/api/checkout.test.ts
describe('POST /api/checkout', () => {
  it('should create order and return orderId', async () => {
    const response = await fetch('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify({...})
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.orderId).toBeDefined();
  });
});
```

---

## Troubleshooting

### Common Issues

**Issue**: `parseJsonBody is not a function`
- **Cause**: Importing from wrong path
- **Fix**: `import { parseJsonBody } from '@/utils/api'`

**Issue**: `Zod schema not working`
- **Cause**: Missing `.parse()` or `.safeParse()`
- **Fix**: Use `safeParse()` in controllers for better error handling

**Issue**: Database query returns `undefined`
- **Cause**: Prisma can't find record
- **Fix**: Add error handling: `if (!record) { throw new Error(...) }`

**Issue**: React component can't import from `@/lib/prisma`
- **Cause**: Trying to use server library in client component
- **Fix**: Move to server component or create service/API route

---

## Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Zod Documentation](https://zod.dev/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

Last Updated: May 17, 2026
