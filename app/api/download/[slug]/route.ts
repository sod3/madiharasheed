import { findOne } from "@/db";
import { settings } from "@/lib/content";
import { href } from "@/lib/domain";
import { media } from "@/lib/media";
import { hasSubscription } from "@/lib/newsletter";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = await findOne<{ file: string; gated: number }>("resources", { visible: 1, slug });
  if (!resource || (await settings()).show_resources !== "1") return new Response("Resource not found", { status: 404 });
  if (resource.gated && !(await hasSubscription(request))) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/resources?resource=" + encodeURIComponent(slug) + "#resource-form", "Cache-Control": "no-store" },
    });
  }
  const url = href(resource.file);
  if (url.startsWith("/api/media/")) return media(request, url.slice(11), !!resource.gated, true);
  if (!url || resource.gated) return new Response("Resource file unavailable", { status: 404 });
  return new Response(null, { status: 303, headers: { Location: url, "Cache-Control": "no-store" } });
}
