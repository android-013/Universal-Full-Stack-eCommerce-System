type SearchableProduct = {
  title: string;
  slug: string;
  description: string;
  brand?: string | null;
  attributes?: Array<{ value: string; definition: { key: string; name: string; filterable: boolean } }>;
};

export type AttributeFilter = {
  key: string;
  value: string;
  exclude?: boolean;
};

export function rankProducts<TProduct extends SearchableProduct>(products: TProduct[], query?: string) {
  if (!query?.trim()) {
    return products.map((product) => ({ product, score: 1 }));
  }

  const normalized = normalize(query);

  return products
    .map((product) => {
      const haystack = [
        product.title,
        product.slug,
        product.description,
        product.brand ?? "",
        ...(product.attributes ?? []).map((attribute) => attribute.value),
      ]
        .map(normalize)
        .join(" ");

      const exact = haystack.includes(normalized) ? 100 : 0;
      const partial = normalized
        .split(" ")
        .filter((term) => term.length > 1 && haystack.includes(term)).length * 15;
      const typo = Math.max(0, 10 - levenshtein(normalized, normalize(product.title)));

      return {
        product,
        score: exact + partial + typo,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function filterProducts<TProduct extends SearchableProduct>(
  products: TProduct[],
  filters: AttributeFilter[],
) {
  if (!filters.length) {
    return products;
  }

  return products.filter((product) => {
    const attributes = product.attributes ?? [];

    return filters.every((filter) => {
      const hasValue = attributes.some(
        (attribute) =>
          attribute.definition.key === filter.key &&
          normalize(attribute.value) === normalize(filter.value),
      );

      return filter.exclude ? !hasValue : hasValue;
    });
  });
}

export function buildFacets<TProduct extends SearchableProduct>(products: TProduct[]) {
  const facets = new Map<string, Map<string, number>>();

  for (const product of products) {
    for (const attribute of product.attributes ?? []) {
      if (!attribute.definition.filterable) {
        continue;
      }

      const byValue = facets.get(attribute.definition.key) ?? new Map<string, number>();
      byValue.set(attribute.value, (byValue.get(attribute.value) ?? 0) + 1);
      facets.set(attribute.definition.key, byValue);
    }
  }

  return [...facets.entries()].map(([key, values]) => ({
    key,
    values: [...values.entries()].map(([value, count]) => ({ value, count })),
  }));
}

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function levenshtein(left: string, right: string) {
  const matrix = Array.from({ length: left.length + 1 }, () => Array<number>(right.length + 1).fill(0));

  for (let i = 0; i <= left.length; i += 1) matrix[i]![0] = i;
  for (let j = 0; j <= right.length; j += 1) matrix[0]![j] = j;

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost,
      );
    }
  }

  return matrix[left.length]![right.length]!;
}
