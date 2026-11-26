import type { MetadataRoute } from "next";
import type { Row } from "@/db";
import { absolute, list, settings } from "@/lib/content";

export const dynamic = "force-dynamic";

function publishedEntries(rows: Row[], base: string): MetadataRoute.Sitemap {
  return rows.filter((row) => !row.demo && row.slug).map((row) => {
    const date = String(row.published_at || row.created_at || "");
    return { url: absolute(base + encodeURIComponent(String(row.slug))), lastModified: Number.isFinite(Date.parse(date)) ? date : undefined };
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, courses, articles, publications] = await Promise.all([
    settings(), list("courses"), list("articles"), list("publications"),
  ]);
  const pages = ["/", "/about", "/experience", "/social-impact", "/courses", "/reflections", "/publications", "/contact", "/privacy"];
  if (site.show_gallery === "1") pages.push("/gallery");
  if (site.show_speaking === "1") pages.push("/speaking");
  if (site.show_resources === "1") pages.push("/resources");
  return [
    ...pages.map((path) => ({ url: absolute(path) })),
    ...publishedEntries(courses, "/courses/"),
    ...publishedEntries(articles, "/reflections/"),
    ...publishedEntries(publications, "/publications/"),
  ];
}
