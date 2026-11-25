import { MongoClient } from "mongodb";

const uri = (process.env.MONGODB_URI ?? "").trim().replace(/^["']|["']$/g, "");
if (!uri) {
  console.error("Set MONGODB_URI before running npm run db:push.");
  process.exit(1);
}

let dbName = (process.env.MONGODB_DB ?? "").trim();
if (!dbName) {
  try {
    dbName = decodeURIComponent(new URL(uri).pathname.replace(/^\/+/, "")) || "writing_room";
  } catch {
    dbName = "writing_room";
  }
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);

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

console.log(`MongoDB indexes ensured on database "${dbName}".`);
await client.close();
