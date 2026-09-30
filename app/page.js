import Link from "next/link";
import { getAllArticles } from "@/lib/db";
import { WEBSITE_TYPES, websiteLabel } from "@/lib/constants";

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const site = params?.site || "";

  const articles = await getAllArticles({
    status: "published",
    websiteType: site || undefined,
  });

  return (
    <div className="home">
      <header className="masthead">
        <div className="masthead-inner">
          <Link href="/" className="wordmark">
            Sanfiley Publishing
          </Link>
          <Link href="/admin" className="admin-link">
            Publishing desk
          </Link>
        </div>
        <nav className="site-tabs">
          <Link href="/" className={!site ? "active" : ""}>
            All
          </Link>
          {WEBSITE_TYPES.map((w) => (
            <Link
              key={w.value}
              href={`/?site=${w.value}`}
              className={site === w.value ? "active" : ""}
            >
              {w.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="content">
        {articles.length === 0 ? (
          <div className="empty">
            <p>No published articles here yet.</p>
          </div>
        ) : (
          <div className="grid">
            {articles.map((a) => (
              <Link
                href={`/articles/${a.slug}`}
                key={a.id}
                className="article-card"
              >
                {a.featuredImage ? (
                  <img src={a.featuredImage} alt="" />
                ) : (
                  <div className="thumb-placeholder" />
                )}
                <div className="body">
                  <span className={`site-tag site-${a.websiteType}`}>
                    {websiteLabel(a.websiteType)}
                  </span>
                  <h2>{a.title}</h2>
                  <p>{a.shortDescription}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .home {
          min-height: 100vh;
        }
        .masthead {
          background: var(--paper-raised);
          border-bottom: 1px solid var(--line);
          padding: 1.25rem 2rem 0;
        }
        .masthead-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1100px;
          margin: 0 auto;
        }
        .wordmark {
          font-family: var(--font-headline);
          font-size: 1.4rem;
          font-weight: 600;
        }
        .admin-link {
          font-size: 0.85rem;
          color: var(--ink-soft);
          border: 1px solid var(--line);
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
        }
        .admin-link:hover {
          border-color: var(--ink-soft);
          color: var(--ink);
        }
        .site-tabs {
          max-width: 1100px;
          margin: 1rem auto 0;
          display: flex;
          gap: 1.5rem;
          overflow-x: auto;
        }
        .site-tabs a {
          padding: 0.6rem 0.1rem;
          font-size: 0.9rem;
          color: var(--ink-soft);
          border-bottom: 2px solid transparent;
          white-space: nowrap;
        }
        .site-tabs a.active {
          color: var(--ink);
          border-bottom-color: var(--accent);
          font-weight: 600;
        }
        .content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2.5rem 2rem 4rem;
        }
        .empty {
          text-align: center;
          color: var(--ink-soft);
          padding: 4rem 0;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.75rem;
        }
        .article-card {
          display: block;
          background: var(--paper-raised);
          border: 1px solid var(--line);
          border-radius: 10px;
          overflow: hidden;
        }
        .article-card img,
        .article-card .thumb-placeholder {
          width: 100%;
          height: 170px;
          object-fit: cover;
          background: var(--paper);
        }
        .article-card .body {
          padding: 1.1rem 1.2rem 1.4rem;
        }
        .article-card h2 {
          font-family: var(--font-headline);
          font-size: 1.15rem;
          margin: 0.6rem 0 0.5rem;
          line-height: 1.35;
        }
        .article-card p {
          font-size: 0.88rem;
          color: var(--ink-soft);
          margin: 0;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
