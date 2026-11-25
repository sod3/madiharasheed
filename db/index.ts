import { MongoClient, MongoServerError, type Db, type Document, type Filter, type Sort } from "mongodb";

type GlobalMongo = typeof globalThis & {
  __mongoClientPromise?: Promise<MongoClient>;
  __mongoIndexesPromise?: Promise<void>;
};

const g = globalThis as GlobalMongo;

function cleanEnv(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

export function databaseConfigured(): boolean {
  return !!cleanEnv(process.env.MONGODB_URI);
}

function dbNameFromUri(uri: string): string {
  const explicit = cleanEnv(process.env.MONGODB_DB);
  if (explicit) return explicit;
  try {
    const path = new URL(uri).pathname.replace(/^\/+/, "");
    if (path) return decodeURIComponent(path);
  } catch {
    // Fall back to default db name if URI path cannot be parsed by URL
  }
  return "writing_room";
}

async function getClient(): Promise<MongoClient> {
  const uri = cleanEnv(process.env.MONGODB_URI);
  if (!uri) {
    throw new Error("DATABASE_NOT_CONFIGURED: Set MONGODB_URI in your environment variables.");
  }
  if (!g.__mongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    });
    g.__mongoClientPromise = client.connect().catch((err) => {
      g.__mongoClientPromise = undefined;
      throw err;
    });
  }
  return g.__mongoClientPromise;
}

export async function ensureIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection("website_settings").createIndex({ key: 1 }, { unique: true }),
    db.collection("admin_users").createIndex({ user_id: 1 }, { unique: true }),
    db.collection("course_categories").createIndex({ title: 1 }, { unique: true }),
    db.collection("article_categories").createIndex({ title: 1 }, { unique: true }),
    db.collection("courses").createIndex({ slug: 1 }, { unique: true }),
    db.collection("courses").createIndex({ id: 1 }, { unique: true }),
    db.collection("course_modules").createIndex({ course_id: 1, position: 1 }),
    db.collection("course_batches").createIndex({ course_id: 1, starts_on: 1 }),
    db.collection("course_participants").createIndex({ course_id: 1, email: 1 }, { unique: true }),
    db.collection("reviews").createIndex({ participant_id: 1 }, { unique: true }),
    db.collection("reviews").createIndex({ course_id: 1, status: 1 }),
    db.collection("review_votes").createIndex({ review_id: 1, visitor: 1 }, { unique: true }),
    db.collection("articles").createIndex({ slug: 1 }, { unique: true }),
    db.collection("articles").createIndex({ id: 1 }, { unique: true }),
    db.collection("publications").createIndex({ slug: 1 }, { unique: true }),
    db.collection("resources").createIndex({ slug: 1 }, { unique: true }),
    db.collection("newsletter_subscribers").createIndex({ email: 1 }, { unique: true }),
    db.collection("request_limits").createIndex({ key: 1 }, { unique: true }),
    db.collection("analytics_events").createIndex({ event: 1, path: 1, visitor: 1, bucket: 1 }, { unique: true }),
    db.collection("analytics_events").createIndex({ event: 1, path: 1 }),
  ]);
}

export async function getDb(): Promise<Db> {
  const uri = cleanEnv(process.env.MONGODB_URI);
  const client = await getClient();
  const db = client.db(dbNameFromUri(uri));
  if (!g.__mongoIndexesPromise) {
    g.__mongoIndexesPromise = ensureIndexes(db).catch((err) => {
      g.__mongoIndexesPromise = undefined;
      console.error("[db] index setup failed:", err instanceof Error ? err.message : err);
    });
  }
  await g.__mongoIndexesPromise;
  return db;
}

export async function col<T extends Document = Row>(name: string) {
  return (await getDb()).collection<T>(name);
}

export async function nextId(name: string): Promise<number> {
  const counters = (await getDb()).collection<{ _id: string; seq: number }>("_counters");
  const result = await counters.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return result?.seq ?? 1;
}

export async function findMany<T extends Document = Row>(
  name: string,
  filter: Filter<Document> = {},
  options: { sort?: Sort; limit?: number; skip?: number; projection?: Document } = {},
): Promise<T[]> {
  const collection = await col(name);
  let cursor = collection.find(filter, {
    projection: { _id: 0, ...(options.projection ?? {}) },
  });
  if (options.sort) cursor = cursor.sort(options.sort);
  if (options.skip) cursor = cursor.skip(options.skip);
  if (options.limit) cursor = cursor.limit(options.limit);
  return (await cursor.toArray()) as unknown as T[];
}

export async function findOne<T extends Document = Row>(
  name: string,
  filter: Filter<Document>,
  options: { sort?: Sort; projection?: Document } = {},
): Promise<T | null> {
  const collection = await col(name);
  const doc = await collection.findOne(filter, {
    sort: options.sort,
    projection: { _id: 0, ...(options.projection ?? {}) },
  });
  return (doc as unknown as T | null) ?? null;
}

export function isDuplicateError(err: unknown): boolean {
  return err instanceof MongoServerError && err.code === 11000;
}

export type Row = Record<string, string | number | null | boolean | undefined> & { id: number };
