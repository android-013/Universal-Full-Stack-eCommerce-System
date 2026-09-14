import { z } from "zod";

export const productAttributeSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1).optional(),
  valueType: z.string().min(1).default("string"),
  value: z.string().min(1),
  filterable: z.boolean().default(true),
});

export const productVariantSchema = z.object({
  sku: z.string().min(1),
  barcode: z.string().optional(),
  title: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
  options: z.record(z.string(), z.string()).default({}),
});

export const productImageSchema = z.object({
  url: z.string().min(1),
  altText: z.string().min(1),
  position: z.number().int().nonnegative().default(0),
});

export const createProductSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().min(1),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  brand: z.string().optional(),
  productType: z.string().min(1),
  basePriceCents: z.number().int().nonnegative(),
  currency: z.string().length(3).default("USD"),
  categoryIds: z.array(z.string().min(1)).default([]),
  attributes: z.array(productAttributeSchema).default([]),
  variants: z.array(productVariantSchema).default([]),
  images: z.array(productImageSchema).default([]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
