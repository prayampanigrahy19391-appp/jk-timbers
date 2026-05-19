# Backup and Restore Strategy

This document describes the backup and restore plan for the JK Timbers application.

## PostgreSQL Backup Strategy

1. Daily automated backups.
   - Use `pg_dump` for logical exports.
   - Use provider-managed snapshots or `pg_basebackup` for physical backups when possible.

2. Retention policy.
   - Keep at least 14 daily backups.
   - Retain weekly snapshots for 8 weeks.
   - Retain monthly snapshots for 12 months.

3. Backup verification.
   - Restore backups to a separate staging environment regularly.
   - Validate schema migrations and sample data.

## Recommended Backup Commands

Logical backup:

```bash
pg_dump --format=custom --file=jk_timbers_backup_$(date +%F).dump "$DATABASE_URL"
```

Restore to a test database:

```bash
pg_restore --clean --if-exists --dbname="$TEST_DATABASE_URL" jk_timbers_backup_YYYY-MM-DD.dump
```

## Restore Testing

1. Restore a recent backup to a non-production database.
2. Run `prisma migrate status` to confirm migration state.
3. Run smoke tests or sample query validation.
4. Confirm that critical data such as users, orders, and products are present.

## Configuration

- Use `.env.example` as a template for production secrets.
- Keep backup credentials and cloud access keys in a secure vault.
- Do not store secrets in source control.
