# JK Timbers Production Stabilization Report

Date: 2026-05-18

## Executive Summary

This pass moved JK Timbers from "builds but has known production blockers" to a cleaner stabilization baseline. The application now passes lint, production build, Prisma validation, and the expanded core stability tests. A Prisma baseline migration was generated and proven against a disposable seeded PostgreSQL schema.

The platform is improved, but it is not fully production-ready for live payments yet. The most important remaining blocker is operational: the current configured `public` database schema has not been baselined or migrated, and Razorpay browser checkout still needs a full end-to-end sandbox exercise with real sandbox credentials.

## Fixed In This Pass

### Critical / High

- Fixed the ESLint blocker in `src/config/env.ts` by removing the dynamic `require('dotenv')` pattern and expanding the typed environment contract.
- Migrated the deprecated Next 16 `src/middleware.ts` convention to `src/proxy.ts`; production build no longer reports the middleware-to-proxy deprecation warning.
- Fixed auth cookie behavior so the `__Secure-` session cookie name is only used in production HTTPS.
- Added API-wide proxy rate limiting, with tighter limits for auth, cart, checkout, contact, and contractor registration endpoints.
- Removed the hardcoded seeded admin password path. `ADMIN_SEED_PASSWORD` is now required before seeding.
- Aligned environment names for Razorpay and storage, including support for `RAZORPAY_WEBHOOK_SECRET`, `STORAGE_BUCKET`, and `STORAGE_REGION`.
- Hardened Razorpay webhook handling:
  - Resolves attempts by provider ref, session id, payment attempt id, order number, and local order id notes.
  - Handles duplicate webhook races using the unique `eventRef` constraint.
  - Rejects captured-payment amount mismatches before marking orders paid.
  - Avoids creating payment attempts with a Razorpay order id as a local order FK.
- Added backend Razorpay order creation support for configured Razorpay checkouts and returns payment metadata in the checkout API response.
- Prevented approved contractor applications from being reset to pending by repeat submissions.
- Replaced critical checkout/admin mutation `alert()` and raw console-error UX with inline error states.
- Added a redacting logger for sensitive server-side error contexts.

### Database / Operations

- Added `prisma/migrations/000001_init/migration.sql` and `migration_lock.toml`.
- Applied that migration successfully to a disposable PostgreSQL schema.
- Seeded a disposable PostgreSQL schema with admin, categories, warehouse, and products.
- Confirmed the current `public` DB is not changed; it now reports the new baseline migration as pending, as expected.

### Tests Added

- `tests/security-core.test.ts`
  - RBAC hierarchy
  - route-namespaced rate limiting
  - Razorpay webhook signature validation with the legacy `PAYMENT_WEBHOOK_SECRET` alias
- `tests/api-schema.test.ts`
  - checkout payload validation
  - product variant validation
  - inventory adjustment validation
  - contractor review validation
- `tests/integration/checkout.spec.ts`
  - replaces the broken Vitest placeholder
  - refuses unsafe integration DB targets
  - confirms disposable DB configuration when `TEST_DATABASE_URL` is present

## Verification Evidence

Passed:

- `npm run lint`
- `npm run test:stability`
- `npm run build`
- `npx prisma validate`
- Disposable DB: `npx prisma migrate deploy`
- Disposable DB: `npx prisma db seed`
- Disposable DB: `npm run test:integration`

Expected / tracked:

- `npx prisma migrate status` against the current configured `public` schema reports `000001_init` pending. This was not applied to avoid mutating the current DB.
- `npm audit --omit=dev` reports 2 moderate vulnerabilities from `postcss <8.5.10` nested under `next`. The suggested force fix is unsafe and should be handled by a deliberate Next patch/upgrade.

## Remaining Risks

### Critical

- Current database is not migration-managed yet. Baseline the existing production/public schema before deployment, then apply migrations through CI/CD.
- Razorpay browser flow is not fully end-to-end verified. Backend can create Razorpay orders when configured, but the public checkout UI still needs the Razorpay checkout script, success callback signature verification, failure handling, and sandbox screenshots/tests.

### High

- Rate limiting is in-memory and per-instance. Use Redis or another shared store before horizontal scaling.
- No CSRF token layer exists for authenticated state-changing routes beyond same-site cookies and auth checks.
- No real email/SMS notification delivery or retry queue exists for orders, payments, low stock, or contractor approvals.
- Local media uploads under `public/uploads` are not production storage. Use S3/R2/GCS with CDN and malware/content scanning.
- Admin/product/order APIs still need full database integration tests for unauthorized, forbidden, malformed, and race cases.

### Medium

- Product search uses database `contains` filters and will not scale to large catalogs without full-text indexes or a search adapter.
- Payment reconciliation jobs are missing; webhook-only payment state can drift if provider events are delayed or missed.
- Current CSP is compatibility-oriented and uses `unsafe-inline`. A nonce-based CSP should replace it after Razorpay and Next scripts are fully mapped.
- Some public pages still need browser-based responsive and accessibility validation.

## Production Readiness Scores

- Stability: 78/100
- Security: 72/100
- Performance: 70/100
- Maintainability: 80/100

Overall production readiness: 74/100. Suitable for continued staging hardening, not yet approved for live payment production.

## Recommended Next Actions

1. Baseline the current database with Prisma Migrate intentionally, then apply `000001_init` only where appropriate.
2. Complete Razorpay browser checkout and signature verification E2E with sandbox credentials.
3. Add Redis-backed rate limiting and CSRF tokens for authenticated mutations.
4. Add DB-backed integration tests for checkout concurrency, duplicate webhooks, inventory restoration, and RBAC bypass attempts.
5. Move uploads to object storage and add file scanning.
6. Resolve the nested PostCSS advisory through a deliberate Next.js patch/upgrade path, not `npm audit fix --force`.
