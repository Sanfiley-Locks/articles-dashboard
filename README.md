# Sanfiley Publishing Desk

A simple Next.js app so your boss can write one article and choose which
website it should appear on: **Job Hiring**, **Sanfiley**, **Hosppi Solution**,
**Hosppi**, or **Eitech**.

Each article has: **Title -> Featured Image -> Short Description -> Content ->
Status**, plus the **Website** it belongs to.

## What's included

- `/admin` - password-protected dashboard to write, edit, and delete articles
- `/` - public homepage listing published articles, with tabs to filter by website
- `/articles/[slug]` - the public page for a single article
- Paste an image URL for the featured image, with a preview
- A simple built-in rich text editor for the article content
- Articles and uploaded image bytes are stored in PostgreSQL through Prisma 7.

## Running it locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file:

   ```bash
   cp .env.example .env.local
   ```

   Then open `.env.local` and set:
   - `DATABASE_URL` - your PostgreSQL connection string (see `.env.example`)
   - `ADMIN_PASSWORD` - the password your boss will use to log into `/admin`
   - `SESSION_SECRET` - any long random string (run `openssl rand -hex 32` to generate one)

3. Create the database tables and import existing local content:

   ```bash
   npm run db:migrate
   npm run db:import
   ```

   The import preserves article IDs, slugs, and timestamps. It copies images
   from `public/uploads` into the `Upload` table and updates imported image
   references to `/api/uploads/<filename>`. Existing database records are
   skipped, so rerunning it will not overwrite edits. Original files remain
   available as a backup. An empty database does not need the import step.

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 for the public site, and
   http://localhost:3000/admin to log in and write articles.

## Adding or renaming a website

Open `lib/constants.js` and edit the `WEBSITE_TYPES` list:

```js
export const WEBSITE_TYPES = [
  { value: "job-hiring", label: "Job Hiring" },
  { value: "sanfiley", label: "Sanfiley" },
  { value: "hosppi-solution", label: "Hosppi Solution" },
  { value: "hosppi", label: "Hosppi" },
  { value: "eitech", label: "Eitech" },
];
```

Add, remove, or rename entries here - the dropdown in the article form and
the filter tabs on the homepage update automatically. `value` is the internal
id (keep it URL-safe, no spaces); `label` is what's shown on screen.

## How each website gets "its" articles

Right now all articles live in one place and the public homepage filters by
website with `?site=job-hiring` (etc.) in the URL - e.g.
`yoursite.com/?site=eitech` shows only Eitech articles.

If Job Hiring, Hosppi, Hosppi Solution, and Eitech are actually separate
websites/domains (not just sections of sanfiley.com), you have two options:

1. **Simplest:** point each domain at this same app, and have each domain's
   homepage link to `/?site=<that-website>` - or duplicate `app/page.js` per
   domain with the filter hard-coded.
2. **More scalable:** expose the articles as an API other sites fetch from,
   e.g. `GET /api/articles?websiteType=eitech&status=published`, and have
   each site's own codebase pull and render that data. This route already
   exists and returns JSON - no changes needed to use it this way.

## Deploying

Set `DATABASE_URL`, `ADMIN_PASSWORD`, and `SESSION_SECRET` on the host.
Articles and new uploads use PostgreSQL, so they persist independently of the
app's filesystem. Back up the database, including the `Upload` table. External
image URLs still refer to their original hosts. Uploaded images remain public
by URL, as they were before this migration.

Run `npm run db:migrate` against the target database before starting the app.
Run `npm run db:import` once from a machine with the old JSON and upload files
if you have existing content to transfer.

To run in production on a VPS:

```bash
npm install
npm run build
npm run start
```

Put the app behind a process manager (e.g. `pm2`) and a reverse proxy (e.g.
Nginx) with HTTPS in front of it, and set `ADMIN_PASSWORD` /
`SESSION_SECRET` as real environment variables on the server (don't ship
your `.env.local` to production as-is).

## Notes

- Fonts use the system font stack (no external font requests), so the app
  builds and runs even without internet access. If you'd like custom fonts
  (e.g. Google Fonts), add them with `next/font/google` in `app/layout.js`.
- Login is a single shared password for now (good for one boss / a small
  team). If you later need separate logins per person, that's a bigger
  change - worth a follow-up if you need it.

## Database development

To load the sample articles from `data/articles.json` using Prisma:

```bash
npm run db:migrate
npm run db:seed
```

You can also run `npx prisma db seed` directly. The seed preserves image
links and article statuses from the JSON. Repeated runs skip existing IDs
or slugs without overwriting edits. Use `db:import` only when transferring
legacy local image files as well as articles.

- `prisma/schema.prisma` defines `Article`, `Upload`, and `ArticleStatus`.
- `lib/prisma.js` shares a Prisma client using the PostgreSQL driver adapter.
- `npm run db:dev -- --name describe_change` creates and applies a development migration.
- `npm run db:generate` regenerates Prisma Client after schema changes.
- `npm run db:studio` opens the database editor.
- `npm run db:migrate` applies checked-in migrations without resetting data.

Prisma commands load `.env.local` / `.env` through Next.js's environment loader.
Never commit database credentials. The build regenerates the JavaScript Prisma
Client automatically; deployment requires Node.js 20.19+, 22.12+, or 24+.
