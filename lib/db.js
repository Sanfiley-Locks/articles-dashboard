import { getPrisma } from "./prisma.js";

const editableFields = [
  "title", "featuredImage", "shortDescription", "content", "status", "websiteType",
];

function articleData(data) {
  return Object.fromEntries(
    editableFields.filter((field) => data[field] !== undefined)
      .map((field) => [field, data[field]])
  );
}

function serialize(article) {
  return article ? {
    ...article,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  } : null;
}

function slugify(title) {
  return title.toLowerCase().trim().replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "") || "article";
}

// The unique database constraint also protects against simultaneous writers.
async function saveWithSlug(title, save, ignoreId) {
  const prisma = getPrisma();
  const base = slugify(title);
  for (let suffix = 1; ; suffix += 1) {
    const slug = suffix === 1 ? base : `${base}-${suffix}`;
    const existing = await prisma.article.findUnique({ where: { slug }, select: { id: true } });
    if (existing && existing.id !== ignoreId) continue;
    try {
      return serialize(await save(slug));
    } catch (error) {
      if (error.code !== "P2002" || !error.meta?.target?.includes("slug")) throw error;
    }
  }
}

export async function getAllArticles({ websiteType, status } = {}) {
  const articles = await getPrisma().article.findMany({
    where: { websiteType, status },
    orderBy: { updatedAt: "desc" },
  });
  return articles.map(serialize);
}

export async function getArticleById(id) {
  return serialize(await getPrisma().article.findUnique({ where: { id } }));
}

export async function getArticleBySlug(slug) {
  return serialize(await getPrisma().article.findUnique({ where: { slug } }));
}

export async function createArticle(data) {
  const fields = articleData(data);
  return saveWithSlug(fields.title, (slug) =>
    getPrisma().article.create({ data: { ...fields, slug } })
  );
}

export async function updateArticle(id, data) {
  const prisma = getPrisma();
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return null;
  const fields = articleData(data);
  try {
    if (fields.title && fields.title !== existing.title) {
      return await saveWithSlug(fields.title, (slug) =>
        prisma.article.update({ where: { id }, data: { ...fields, slug } }), id
      );
    }
    return serialize(await prisma.article.update({ where: { id }, data: fields }));
  } catch (error) {
    if (error.code === "P2025") return null;
    throw error;
  }
}

export async function deleteArticle(id) {
  const result = await getPrisma().article.deleteMany({ where: { id } });
  return result.count > 0;
}
