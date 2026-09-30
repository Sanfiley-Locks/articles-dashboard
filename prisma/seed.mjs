import { readFile } from "node:fs/promises";
import nextEnv from "@next/env";
import { getPrisma } from "../lib/prisma.js";
import { validateArticle } from "../lib/article-validation.js";

nextEnv.loadEnvConfig(process.cwd());

let prisma;
try {
  const articles = JSON.parse(
    await readFile(new URL("../data/articles.json", import.meta.url), "utf8")
  );
  if (!Array.isArray(articles)) throw new Error("Expected an article array.");

  const data = articles.map((article, index) => {
    const error = validateArticle(article);
    if (error) throw new Error(`Article ${index + 1}: ${error}`);
    if (typeof article.id !== "string" || !article.id ||
        typeof article.slug !== "string" || !article.slug) {
      throw new Error(`Article ${index + 1} needs an ID and slug.`);
    }
    const createdAt = new Date(article.createdAt);
    const updatedAt = new Date(article.updatedAt);
    if (!Number.isFinite(createdAt.getTime()) || !Number.isFinite(updatedAt.getTime())) {
      throw new Error(`Article ${index + 1} has invalid timestamps.`);
    }
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      featuredImage: article.featuredImage || "",
      shortDescription: article.shortDescription || "",
      content: article.content || "",
      status: article.status || "draft",
      websiteType: article.websiteType,
      createdAt,
      updatedAt,
    };
  });

  prisma = getPrisma();
  // Insert in one atomic operation; preserve existing articles on repeat runs.
  const result = await prisma.article.createMany({ data, skipDuplicates: true });
  console.log(`Seed complete: ${result.count} articles created; ${data.length - result.count} existing articles skipped.`);
} catch (error) {
  console.error(`Seed failed (${error.code || error.name}). Check the sample data, DATABASE_URL, and applied migrations.`);
  process.exitCode = 1;
} finally {
  await prisma?.$disconnect();
}
