import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || undefined;

const client = createClient({ url, authToken });

await client.execute(`
  CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
`);

const applied = new Set(
  (await client.execute("SELECT name FROM _migrations")).rows.map((row) => String(row.name)),
);

const drizzleDir = path.resolve(process.cwd(), "drizzle");
const files = readdirSync(drizzleDir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

for (const file of files) {
  if (applied.has(file)) {
    console.log(`Skipping already applied migration: ${file}`);
    continue;
  }
  const sql = readFileSync(path.join(drizzleDir, file), "utf8");
  const statements = sql
    .split("--> statement-breakpoint")
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (statements.length) {
    await client.migrate(statements);
  }
  await client.execute({ sql: "INSERT INTO _migrations(name) VALUES(?)", args: [file] });
  console.log(`Applied migration: ${file} (${statements.length} statements)`);
}

client.close();
