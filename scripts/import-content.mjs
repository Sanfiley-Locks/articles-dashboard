import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import { getPrisma } from "../lib/prisma.js";

nextEnv.loadEnvConfig(process.cwd());
const prisma = getPrisma();
const mimeTypes = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif" };

try {
  const articles = JSON.parse(await readFile("data/articles.json", "utf8"));
  if (!Array.isArray(articles)) throw new Error("Expected an array in data/articles.json.");
  const directory = path.resolve("public/uploads");
  const entries = await readdir(directory, { withFileTypes: true }).catch((error) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
  const uploads = [];
  for (const entry of entries) {
    const mimeType = mimeTypes[path.extname(entry.name).toLowerCase()];
    if (!entry.isFile() || !mimeType) continue;
    const data = await readFile(path.join(directory, entry.name));
    uploads.push({ filename: entry.name, mimeType, size: data.length, data });
  }
  function rewriteUrls(value = "") {
    for (const upload of uploads) {
      value = value.replaceAll(`/uploads/${upload.filename}`, `/api/uploads/${upload.filename}`);
    }
    return value;
  }
  // All-or-nothing import; repeated runs never overwrite edited database records.
  await prisma.$transaction(async (tx) => {
    for (const upload of uploads) {
      await tx.upload.upsert({ where: { filename: upload.filename }, create: upload, update: {} });
    }
    for (const article of articles) {
      await tx.article.upsert({
        where: { id: article.id },
        update: {},
        create: {
          id: article.id, title: article.title, slug: article.slug,
          featuredImage: rewriteUrls(article.featuredImage),
          shortDescription: article.shortDescription || "",
          content: rewriteUrls(article.content),
          status: article.status || "draft", websiteType: article.websiteType,
          createdAt: new Date(article.createdAt), updatedAt: new Date(article.updatedAt),
        },
      });
    }
  }, { timeout: 60000 });
  console.log(`Import complete: checked ${articles.length} articles and ${uploads.length} images. Existing records and source files were preserved.`);
} finally {
  await prisma.$disconnect();
}
