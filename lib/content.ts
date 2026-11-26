import { cache } from "react";
import { col, databaseConfigured, findMany, findOne, type Row } from "@/db";
import { defaults, legacyPrototypeDefaults, type Settings } from "./domain";
import {
  profileAchievements,
  profileExperiences,
  profileGalleryCertificates,
  profileMilestones,
  profileOrganizations,
  profileQualifications,
} from "./profile-data";

export const settings = cache(async (): Promise<Settings> => {
  const result = { ...defaults };
  if (!databaseConfigured()) return result;
  try {
    const values = await findMany<{ key: keyof Settings; value: string }>("website_settings");
    for (const { key, value } of values) {
      if (!Object.hasOwn(result, key)) continue;
      const trimmed = String(value ?? "").trim();
      if (!trimmed && defaults[key]) continue;
      if (Object.hasOwn(legacyPrototypeDefaults, key) && trimmed === legacyPrototypeDefaults[key]) continue;
      result[key] = value;
    }
  } catch (err) {
    console.warn("[cms] settings fallback:", err instanceof Error ? err.message : err);
  }
  return result;
});

export const now = () => new Date().toISOString();

export function publishedFilter(stamp = now()) {
  return {
    visible: 1,
    demo: { $nin: [1, true, "1", "true"] },
    $or: [
      { published_at: null },
      { published_at: { $exists: false } },
      { published_at: { $lte: stamp } },
    ],
  };
}

export type Catalogue = "courses" | "articles" | "publications";

async function hydrateCourses(rows: Row[]): Promise<Row[]> {
  if (!rows.length || !databaseConfigured()) return rows;
  const catIds = [...new Set(rows.map((r) => Number(r.category_id)).filter(Boolean))];
  const courseIds = rows.map((r) => r.id);
  const [cats, reviewsCol] = await Promise.all([
    catIds.length ? findMany<{ id: number; title: string }>("course_categories", { id: { $in: catIds } }) : [],
    col("reviews"),
  ]);
  const catMap = new Map(cats.map((c) => [c.id, c.title]));
  const stats = await reviewsCol
    .aggregate<{ _id: number; review_count: number; average: number }>([
      { $match: { course_id: { $in: courseIds }, status: "published" } },
      { $group: { _id: "$course_id", review_count: { $sum: 1 }, average: { $avg: "$rating" } } },
    ])
    .toArray();
  const statMap = new Map(stats.map((s) => [s._id, s]));
  return rows.map((row) => {
    const stat = statMap.get(row.id);
    return {
      ...row,
      category: catMap.get(Number(row.category_id)) ?? "",
      review_count: stat?.review_count ?? 0,
      average: stat?.average ?? null,
    };
  });
}

async function hydrateArticles(rows: Row[]): Promise<Row[]> {
  if (!rows.length || !databaseConfigured()) return rows;
  const catIds = [...new Set(rows.map((r) => Number(r.category_id)).filter(Boolean))];
  const paths = rows.map((r) => "/reflections/" + String(r.slug));
  const [cats, eventsCol] = await Promise.all([
    catIds.length ? findMany<{ id: number; title: string }>("article_categories", { id: { $in: catIds } }) : [],
    col("analytics_events"),
  ]);
  const catMap = new Map(cats.map((c) => [c.id, c.title]));
  const views = await eventsCol
    .aggregate<{ _id: string; views: number }>([
      { $match: { event: "page_view", path: { $in: paths } } },
      { $group: { _id: "$path", views: { $sum: 1 } } },
    ])
    .toArray();
  const viewMap = new Map(views.map((v) => [v._id, v.views]));
  return rows.map((row) => ({
    ...row,
    category: catMap.get(Number(row.category_id)) ?? "",
    views: viewMap.get("/reflections/" + String(row.slug)) ?? 0,
  }));
}

async function hydrate(type: Catalogue, rows: Row[]): Promise<Row[]> {
  if (type === "courses") return hydrateCourses(rows);
  if (type === "articles") return hydrateArticles(rows);
  return rows;
}

export const list = cache(async (type: Catalogue): Promise<Row[]> => {
  if (!databaseConfigured()) return [];
  try {
    const filter = publishedFilter(now());
    let rows: Row[];
    if (type === "courses") {
      rows = await findMany(type, filter, { sort: { featured: -1, position: 1, id: -1 }, limit: 150 });
    } else {
      const c = await col(type);
      rows = await c
        .aggregate<Row>([
          { $match: filter },
          { $addFields: { _sortAt: { $ifNull: ["$published_at", "$created_at"] } } },
          { $sort: { _sortAt: -1 } },
          { $limit: 150 },
          { $project: { _id: 0, _sortAt: 0 } },
        ])
        .toArray();
    }
    return await hydrate(type, rows);
  } catch (err) {
    console.warn("[cms] list fallback:", err instanceof Error ? err.message : err);
    return [];
  }
});

export const item = cache(async (type: Catalogue, slug: string, preview = false): Promise<Row | null> => {
  if (!databaseConfigured()) return null;
  try {
    const filter = preview ? { slug } : { slug, ...publishedFilter(now()) };
    const doc = await findOne(type, filter);
    if (!doc) return null;
    const [hydrated] = await hydrate(type, [doc]);
    return hydrated;
  } catch (err) {
    console.warn("[cms] item fallback:", err instanceof Error ? err.message : err);
    return null;
  }
});

type Collection =
  | "organizations"
  | "professional_experiences"
  | "achievements"
  | "qualifications"
  | "milestones"
  | "media_mentions"
  | "testimonials"
  | "gallery_items"
  | "resources";

const profileFallbacks: Partial<Record<Collection, Row[]>> = {
  organizations: profileOrganizations,
  professional_experiences: profileExperiences,
  achievements: profileAchievements,
  qualifications: profileQualifications,
  milestones: profileMilestones,
  gallery_items: profileGalleryCertificates,
};

export const collection = cache(async (type: Collection): Promise<Row[]> => {
  if (!databaseConfigured()) {
    return profileFallbacks[type] ?? [];
  }
  try {
    if (type === "gallery_items") {
      const records = await findMany(type, {}, { sort: { position: 1, id: 1 }, limit: 150 });
      const images = new Set(records.map((row) => row.image).filter(Boolean));
      const builtIn = profileGalleryCertificates.filter((row) => !images.has(row.image));
      return [...builtIn, ...records.filter((row) => row.visible === 1)];
    }
    let result = await findMany(type, { visible: 1 }, { sort: { position: 1, id: 1 }, limit: 150 });
    if (type === "professional_experiences" && result.length) {
      const orgIds = [...new Set(result.map((r) => Number(r.organization_id)).filter(Boolean))];
      const orgs = orgIds.length
        ? await findMany<{ id: number; title: string; image: string }>("organizations", { id: { $in: orgIds }, visible: 1 })
        : [];
      const orgMap = new Map(orgs.map((o) => [o.id, o]));
      result = result.map((row) => {
        const org = orgMap.get(Number(row.organization_id));
        return { ...row, organization: org?.title ?? null, logo: org?.image ?? null };
      });
    }
    if (!result.length && profileFallbacks[type]) {
      return profileFallbacks[type]!;
    }
    return result;
  } catch (err) {
    console.warn("[cms] collection fallback:", err instanceof Error ? err.message : err);
    return profileFallbacks[type] ?? [];
  }
});

export function origin() {
  const raw =
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL
        ? "https://" + process.env.VERCEL_URL
        : "http://localhost:3000");
  return new URL(raw).origin;
}

export function absolute(path: string) {
  return new URL(path, origin()).href;
}
