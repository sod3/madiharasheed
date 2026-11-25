declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    SITE_URL?: string;
    ADMIN_EMAILS?: string;
    RATE_SECRET?: string;
    PRIVATE_PREVIEW?: string;
    RESEND_API_KEY?: string;
    NEWSLETTER_FROM?: string;
    RESEND_SEGMENT_ID?: string;
    RESEND_WEBHOOK_SECRET?: string;
    GA_ID?: string;
    GOOGLE_SITE_VERIFICATION?: string;
  }
}
