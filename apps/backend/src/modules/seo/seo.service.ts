import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http.js";
import { prisma } from "../../lib/prisma.js";

export async function generateProductSeoDraft(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: true,
      attributes: {
        include: { definition: true },
      },
      images: true,
    },
  });

  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  const keywords = [
    product.title,
    product.productType,
    product.brand,
    ...product.attributes.map((attribute) => attribute.value),
  ].filter(Boolean);

  return prisma.seoDraft.create({
    data: {
      productId: product.id,
      status: "DRAFT",
      metaTitle: `${product.title} | Universal Commerce`,
      metaDescription: product.description.slice(0, 155),
      keywordsJson: JSON.stringify(keywords),
      schemaJson: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: product.description,
        sku: product.variants?.[0]?.sku,
        url: `${env.API_BASE_URL.replace(":4000", ":3000")}/product/${product.slug}`,
        offers: {
          "@type": "Offer",
          priceCurrency: product.currency,
          price: (product.basePriceCents / 100).toFixed(2),
          availability: "https://schema.org/InStock",
        },
      }),
      faqJson: JSON.stringify([
        {
          question: `What variants are available for ${product.title}?`,
          answer: "Available variants are generated from the product's dynamic attribute configuration.",
        },
      ]),
      imageAltTextJson: JSON.stringify(
        product.images.map((image) => ({
          url: image.url,
          altText: image.altText,
        })),
      ),
      internalLinksJson: JSON.stringify([
        {
          label: product.productType,
          href: `/search?type=${encodeURIComponent(product.productType)}`,
        },
      ]),
    },
  });
}
