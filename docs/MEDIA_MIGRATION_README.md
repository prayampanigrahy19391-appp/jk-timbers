# Media Migration

This script backfills `product_media` rows from the `images` JSON column on `product`.

Usage (dry-run):

```bash
npm run migrate:media
```

To perform the migration against your database (ensure `DATABASE_URL` is set):

```bash
NODE_ENV=production npx tsx scripts/migrate_images_to_media.ts
```

Notes:
- The script is idempotent for media creation only if you ensure the products do not already have media rows. It does not delete or modify existing `product_media` rows.
- Run it in batches on large catalogs.
- Consider adding validation to ensure storage keys and sizes are captured after migrating media URLs to object storage.

After migration, consider removing the `images` JSON usage in favor of normalized `product_media` lookups in code.
