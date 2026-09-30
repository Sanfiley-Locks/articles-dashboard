import { NextResponse } from "next/server";
import { getArticleById, updateArticle, deleteArticle } from "@/lib/db";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { validateArticle } from "@/lib/article-validation";

async function requireAuth(request) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return isValidSessionToken(token);
}

export async function GET(request, { params }) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ article });
}

export async function PUT(request, { params }) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const data = await request.json().catch(() => null);
  const error = validateArticle(data, true);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const updated = await updateArticle(id, data);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ article: updated });
}

export async function DELETE(request, { params }) {
  if (!(await requireAuth(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const ok = await deleteArticle(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
