export const PERMISSIONS = [
  { key: "users:read", description: "Read user accounts" },
  { key: "users:manage", description: "Manage user accounts and roles" },
  { key: "products:manage", description: "Manage products, categories, variants, and attributes" },
  { key: "inventory:manage", description: "Manage inventory items and transactions" },
  { key: "orders:manage", description: "Manage orders and fulfillment state" },
  { key: "payments:manage", description: "Manage payments and refunds" },
  { key: "shipping:manage", description: "Manage shipments and delivery integrations" },
  { key: "analytics:read", description: "Read analytics and reports" },
  { key: "seo:manage", description: "Manage SEO drafts and publishing" },
  { key: "notifications:manage", description: "Manage notifications" },
] as const;

export const DEFAULT_ROLES = [
  { name: "Super Admin", description: "Full platform access" },
  { name: "Admin", description: "Administrative access" },
  { name: "Manager", description: "Business operations access" },
  { name: "Moderator", description: "Content and review moderation access" },
  { name: "Inventory Manager", description: "Inventory operations access" },
  { name: "Marketing Manager", description: "SEO, analytics, and campaign access" },
  { name: "Contractor", description: "Limited operational access" },
  { name: "Delivery Personnel", description: "Shipment and delivery access" },
  { name: "Customer", description: "Customer account access" },
] as const;

export const rolePermissionMap: Record<string, string[]> = {
  "Super Admin": PERMISSIONS.map((permission) => permission.key),
  Admin: [
    "users:read",
    "products:manage",
    "inventory:manage",
    "orders:manage",
    "payments:manage",
    "shipping:manage",
    "analytics:read",
    "seo:manage",
    "notifications:manage",
  ],
  Manager: ["products:manage", "inventory:manage", "orders:manage", "analytics:read"],
  Moderator: ["products:manage", "seo:manage"],
  "Inventory Manager": ["inventory:manage"],
  "Marketing Manager": ["analytics:read", "seo:manage", "notifications:manage"],
  Contractor: ["products:manage"],
  "Delivery Personnel": ["shipping:manage", "orders:manage"],
  Customer: [],
};
