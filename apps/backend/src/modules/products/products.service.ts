import { HttpError } from "../../lib/http.js";
import { prisma } from "../../lib/prisma.js";
import { buildFacets, filterProducts, rankProducts, type AttributeFilter } from "../../shared/search.js";
import { slugify } from "../../shared/slug.js";
import type { CreateProductInput } from "./products.validators.js";

const productInclude = {
  categories: {
    include: { category: true },
  },
  attributes: {
    include: { definition: true },
  },
  variants: true,
  images: {
    orderBy: { position: "asc" as const },
  },
  inventoryItems: true,
};

export async function createProduct(input: CreateProductInput) {
  const productSlug = input.slug ?? slugify(input.title);

  const attributeValues = [];
  for (const attribute of input.attributes) {
    const definition = await prisma.attributeDefinition.upsert({
      where: { key: attribute.key },
      update: {
        name: attribute.name ?? attribute.key,
        valueType: attribute.valueType,
        filterable: attribute.filterable,
      },
      create: {
        key: attribute.key,
        name: attribute.name ?? attribute.key,
        valueType: attribute.valueType,
        filterable: attribute.filterable,
      },
    });

    attributeValues.push({
      attributeDefinitionId: definition.id,
      value: attribute.value,
    });
  }

  return prisma.product.create({
    data: {
      title: input.title,
      slug: productSlug,
      description: input.description,
      status: input.status,
      brand: input.brand ?? null,
      productType: input.productType,
      basePriceCents: input.basePriceCents,
      currency: input.currency,
      seoTitle: `${input.title} | Universal Commerce`,
      seoDescription: input.description.slice(0, 160),
      canonicalUrl: `/product/${productSlug}`,
      categories: {
        create: input.categoryIds.map((categoryId) => ({ categoryId })),
      },
      attributes: {
        create: attributeValues,
      },
      variants: {
        create: input.variants.map((variant) => ({
          sku: variant.sku,
          barcode: variant.barcode ?? null,
          title: variant.title,
          priceCents: variant.priceCents,
          optionsJson: JSON.stringify(variant.options),
        })),
      },
      images: {
        create: input.images,
      },
    },
    include: productInclude,
  });
}

export async function listProducts(options: {
  query?: string | undefined;
  filters?: AttributeFilter[] | undefined;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED" | undefined;
}) {
  const products = await prisma.product.findMany({
    where: options.status ? { status: options.status } : {},
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });

  const ranked = rankProducts(products, options.query);
  const filtered = filterProducts(
    ranked.map((entry) => entry.product),
    options.filters ?? [],
  );

  return {
    items: filtered,
    facets: buildFacets(filtered),
    total: filtered.length,
  };
}

export async function readProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });

  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  return product;
}
