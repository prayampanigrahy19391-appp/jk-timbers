# Phase 4 — Core Business Engine: Migration & Design

Date: 2026-05-17

## Goals
- Stabilize product schema, media, inventory, and order lifecycles for production.
- Ensure transactional safety for checkout/order/inventory flows.
- Prepare media upload for CDN/object storage (S3/R2/GCS) with signed uploads.
- Add integration and concurrency tests for checkout/stock contention.

## Migration Plan
1. Product schema changes (non-destructive when possible):
   - Keep existing `price` column mapped to `basePrice` (already in schema).
   - Add `ProductMedia` rows (already present) and migrate `images` JSON to normalized rows.
   - Ensure `ProductVariant.price` used for variant pricing; backfill missing variants.
   - Add `PaymentAttempt` and `PaymentEvent` tables (new) for payment readiness.
2. Inventory:
   - Ensure all stock updates run via `inventoryService` and are wrapped in serializable transactions.
   - Add optional `reservedStock` if future reservation model required.
3. Orders:
   - Ensure `cartId` unique link to `Order` (already present) for idempotency.
   - Add payment idempotency key columns to `Order` or separate `PaymentAttempt` table.
4. Media:
   - Migrate `images` JSON to `product_media` rows.
   - Add `storageKey`, `mimeType`, `size`, `width`, `height` for CDN readiness.

## Testing Plan
- Add `tests/integration/checkout.spec.ts` that spins up a disposable Postgres (or uses a test DB) and tests concurrent checkout attempts against the same SKU/variant.
- Add `tests/integration/inventory.spec.ts` to verify stock restoration on order cancellation.

## Immediate Implementation Tasks
- Implement signed-upload endpoint for admin media: `/api/admin/media/upload-url`.
- Add `src/lib/storage.ts` S3 adapter with `getSignedUploadUrl()` and `getPublicUrl()`.
- Add integration test scaffolding and run `npm run test:commerce` to surface issues.

## Risks
- Backfilling `images` JSON to normalized rows may be slow for large catalogs—do in batches.
- Payment integration requires strong idempotency to avoid duplicate orders.

---
