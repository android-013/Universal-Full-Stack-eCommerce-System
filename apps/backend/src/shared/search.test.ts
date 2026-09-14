import { describe, expect, it } from "vitest";
import { buildFacets, filterProducts, rankProducts } from "./search.js";

const products = [
  {
    title: "Core Cotton Tee Black",
    slug: "core-cotton-tee-black",
    description: "Soft t-shirt",
    brand: "UCP",
    attributes: [
      { value: "Black", definition: { key: "color", name: "Color", filterable: true } },
      { value: "M", definition: { key: "size", name: "Size", filterable: true } },
    ],
  },
  {
    title: "Cold Pressed Olive Oil",
    slug: "cold-pressed-olive-oil",
    description: "Grocery item",
    brand: "Market",
    attributes: [
      { value: "1L", definition: { key: "volume", name: "Volume", filterable: true } },
      { value: "Glass", definition: { key: "packageType", name: "Package Type", filterable: false } },
    ],
  },
];

describe("search helpers", () => {
  it("ranks matching products", () => {
    const ranked = rankProducts(products, "cotton tee");
    expect(ranked[0]?.product.slug).toBe("core-cotton-tee-black");
  });

  it("applies include and exclude attribute filters", () => {
    expect(filterProducts(products, [{ key: "color", value: "Black" }])).toHaveLength(1);
    expect(filterProducts(products, [{ key: "color", value: "Black", exclude: true }])).toHaveLength(1);
    expect(filterProducts(products, [{ key: "color", value: "Black", exclude: true }])[0]?.slug).toBe(
      "cold-pressed-olive-oil",
    );
  });

  it("builds facets only from filterable attributes", () => {
    const facets = buildFacets(products);
    expect(facets.some((facet) => facet.key === "color")).toBe(true);
    expect(facets.some((facet) => facet.key === "packageType")).toBe(false);
  });
});
