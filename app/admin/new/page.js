import ArticleForm from "@/components/ArticleForm";

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="page-title">New article</h1>
      <p className="page-subtitle">
        Turn your ideas into a story. Choose a website when you are ready to
        publish.
      </p>
      <ArticleForm />

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
