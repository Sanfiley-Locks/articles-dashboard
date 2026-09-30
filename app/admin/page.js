"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FilePenLine,
  Plus,
  Search,
  Pencil,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { WEBSITE_TYPES, websiteLabel } from "@/lib/constants";
export default function AdminDashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [reload, setReload] = useState(0);
  function load() {
    setLoading(true);
    setError("");
    setReload((value) => value + 1);
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/articles", { signal: controller.signal })
      .then((res) => {
        if (!res.ok)
          throw new Error("Could not load articles. Please try again.");
        return res.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) setArticles(data.articles || []);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reload]);
  const filtered = useMemo(
    () =>
      articles
        .filter(
          (a) =>
            (!siteFilter || a.websiteType === siteFilter) &&
            (!statusFilter || a.status === statusFilter) &&
            `${a.title} ${a.shortDescription || ""}`
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    [articles, siteFilter, statusFilter, search],
  );
  const published = articles.filter((a) => a.status === "published").length;
  const drafts = articles.filter((a) => a.status === "draft").length;
  async function handleDelete(id) {
    if (!window.confirm("Delete this article? This can't be undone.")) return;
    setDeletingId(id);
    setError("");
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!res.ok)
        throw new Error("Could not delete the article. Please try again.");
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }
  return (
    <div className="dashboard blog-dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="blog-kicker">SANFILEY PUBLISHING</p>
          <h1>Your blog.</h1>
          <p className="muted">
            Your posts, drafts, and published work in one place.
          </p>
        </div>
        <Link href="/admin/new" className="btn btn-primary">
          <Plus size={17} />
          Write a post
        </Link>
      </div>
      <div className="blog-summary" aria-label="Publishing overview">
        <span>
          <strong>{loading ? "?" : articles.length}</strong> posts
        </span>
        <span>
          <strong>{loading ? "?" : published}</strong> published
        </span>
        <span>
          <strong>{loading ? "?" : drafts}</strong> drafts
        </span>
        <span>
          <strong>{WEBSITE_TYPES.length}</strong> websites
        </span>
      </div>
      <section className="articles-panel" aria-labelledby="articles-heading">
        <div className="panel-heading">
          <div>
            <h2 id="articles-heading">
              Latest posts <span className="count-chip">{articles.length}</span>
            </h2>
            <p className="muted">Recent writing, from draft to published.</p>
          </div>
        </div>
        <div className="library-tabs" aria-label="Filter by status">
          {[
            ["", "All posts", articles.length],
            ["published", "Published", published],
            ["draft", "Drafts", drafts],
          ].map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              className={statusFilter === value ? "selected" : ""}
              aria-pressed={statusFilter === value}
              onClick={() => setStatusFilter(value)}
            >
              {label}
              <span>{count}</span>
            </button>
          ))}
        </div>
        <div className="library-filters">
          <label className="search-input">
            <Search size={18} />
            <input
              type="search"
              aria-label="Search articles"
              placeholder="Search articles by title or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <div className="site-filter">
            <SlidersHorizontal size={17} />
            <select
              aria-label="Filter by website"
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
            >
              <option value="">All websites</option>
              {WEBSITE_TYPES.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && (
          <div className="dashboard-error" role="alert">
            {error}
            <button className="btn btn-secondary" onClick={load}>
              Retry
            </button>
          </div>
        )}
        {loading ? (
          <div className="library-empty" role="status">
            Loading your article library…
          </div>
        ) : filtered.length === 0 ? (
          <div className="library-empty">
            <span className="empty-icon">
              <FilePenLine size={29} />
            </span>
            <h3>
              {articles.length ? "No matching articles" : "No articles yet"}
            </h3>
            <p>
              {articles.length
                ? "Try a different search or adjust your filters."
                : "Create an article to get started."}
            </p>
            {articles.length ? (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSearch("");
                  setSiteFilter("");
                  setStatusFilter("");
                }}
              >
                Clear filters
              </button>
            ) : (
              <Link href="/admin/new" className="btn btn-primary">
                <Plus size={16} />
                Write an article
              </Link>
            )}
          </div>
        ) : (
          <div className="blog-post-grid">
            {filtered.map((a) => (
              <article className="blog-post-card" key={a.id}>
                {a.featuredImage && (
                  <Link
                    href={`/admin/${a.id}/edit`}
                    className="blog-post-cover"
                    aria-label={`Edit ${a.title}`}
                  >
                    <img src={a.featuredImage} alt="" loading="lazy" />
                  </Link>
                )}
                <div className="blog-post-body">
                  <div className="blog-post-meta">
                    <span className="blog-post-site">
                      {websiteLabel(a.websiteType)}
                    </span>
                    <span className="blog-post-status">
                      {a.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                  <h3>
                    <Link href={`/admin/${a.id}/edit`}>{a.title}</Link>
                  </h3>
                  <p className="blog-post-excerpt">
                    {a.shortDescription ||
                      "Add a short description to introduce this post."}
                  </p>
                  <div className="blog-post-footer">
                    <span>
                      Updated{" "}
                      {new Date(a.updatedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <div className="article-actions">
                      <Link
                        href={`/admin/${a.id}/edit`}
                        className="blog-edit-link"
                        aria-label={`Edit ${a.title}`}
                      >
                        <Pencil size={14} />
                        Edit
                      </Link>
                      <button
                        className="icon-button delete-button"
                        disabled={deletingId === a.id}
                        onClick={() => handleDelete(a.id)}
                        aria-label={`Delete ${a.title}`}
                        title="Delete post"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  {a.status === "published" && a.slug && (
                    <Link
                      className="blog-read-link"
                      href={`/articles/${a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read post <span aria-hidden="true">?</span>
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="library-footer">
          <span>
            {loading
              ? "Loading…"
              : `${filtered.length} of ${articles.length} posts`}
          </span>
          <span>Sorted by last updated</span>
        </div>
      </section>
    </div>
  );
}
