import { NextResponse } from "next/server";
import { getAllArticles, createArticle } from "@/lib/db";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { validateArticle } from "@/lib/article-validation";
import { STATUSES } from "@/lib/constants";

async function requireAuth(request) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return isValidSessionToken(token);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const websiteType = searchParams.get("websiteType") || undefined;
  const status = searchParams.get("status") || undefined;
  if (status && !STATUSES.some((item) => item.value === status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const articles = await getAllArticles({ websiteType, status });
  return NextResponse.json({ articles });
}

export async function POST(request) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json().catch(() => null);
  const error = validateArticle(data);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const article = await createArticle(data);
  return NextResponse.json({ article }, { status: 201 });
}
