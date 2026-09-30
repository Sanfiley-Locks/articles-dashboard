import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/db";
import { websiteLabel } from "@/lib/constants";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.shortDescription,
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || article.status !== "published") {
    notFound();
  }

  return (
    <div className="article-page">
      <header className="masthead">
        <Link href="/" className="wordmark">
          Sanfiley Publishing
        </Link>
      </header>

      <article className="article">
        <Link
          href={`/?site=${article.websiteType}`}
          className={`site-tag site-${article.websiteType}`}
        >
          {websiteLabel(article.websiteType)}
        </Link>
        <h1>{article.title}</h1>
        <p className="lede">{article.shortDescription}</p>
        <p className="meta">
          Published {new Date(article.createdAt).toLocaleDateString()}
        </p>

        {article.featuredImage && (
          <img
            className="featured"
            src={article.featuredImage}
            alt={article.title}
          />
        )}

        <div
          className="body"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <Link href="/" className="back-link">
          ← Back to all articles
        </Link>
      </article>

      <style>{`
        .article-page {
          min-height: 100vh;
        }
        .masthead {
          background: var(--paper-raised);
          border-bottom: 1px solid var(--line);
          padding: 1.25rem 2rem;
        }
        .wordmark {
          font-family: var(--font-headline);
          font-size: 1.4rem;
          font-weight: 600;
          max-width: 720px;
          margin: 0 auto;
          display: block;
        }
        .article {
          max-width: 720px;
          margin: 0 auto;
          padding: 3rem 2rem 5rem;
        }
        .article h1 {
          font-family: var(--font-headline);
          font-size: 2.1rem;
          line-height: 1.25;
          margin: 1rem 0 0.75rem;
        }
        .lede {
          font-size: 1.1rem;
          color: var(--ink-soft);
          margin: 0 0 0.5rem;
        }
        .meta {
          font-size: 0.82rem;
          color: var(--ink-soft);
          margin: 0 0 1.75rem;
        }
        .featured {
          width: 100%;
          border-radius: 10px;
          margin-bottom: 2rem;
        }
        .body {
          font-size: 1.05rem;
          line-height: 1.75;
          color: var(--ink);
        }
        .body :global(h2) {
          font-family: var(--font-headline);
          font-size: 1.4rem;
          margin: 2rem 0 0.75rem;
        }
        .body :global(p) {
          margin: 0 0 1.1rem;
        }
        .body :global(ul),
        .body :global(ol) {
          margin: 0 0 1.1rem;
          padding-left: 1.4rem;
        }
        .body :global(a) {
          color: var(--accent);
          text-decoration: underline;
        }
        .back-link {
          display: inline-block;
          margin-top: 2.5rem;
          font-size: 0.9rem;
          color: var(--ink-soft);
        }
        .back-link:hover {
          color: var(--ink);
        }
      `}</style>
    </div>
  );
}
