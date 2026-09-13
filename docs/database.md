# Database Schema

Development uses SQLite through Prisma. The schema avoids SQLite-only assumptions so production can move to PostgreSQL.

## Main Domains

- Users, roles, permissions, role assignments, and refresh tokens.
- Unlimited nested categories through a self-referencing category table.
- Products with SEO slugs, variant records, attribute definitions, attribute values, images, category links, and reviews.
- Inventory items per warehouse and append-only inventory transactions.
- Carts, cart items, wishlists, and wishlist items.
- Orders, order items, payments, and shipments.
- Analytics events, SEO drafts, and notifications.

## JSON Usage

JSON files are used only for configuration:

- Store settings.
- Theme settings.
- SEO templates.
- Dynamic rules.
- Product templates.

Transactional commerce data remains in SQL tables.
