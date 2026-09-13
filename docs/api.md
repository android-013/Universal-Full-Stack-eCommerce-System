# API Documentation

The backend exposes a versioned REST API at `/api`.

## Core Routes

- `GET /api/health` - Service health and uptime.
- `POST /api/auth/register` - Create a customer account.
- `POST /api/auth/login` - Authenticate and receive access and refresh tokens.
- `GET /api/auth/me` - Read the authenticated user.
- `GET /api/users` - List users. Requires user management permission.
- `GET /api/categories` - Read the nested category tree.
- `POST /api/categories` - Create a category. Requires product management permission.
- `GET /api/products` - Search and filter products.
- `POST /api/products` - Create a product. Requires product management permission.
- `GET /api/products/:slug` - Read product details by permanent SEO slug.
- `GET /api/cart` - Read or create a guest/user cart.
- `POST /api/cart/items` - Add an item to a cart.
- `PATCH /api/cart/items/:id` - Update cart quantity. Quantity `0` removes the item.
- `DELETE /api/cart/items/:id` - Remove a cart item.
- `POST /api/cart/sync` - Merge a guest cart into a user cart after login.
- `GET /api/wishlist` - Read the authenticated user's wishlist.
- `POST /api/wishlist/items` - Save a product to wishlist.
- `DELETE /api/wishlist/items/:productId` - Remove a product from wishlist.
- `POST /api/wishlist/items/:productId/move-to-cart` - Move a wishlist product into the user's cart.
- `GET /api/inventory` - Read inventory balances. Requires inventory permission.
- `POST /api/inventory/transactions` - Append an inventory ledger transaction.
- `GET /api/orders` - List orders.
- `POST /api/orders` - Create an order.
- `PATCH /api/orders/:id/status` - Transition an order through the state machine.
- `POST /api/payments/intent` - Create a payment intent through the selected provider.
- `POST /api/shipping/rates` - Quote shipping options.
- `POST /api/analytics/events` - Record analytics events.
- `POST /api/seo/products/:productId/drafts` - Generate an SEO draft.
- `POST /api/notifications` - Queue a notification.

Swagger UI is mounted at `/api/docs`. The current scaffold includes a hand-authored OpenAPI base document and should be expanded with generated schemas as route validation grows.
