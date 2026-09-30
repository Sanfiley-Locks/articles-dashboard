"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WEBSITE_TYPES, STATUSES } from "@/lib/constants";
import RichTextEditor from "./RichTextEditor";

const emptyArticle = {
  title: "",
  featuredImage: "",
  shortDescription: "",
  content: "",
  status: "draft",
  websiteType: "",
};

export default function ArticleForm({ initialArticle, articleId }) {
  const router = useRouter();
  const isEditing = Boolean(articleId);

  const [form, setForm] = useState({ ...emptyArticle, ...initialArticle });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function update(field, value) {
    setSaved(false);
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e, redirectAfter = true) {
    e.preventDefault();
    if (saving) return;
    setError("");
    setSaved(false);

    if (!form.title.trim()) {
      setError("Please add a title.");
      return;
    }
    if (!form.websiteType) {
      setError("Please choose which website this article is for.");
      return;
    }

    setSaving(true);
    try {
      const url = isEditing ? `/api/articles/${articleId}` : "/api/articles";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      if (redirectAfter) {
        router.push("/admin");
        router.refresh();
      } else if (!isEditing) {
        router.replace(`/admin/${data.article.id}/edit`);
      } else {
        setSaved(true);
      }
      return data.article;
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="article-form">
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {saved && (
        <p className="save-confirmation" role="status">
          All changes saved.
        </p>
      )}

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          className="input"
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. 5 Tips for Landing Your Next Job"
        />
      </div>

      <div className="field">
        <label htmlFor="featuredImage">Featured image URL</label>
        {form.featuredImage && (
          <div className="image-preview">
            <img src={form.featuredImage} alt="Featured" />
          </div>
        )}
        <p className="hint">Paste a link to your image.</p>
        <input
          id="featuredImage"
          className="input"
          type="text"
          value={form.featuredImage}
          onChange={(e) => update("featuredImage", e.target.value)}
          placeholder="https://example.com/image.jpg"
          aria-label="Featured image URL"
        />
      </div>

      <div className="field">
        <label htmlFor="shortDescription">Short description</label>
        <textarea
          id="shortDescription"
          className="textarea"
          style={{ minHeight: 80 }}
          value={form.shortDescription}
          onChange={(e) => update("shortDescription", e.target.value)}
          placeholder="One or two sentences shown in article previews and listings."
          maxLength={300}
        />
        <p className="hint">{form.shortDescription.length}/300</p>
      </div>

      <div className="field">
        <label htmlFor="content">Content</label>
        <RichTextEditor
          value={form.content}
          onChange={(html) => update("content", html)}
          placeholder="Write the full article here…"
        />
      </div>

      <div className="two-col">
        <div className="field">
          <label htmlFor="websiteType">Website</label>
          <select
            id="websiteType"
            className="select"
            value={form.websiteType}
            onChange={(e) => update("websiteType", e.target.value)}
          >
            <option value="">Select a website…</option>
            {WEBSITE_TYPES.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
          <p className="hint">
            Choose which site this article should appear on.
          </p>
        </div>

        <div className="field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            className="select"
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={saving}
          onClick={(e) => handleSubmit(e, false)}
        >
          Save
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving ? "Saving…" : isEditing ? "Save & close" : "Create article"}
        </button>
      </div>

      <style jsx>{`
        .article-form {
          max-width: 1000px;
        }
        .form-error {
          background: var(--danger-ink);
          color: var(--danger);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          margin-bottom: 1.25rem;
          font-size: 0.9rem;
        }
        .image-preview {
          margin-bottom: 0.6rem;
          border: 1px solid var(--line);
          border-radius: var(--radius-sm);
          overflow: hidden;
          max-width: 320px;
        }
        .image-preview img {
          width: 100%;
          height: auto;
        }
        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .form-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--line);
        }
        @media (max-width: 600px) {
          .two-col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </form>
  );
}
