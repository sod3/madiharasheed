import { databaseConfigured, getDb } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = databaseConfigured();
  if (!configured) {
    return Response.json(
      {
        ok: false,
        dbConfigured: false,
        hint: "Set MONGODB_URI in your Vercel Environment Variables (and .env.local for local dev) and redeploy.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return Response.json(
      { ok: true, dbConfigured: true, database: db.databaseName },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[health] MongoDB connection failed:", err instanceof Error ? err.message : err);
    return Response.json(
      {
        ok: false,
        dbConfigured: true,
        reason: "CONNECTION_FAILED",
        hint: "Could not connect to MongoDB. Check MONGODB_URI (username, password, cluster host, and Atlas Network Access IP allowlist 0.0.0.0/0 for Vercel).",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
