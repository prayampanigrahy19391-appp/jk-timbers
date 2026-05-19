# Production Deployment & Operations Guide

This document captures the production-ready deployment architecture, CI/CD workflow, monitoring, rollback controls, and operational readiness for JK Timbers.

## Recommended hosting architecture

### Frontend / application

- Deploy the Next.js app on Vercel for edge-optimized App Router hosting.
- Use separate Vercel environments for `preview`, `staging`, and `production`.
- Configure `NEXTAUTH_URL` and `VERCEL_URL` for each environment.

### Database

- Use a managed PostgreSQL service such as AWS RDS, Supabase, or Railway.
- Enforce encrypted connections and `sslmode=require` for production.
- Store `DATABASE_URL` and `DIRECT_URL` in a secure secret vault.
- Enable provider-managed backup snapshots with at least:
  - 14-day daily retention
  - 8-week weekly retention
  - 12-month monthly retention
- Use connection pooling at the database level if supported.

### Media storage & CDN

- Use AWS S3 or Cloudinary for production media.
- Serve image assets through a CDN to reduce origin load and accelerate delivery.
- Configure Next.js `remotePatterns` for `res.cloudinary.com` and `*.amazonaws.com`.
- Avoid storing media directly in the app repository or local filesystem.

### Secrets management

- Keep production secrets in GitHub Secrets and provider vaults.
- Do not persist `.env.production` or `.env.local` in Git.
- Use `.env.example` as a template only.
- Never expose `AUTH_SECRET`, payment provider secrets, database credentials, or Sentry DSN in client-facing code.

## CI/CD pipeline

The repository now includes a GitHub Actions workflow at `.github/workflows/ci-cd.yml`.

### Pipeline stages

1. `validate`
   - Checkout repository
   - Install dependencies with `npm ci`
   - Run `npm run lint`
   - Generate Prisma client
   - Run `npm run build`
   - Run `npm run test:stability`

2. `database-integration`
   - Starts a disposable PostgreSQL service in GitHub Actions
   - Deploys Prisma migrations to the ephemeral database
   - Runs `npx prisma db seed`
   - Executes integration tests

3. `deploy-production`
   - Runs only on pushes to `main`
   - Builds the application again to ensure deterministic output
   - Deploys to Vercel using secrets

### Deployment safety

- `deploy-production` is gated to `main` branch and depends on successful validation and database integration.
- Use branch protection rules requiring passing workflow checks before merge.
- Use manual review and verification before production deployments.

## Production environment configuration

Required environment variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `ADMIN_SEED_PASSWORD`
- `ENABLE_CREDENTIALS`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `PAYMENT_WEBHOOK_SECRET`
- `AWS_S3_BUCKET`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `SENTRY_DSN`
- `SENTRY_TRACES_SAMPLE_RATE`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VERCEL_SCOPE`

A template is available at `.env.example`.

## Monitoring & observability

### Error monitoring

- The app now includes `src/lib/monitoring.ts` and a structured logging wrapper.
- If `SENTRY_DSN` is configured, errors are captured and enriched with context.
- Use Sentry for crash rate tracking, release health, and transaction tracing.

### Logging

- `src/lib/logger.ts` now emits structured JSON payloads that are safe for ingestion by log providers.
- Error logs are sanitized to redact sensitive fields.
- Use provider logs with retention and alerting rules.

### Uptime and API monitoring

- Configure uptime probes for the homepage, login flow, checkout, and payment webhook endpoints.
- Add API latency alerts and error rate thresholds.
- Track merchant-facing pages, auth failures, and payment processing failures.

## Backup and recovery

- Keep a documented backup schedule and restore drill in sync with production database snapshots.
- Use `pg_dump` for logical exports when needed and provider-managed snapshots for disaster recovery.
- Restore backups to a staging instance regularly and run smoke tests.
- Keep backup credentials in a secure vault.

## Rollback procedure

1. Abort deployment immediately if build or post-deploy validation fails.
2. Revert the Git merge or commit on `main`.
3. Redeploy the last successful release from Vercel.
4. If database schema changed, restore from the latest validated backup before retrying.
5. Communicate to stakeholders and run smoke tests.

## Operational runbook

- Use the GitHub Actions workflow as the single source of truth for deployments.
- Keep environment-specific secrets isolated per environment.
- Use Vercel project preview deployments for feature branches.
- Use staging as the pre-production validation environment before `main`.
- Maintain a DR playbook for database restore and media recovery.

## Notes

- The current implementation is designed for a managed hosting architecture. Actual provisioning still needs to be completed on the chosen cloud provider.
- The repository now has a stable deployment scaffold and operational documentation for production readiness.
