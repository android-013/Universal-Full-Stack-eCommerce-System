import { prisma } from "../../lib/prisma.js";
import { slugify } from "../../shared/slug.js";
import type { CreateCategoryInput } from "./categories.validators.js";

type CategoryNode = Awaited<ReturnType<typeof prisma.category.findMany>>[number] & {
  children: CategoryNode[];
};

export async function createCategory(input: CreateCategoryInput) {
  return prisma.category.create({
    data: {
      name: input.name,
      slug: input.slug ?? slugify(input.name),
      description: input.description ?? null,
      ...(input.parentId ? { parent: { connect: { id: input.parentId } } } : {}),
    },
  });
}

export async function listCategoryTree() {
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });

  const byId = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const category of categories) {
    byId.set(category.id, { ...category, children: [] });
  }

  for (const category of byId.values()) {
    if (category.parentId && byId.has(category.parentId)) {
      byId.get(category.parentId)!.children.push(category);
    } else {
      roots.push(category);
    }
  }

  return roots;
}
