# JK Timbers Phase 4 Business Systems Audit And Core Engine Report

Date: 2026-05-17

## 1. Full Business Systems Audit

The Phase 4 audit found that the project had useful commerce primitives but the runtime business flows were not yet operational-grade.

Key issues found:

- Product schema was ahead of the UI and service layer. Code still referenced old `price` fields while Prisma exposed `basePrice`.
- Checkout was not server-authoritative. Orders could be created from client-provided totals and stale cart snapshots.
- Inventory deduction existed, but it did not consistently carry order context, before/after stock snapshots, or serializable transaction protection.
- Order transitions were only partially enforced in the UI and admin actions could jump from `PENDING` to `SHIPPED`.
- Cart persistence existed, but server sync trusted client item metadata and price strings.
- Contractor applications existed, but approval, role promotion, discount readiness, admin tooling, and contractor dashboard visibility were missing.
- Product search supported basic filtering but did not return pagination metadata or specification filters.
- Catalog, visualizer, showroom, and calculator pages were statically querying live commerce data during build.
- Admin product operations were read-only; there were no secured product/category/media/inventory APIs.

## 2. Product Architecture

Implemented a scalable product architecture around:

- Product status: `DRAFT`, `PUBLISHED`, `ARCHIVED`.
- Category hierarchy with active flags and parent/subcategory support.
- SKU-backed products and variants.
- Variant metadata: unit, image, dimensions, attributes, sort order, active state, low-stock threshold.
- Product media metadata: storage key, mime type, size, dimensions, primary image, ordering.
- Product specifications and search keywords for future richer filtering.
- Admin product/category API surface:
  - `GET/POST /api/admin/products`
  - `GET/PATCH/DELETE /api/admin/products/[id]`
  - `GET/POST /api/admin/categories`

The logical Prisma field `basePrice` is mapped to the existing database `price` column to preserve existing data while standardizing application code.

## 3. Inventory System

Inventory now uses a centralized inventory service with transaction-safe movements:

- Atomic stock deduction with `updateMany` guards.
- Stock restoration for cancellable order states.
- Manual inventory adjustments.
- Inventory transaction history with source, reason, order, actor, warehouse, and before/after stock snapshots.
- Low-stock readiness for products and variants.
- Warehouse readiness through the `Warehouse` model and optional inventory transaction warehouse references.

Critical inventory updates are executed through Prisma transactions with serializable isolation for checkout and order status changes.

## 4. Order Lifecycle

The order lifecycle now uses a dedicated state machine:

- `PENDING -> CONFIRMED -> PROCESSING -> PACKED -> SHIPPED -> DELIVERED -> COMPLETED`
- `CANCELLED` is allowed only before shipment.
- `REFUNDED` is allowed only after delivery/completion.
- Invalid transitions throw before mutation.
- Status updates write timeline records.
- Cancellation restores stock in the same transaction.
- Orders now carry order numbers, cart linkage, subtotal, tax, delivery fee, discount total, total, currency, payment method, and payment status.

## 5. Cart And Checkout Architecture

Checkout is now server-authoritative:

- Cart sync resolves products and variants from the database.
- Client price/name/image data is not trusted for cart totals.
- Checkout creates orders from the persisted cart token.
- Cart conversion, order creation, item creation, status history, inventory deduction, and cart checkout marking happen in one serializable transaction.
- Cart reuse after checkout rotates to a fresh server cart token.
- Totals are recalculated server-side and compared to the client expected total only as a stale-cart guard.

Payments are intentionally not implemented, but payment method/status fields are ready for integration.

## 6. Contractor Workflow

Implemented contractor operational workflow:

- Contractor applications accept business profile fields.
- Applications are upserted by email to prevent duplicate pending submissions.
- Admin review API approves or rejects applications.
- Approval promotes or creates a user as `CONTRACTOR`.
- Contractor discount readiness is stored on the application.
- Admin contractor review page added at `/admin/contractors`.
- Contractor dashboard added at `/contractor/dashboard`.

## 7. Search And Filtering

Product discovery now supports:

- Keyword search across name, description, and slug.
- Category ID and category slug filtering.
- Tag filtering.
- Price range filtering.
- Stock filtering.
- Specification filters through `spec.*` query params.
- Sorting by price, newest, and name.
- Pagination metadata with total and total pages.

The route `GET /api/products` now returns `{ products, pagination }`, which prepares the system for Algolia, Elasticsearch, or AI-enhanced search adapters.

## 8. Media And Asset Management

Added secure admin media upload foundation:

- `POST /api/admin/media`
- JPEG, PNG, and WebP allowlist.
- 5MB size limit.
- Files stored under `public/uploads/products`.
- Response includes URL, storage key, mime type, and size.

The schema now stores metadata required for future CDN/object-storage migration.

## 9. Business Rule Standardization

Centralized business rules now live in services:

- `pricingService.ts`: money parsing, line pricing, contractor discount readiness, tax/delivery readiness, total validation.
- `inventoryService.ts`: stock deduction, restoration, manual adjustment, history.
- `orderStateMachine.ts`: transition rules and stock restoration policy.
- `orderService.ts`: server cart conversion and lifecycle mutations.
- `cartService.ts`: server-authoritative cart validation and pricing.
- `contractorService.ts`: contractor review and role promotion.

Frontend calculations are now display-only and no longer authoritative for order creation.

## 10. Transaction Safety

Protected operations:

- Checkout/cart conversion.
- Order creation.
- Inventory deduction.
- Order cancellation.
- Stock restoration.
- Manual stock adjustment.

Concurrency controls:

- Serializable Prisma transactions for checkout and order status updates.
- Atomic stock guard using `stock >= requested quantity`.
- Status update guard using `where: { id, status: currentStatus }`.
- Unique cart-to-order linkage to reduce duplicate checkout risk.

## 11. Admin Operations Panel

Expanded admin operations:

- Product/inventory page now shows SKU, variants, status, and base price.
- Order page now exposes valid next-status controls.
- Dashboard todo confirms pending orders instead of jumping to shipped.
- Contractor approval UI added.
- Admin APIs added for products, categories, inventory, media, contractors, and order state transitions.

## 12. Performance And Scalability Review

Improvements:

- Product discovery paginates and returns counts in one transaction.
- Catalog DB pages that depend on live product data are dynamic instead of build-time static.
- Product listing includes related media, variants, category, and tags in bounded admin queries.
- Order queries include items and timeline only where operationally needed.

Remaining performance work:

- Add database indexes for high-volume text search or migrate search to a dedicated engine.
- Move media storage from local filesystem to object storage/CDN.
- Add cursor pagination for very large order and inventory transaction tables.
- Add observability around checkout retries and stock contention.

## 13. Testing And Validation

Completed:

- `npx prisma validate`
- `npx tsc --noEmit`
- `npm run test:commerce`
- `npm run build`
- Local PostgreSQL schema aligned with Prisma using a data-preserving SKU backfill.

Added:

- `tests/commerce-core.test.ts` for pricing totals, expected-total mismatch detection, valid/invalid order transitions, and inventory restoration policy.

## 14. Remaining Operational Risks And Next Steps Before Payments

Remaining risks:

- Checkout has no payment idempotency key yet.
- Inventory reservations are deducted at order placement; payment integration should define reservation expiry for prepaid failures.
- Local media uploads are not production CDN storage.
- No background job exists for abandoned carts, low-stock notifications, or payment reconciliation.
- No end-to-end database concurrency test suite exists yet.

Recommended next steps:

1. Add payment provider idempotency and webhook verification.
2. Add payment attempt and payment event tables.
3. Add stock reservation expiry for unpaid online payment attempts.
4. Move product media to S3/R2/GCS with signed upload URLs.
5. Add integration tests against a disposable PostgreSQL database.
6. Add search adapter interface for Algolia/Elasticsearch.
7. Add admin audit logging for all product, inventory, order, and contractor mutations.
