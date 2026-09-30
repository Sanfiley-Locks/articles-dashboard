import { STATUSES, WEBSITE_TYPES } from "./constants.js";

export function validateArticle(data, partial = false) {
  if (!data || typeof data !== "object" || Array.isArray(data))
    return "Invalid article.";
  for (const field of [
    "title",
    "featuredImage",
    "shortDescription",
    "content",
    "status",
    "websiteType",
  ]) {
    if (data[field] !== undefined && typeof data[field] !== "string")
      return `${field} must be text.`;
  }
  if ((!partial || data.title !== undefined) && !data.title?.trim())
    return "Title is required.";
  if (
    (!partial || data.websiteType !== undefined) &&
    !WEBSITE_TYPES.some((site) => site.value === data.websiteType)
  ) {
    return "Please select a valid website.";
  }
  if (
    data.status !== undefined &&
    !STATUSES.some((status) => status.value === data.status)
  ) {
    return "Please select a valid status.";
  }
  return null;
}
