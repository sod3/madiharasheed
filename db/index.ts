import { createClient, type Client, type InValue } from "@libsql/client";

const globalForDb = globalThis as typeof globalThis & { __libsqlClient?: Client };

function getClient(): Client {
  if (globalForDb.__libsqlClient) return globalForDb.__libsqlClient;
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
      throw new Error("Database unavailable: set TURSO_DATABASE_URL or DATABASE_URL.");
    }
  }
  const client = createClient({
    url: url || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || undefined,
  });
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

export function db() {
  const client = getClient();
  return {
    prepare(query: string) {
      return stmt(query);
    },
    async batch<T = Row>(statements: Statement[]) {
      const results = await client.batch(
        statements.map((s) => ({ sql: s.sql, args: s.args })),
        "write",
      );
      return results.map((rs) => ({
        results: rs.rows as unknown as T[],
        meta: { changes: rs.rowsAffected },
      }));
    },
  };
}

export function stmt<T = Row>(query: string, ...values: unknown[]): Statement<T> {
  const args = normalize(values);
  return {
    sql: query,
    args,
    async all<R = T>() {
      const rs = await getClient().execute({ sql: query, args });
      return { results: rs.rows as unknown as R[], meta: { changes: rs.rowsAffected } };
    },
    async first<R = T>() {
      const rs = await getClient().execute({ sql: query, args });
      return (rs.rows[0] as unknown as R | undefined) ?? null;
    },
    async run() {
      const rs = await getClient().execute({ sql: query, args });
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
