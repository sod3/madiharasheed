import { findMany } from "@/db";
import { item, settings } from "@/lib/content";
import { inquiryTypes, openCourse, whatsapp } from "@/lib/domain";
import { track } from "@/lib/security";

function redirect(location: string) {
  return new Response(null, { status: 303, headers: { Location: location, "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams,
    slug = query.get("course") ?? "";
  if (slug.length > 100 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return redirect("/courses");
  const [course, site] = await Promise.all([item("courses", slug), settings()]);
  if (!course || !openCourse(course)) return redirect("/courses/" + slug);
  const batches = await findMany("course_batches", { course_id: course.id });
  const chosen = batches.find((batch) => String(batch.id) === query.get("batch") && batch.availability === "Open");
  if (batches.length && !chosen) return redirect("/courses/" + slug + "#registration");
  const message =
    "Assalamualaikum,\n\nI am interested in registering for the following course:\n\nCourse: " +
    course.title +
    "\nBatch: " +
    (chosen?.title ?? "Next available batch") +
    "\nPrice: " +
    (chosen?.price || course.price || "Please confirm") +
    "\n\nPlease share the registration process, payment details, and further information.\n\nThank you.";
  const link = whatsapp(site.whatsapp, message);
  if (!link) return redirect("/contact?" + new URLSearchParams({ category: inquiryTypes[0], subject: String(course.title ?? "") }));
  await track(request, "whatsapp_click", "/courses/" + slug).catch(() => undefined);
  return redirect(link);
}
