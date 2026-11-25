# Madiha Rasheed

An editorial portfolio and learning site using the Next.js App Router model, React, TypeScript, and Vinext on Cloudflare Workers. D1 stores content, enrollment records, inquiries, subscriptions, and analytics. R2 stores uploads. The portfolio uses a working title and clearly labeled sample courses and reflections until the client provides their information.

## Local development

Use Node.js 22.13+ and run `npm ci`. Copy `.env.example` to `.dev.vars` and set a unique `RATE_SECRET` with `openssl rand -hex 32`. Keep the file private. Use the existing local sign-in when developing with the portable Sites profile.

```sh
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_initial.sql
npm run dev
```

Set `SITE_URL` to the actual local origin. Use `npx tsc --noEmit` to verify types. Local and hosted data are separate. Apply schema changes using `npm run db:generate` and commit the SQL and snapshots with the source.

## Manage content

Open `/admin` while signed in to the authorized ChatGPT account. Website settings control the author profile, brand, statistics, portrait, navigation, and public contact information. Add confirmed affiliations, awards, publications, testimonials, and photographs with permission. Disable the sample content when the real catalogue is ready.

- Create a course, then add curriculum modules and batches. Publish by enabling visibility. A future UTC publish time schedules its appearance. Duplicate a course to create a draft and copy its modules and tentative batches.
- Record confirmed participants separately from WhatsApp clicks. Open an enrollment and create a review invitation. The unique link expires in 30 days and permits one review from the enrolled address. Approve reviews before they appear. Comments on reflections also require approval.
- Use English or Urdu when publishing reflections. Write headings with two hash marks and separate paragraphs with blank lines. Preview drafts from the editor.
- View messages in Inquiries. Open Subscribers for consent and delivery status, campaign sync, and CSV export.
- Select the access setting before uploading a free resource. Subscribers-only documents require a confirmed subscription and a signed access cookie.

## Deployment and integrations

The hosting manifest binds `DB` and `BUCKET`. Build with `npm run build` and deploy the saved version of the source-linked Sites project. Hosted migrations are applied before the Worker becomes live. A standalone Worker needs a trusted authentication gateway supplying the same Sites identity headers and stripping them from external requests. Keep the Worker origin behind the gateway.

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Canonical site origin and base URL for invitations and confirmation links |
| `ADMIN_EMAILS` | Comma-separated emails authorized to manage content |
| `RATE_SECRET` | Private key for signed links, rate limits, and analytics deduplication |
| `PRIVATE_PREVIEW` | Set to 1 to prevent indexing while the site is private |
| `RESEND_API_KEY`, `NEWSLETTER_FROM` | Resend API key and verified sender address |
| `RESEND_SEGMENT_ID` | Dedicated Resend segment for confirmed subscribers |
| `RESEND_WEBHOOK_SECRET` | Signing secret for the `contact.updated` unsubscribe webhook |
| `GA_ID`, `GOOGLE_SITE_VERIFICATION` | Optional GA4 measurement ID and Search Console verification |

Configure secrets in hosting settings. Once the sender is verified, a subscription submits a confirmation email and sends the welcome email on confirmation. Confirmed subscribers can join the configured Resend segment. Use Resend Broadcasts with unsubscribe enabled. On the public domain, configure a signed `contact.updated` webhook at `/api/resend-webhook` to keep provider opt-outs in sync. Rotating `RATE_SECRET` invalidates existing newsletter links.

Before launch, add the client's real WhatsApp number with country code in Website settings. Verify a course and batch link and test newsletter delivery with a controlled recipient. Replace placeholder branding and photographs. Use the final domain for `SITE_URL` and set `PRIVATE_PREVIEW=0` when the site's audience is ready. The sitemap and robots configurations are available at `/sitemap.xml` and `/robots.txt`. GA4 loads only when a visitor enables it in the privacy settings.

The bundled editorial photographs depict writing spaces. They stand in for the author’s authorized photography. Fonts are distributed under the included SIL Open Font Licenses.
