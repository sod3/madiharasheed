import { createRequire } from "node:module";
import { createClient as createWebClient, type Client, type InValue } from "@libsql/client/web";

const globalForDb = globalThis as typeof globalThis & { __libsqlClient?: Client };

function cleanEnv(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

export function databaseConfigured(): boolean {
  return !!(cleanEnv(process.env.TURSO_DATABASE_URL) || cleanEnv(process.env.DATABASE_URL) || cleanEnv(process.env.LIBSQL_URL));
}

function getClient(): Client {
  if (globalForDb.__libsqlClient) return globalForDb.__libsqlClient;
  const rawUrl = cleanEnv(process.env.TURSO_DATABASE_URL) || cleanEnv(process.env.DATABASE_URL) || cleanEnv(process.env.LIBSQL_URL);
  if (!rawUrl && process.env.VERCEL === "1") {
    throw new Error("DATABASE_NOT_CONFIGURED: Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel Environment Variables.");
  }
  const url = rawUrl || "file:local.db";
  const authToken =
    cleanEnv(process.env.TURSO_AUTH_TOKEN) ||
    cleanEnv(process.env.DATABASE_AUTH_TOKEN) ||
    cleanEnv(process.env.LIBSQL_AUTH_TOKEN) ||
    undefined;

  let client: Client;
  if (/^file:/i.test(url)) {
    const require = createRequire(import.meta.url);
    const { createClient } = require("@libsql/client") as typeof import("@libsql/client");
    client = createClient({ url, authToken });
  } else {
    client = createWebClient({ url, authToken });
  }

  globalForDb.__libsqlClient = client;
  return client;
}

type Arg = InValue;
function normalize(values: unknown[]): Arg[] {
  return values.map((value) => (value === undefined ? null : (value as Arg)));
}

export interface Statement<T = Row> {
  sql: string;
  args: Arg[];
  all<R = T>(): Promise<{ results: R[]; meta: { changes: number } }>;
  first<R = T>(): Promise<R | null>;
  run(): Promise<{ meta: { changes: number } }>;
}

async function exec(sql: string, args: Arg[]) {
  try {
    return await getClient().execute({ sql, args });
  } catch (err) {
    console.error("[db] query failed:", err instanceof Error ? err.message : err);
    throw err;
  }
}

export function db() {
  return {
    prepare(query: string) {
      return stmt(query);
    },
    async batch<T = Row>(statements: Statement[]) {
      try {
        const results = await getClient().batch(
          statements.map((s) => ({ sql: s.sql, args: s.args })),
          "write",
        );
        return results.map((rs) => ({
          results: rs.rows as unknown as T[],
          meta: { changes: rs.rowsAffected },
        }));
      } catch (err) {
        console.error("[db] batch failed:", err instanceof Error ? err.message : err);
        throw err;
      }
    },
  };
}

export function stmt<T = Row>(query: string, ...values: unknown[]): Statement<T> {
  const args = normalize(values);
  return {
    sql: query,
    args,
    async all<R = T>() {
      const rs = await exec(query, args);
      return { results: rs.rows as unknown as R[], meta: { changes: rs.rowsAffected } };
    },
    async first<R = T>() {
      const rs = await exec(query, args);
      return (rs.rows[0] as unknown as R | undefined) ?? null;
    },
    async run() {
      const rs = await exec(query, args);
      return { meta: { changes: rs.rowsAffected } };
    },
  };
}

export async function all<T = Row>(query: string, ...values: unknown[]) {
  return (await stmt<T>(query, ...values).all<T>()).results;
}

export function one<T = Row>(query: string, ...values: unknown[]) {
  return stmt<T>(query, ...values).first<T>();
}

export function run(query: string, ...values: unknown[]) {
  return stmt(query, ...values).run();
}

export type Row = Record<string, string | number | null | boolean | undefined> & { id: number };
