# Madiha Rasheed

An editorial portfolio and learning site built with the Next.js App Router, React, and TypeScript. MongoDB stores published content, inquiries, reviews, and subscriptions. Vercel Blob stores media uploaded from the editor.

## Develop locally

Use Node.js 22.13 or later.

```sh
npm ci
npm run dev
npm run lint
npx tsc --noEmit
npm run build
npm start
```

Copy `.env.example` to `.env.local` to connect services and set `SITE_URL` to your local origin. The public profile and certificates load from the repository with no database connection. The contact page provides a direct email link when form storage is unavailable.

## Edit the site

Sign in at `/admin` with the configured editor credentials. Use Website settings to update the homepage, author biography, authorized portrait, impact figures, and public contact information. The built-in profile records live in `lib/profile-data.ts`, and the Social Impact project details and default figures live in `lib/impact-data.ts`.

- Add experience records with an organization, dates, role type, contributions, outcomes, and skills. Use the public visibility control when each entry is ready.
- Add published courses, curriculum modules, and batches in the editor. An open course with a configured WhatsApp number can redirect visitors to a prefilled registration message. Record confirmed participants in the editor.
- Use the editor’s invitation link to request a review from a verified participant. Reviews and article comments appear after approval.
- Publish approved writing in English or Urdu. Separate paragraphs with blank lines and start section headings with `## `. Longer articles with multiple headings get a table of contents. Use the visibility control or a future UTC publication time to schedule publication.
- Manage contact messages in Inquiries and opt-in subscriptions in Subscribers.

## Configure production

Set these values in the hosting environment. Next.js detects the Vercel production origin when `SITE_URL` is omitted.

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Canonical origin for the sitemap, sharing, and signed email links |
| `MONGODB_URI`, `MONGODB_DB` | MongoDB connection and database name |
| `ADMIN_PASSWORD`, `ADMIN_EMAILS` | Editor password and optional allowlist of editor email addresses |
| `RATE_SECRET` | Private signing key of at least 32 characters |
| `BLOB_READ_WRITE_TOKEN`, `BLOB_ACCESS` | Vercel Blob credentials and store access mode for uploads |
| `RESEND_API_KEY`, `NEWSLETTER_FROM` | Resend API key and verified email sender |
| `RESEND_SEGMENT_ID` | Optional segment for confirmed subscribers |
| `RESEND_WEBHOOK_SECRET` | Optional signing key for syncing unsubscribes at `/api/resend-webhook` |
| `PRIVATE_PREVIEW` | Set to `1` to prevent indexing while reviewing the site |
| `GA_ID`, `GOOGLE_SITE_VERIFICATION` | Optional Google Analytics and Search Console values |

Publish approved courses and articles in the editor. Add the real WhatsApp number with country code in Website settings, and verify email confirmation and unsubscribe with a controlled recipient once the verified sender is active. Sitemap and crawl settings are available at `/sitemap.xml` and `/robots.txt`.
