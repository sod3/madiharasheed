import { databaseConfigured, one } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = databaseConfigured();
  if (!configured && process.env.VERCEL === "1") {
    return Response.json(
      {
        ok: false,
        dbConfigured: false,
        schemaReady: false,
        hint: "Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel Environment Variables and redeploy.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    await one("SELECT COUNT(*) AS count FROM website_settings");
    return Response.json(
      { ok: true, dbConfigured: true, schemaReady: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown database error";
    const missingTable = /no such table/i.test(message);
    return Response.json(
      {
        ok: false,
        dbConfigured: configured,
        schemaReady: false,
        reason: missingTable ? "SCHEMA_MISSING" : "CONNECTION_FAILED",
        hint: missingTable
          ? "Database connected, but tables are missing. Run: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run db:push"
          : "Could not connect to Turso. Verify TURSO_DATABASE_URL (libsql://... or https://...) and TURSO_AUTH_TOKEN in Vercel Environment Variables.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
