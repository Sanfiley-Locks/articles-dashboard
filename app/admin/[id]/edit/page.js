import { notFound } from "next/navigation";
import { getArticleById } from "@/lib/db";
import ArticleForm from "@/components/ArticleForm";

export default async function EditArticlePage({ params }) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <div>
      <h1 className="page-title">Edit article</h1>
      <p className="page-subtitle">{article.title}</p>
      <ArticleForm articleId={article.id} initialArticle={article} />

      <style>{`
        .page-title {
          font-family: var(--font-headline);
          font-size: 1.7rem;
          margin: 0 0 0.3rem;
        }
        .page-subtitle {
          color: var(--ink-soft);
          margin: 0 0 1.75rem;
          font-size: 0.92rem;
        }
      `}</style>
    </div>
  );
}
