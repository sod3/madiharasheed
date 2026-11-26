import { col, databaseConfigured, findOne, nextId, type Row } from "@/db";
import { item, now, publishedFilter } from "@/lib/content";
import { inquiryTypes } from "@/lib/domain";
import { subscribe, subscriberAction, webhook } from "@/lib/newsletter";
import { email, error, hash, input, InputError, integer, json, limit, read, track, visitor } from "@/lib/security";
import type { Sort } from "mongodb";

const orders: Record<string, Sort> = {
  newest: { created_at: -1, id: -1 },
  highest: { rating: -1, id: -1 },
  helpful: { helpful: -1, id: -1 },
};

type Route = { params: Promise<{ action: string }> };

export async function GET(request: Request, { params }: Route) {
  if ((await params).action !== "reviews") return json("Page not found.", 404);
  try {
    const query = new URL(request.url).searchParams;
    const course = await item("courses", query.get("course") ?? "");
    if (!course) return json("Course not found.", 404);
    const sort = query.get("sort") ?? "newest";
    if (!Object.hasOwn(orders, sort)) throw new InputError("Choose a valid sort order.");
    const reviewsCol = await col("reviews");
    const items = await reviewsCol
      .aggregate<Row>([
        { $match: { course_id: course.id, status: "published" } },
        { $lookup: { from: "review_votes", localField: "id", foreignField: "review_id", as: "_votes" } },
        { $addFields: { helpful: { $size: "$_votes" } } },
        { $sort: orders[sort] },
        { $skip: Math.min(integer(query.get("offset")), 10000) },
        { $limit: 9 },
        { $project: { _id: 0, id: 1, title: 1, name: 1, rating: 1, body: 1, reply: 1, created_at: 1, helpful: 1 } },
      ])
      .toArray();
    return Response.json({ items, count: Number(course.review_count ?? 0) });
  } catch (err) {
    return error(err);
  }
}

export async function POST(request: Request, { params }: Route) {
  try {
    const { action } = await params;
    if (action === "resend-webhook") return await webhook(request);
    const data = await read(request);
    if (action === "events") {
      if (!databaseConfigured()) return new Response(null, { status: 204 });
      await track(request, "page_view", input(data, "path", 155, true));
      return new Response(null, { status: 204 });
    }
    if (input(data, "website")) throw new InputError("The form could not be submitted.");
    await limit(request, action, action === "useful" ? 30 : 8);
    if (action === "contact") {
      const type = input(data, "category", 100, true, "an inquiry type");
      if (!inquiryTypes.includes(type)) throw new InputError("Choose a valid inquiry type.");
      await (await col("contact_inquiries")).insertOne({
        id: await nextId("contact_inquiries"),
        name: input(data, "name", 120, true, "your name"),
        email: email(input(data, "email", 254, true, "your email")),
        title: input(data, "title", 180, true, "a subject"),
        category: type,
        body: input(data, "body", 6000, true, "a message"),
        status: "new",
        created_at: now(),
      });
      return json("Your message has been received. Thank you for getting in touch.", 201);
    }
    if (action === "subscribe") {
      if (data.consent !== "yes") throw new InputError("Please confirm that you agree to receive newsletter emails.");
      const resource = input(data, "resource", 100);
      if (resource && !(await findOne("resources", { slug: resource, visible: 1, gated: 1 }))) {
        throw new InputError("That resource is unavailable.", 404);
      }
      return json(await subscribe(input(data, "name", 80, true, "your first name"), email(input(data, "email", 254, true, "your email")), resource), 202);
    }
    if (action === "newsletter") {
      const mode = input(data, "mode", 15, true);
      if (mode !== "confirm" && mode !== "access" && mode !== "unsubscribe") throw new InputError("This subscription action is invalid.");
      const result = await subscriberAction(mode, input(data, "token", 110, true));
      if (result.confirmed) await track(request, "newsletter_confirmed", "/").catch(() => undefined);
      return Response.json({ message: result.message }, { headers: { "Set-Cookie": result.cookie, "Cache-Control": "no-store" } });
    }
    if (action === "review") {
      const course = await item("courses", input(data, "course", 100, true));
      if (!course || course.demo) throw new InputError("Reviews are open for verified participants of published courses.", 404);
      const rating = integer(data.rating),
        invite = input(data, "invite", 64, true, "your review invitation");
      if (!rating || rating > 5 || !/^[a-f0-9]{64}$/.test(invite)) throw new InputError("Enter a rating and a valid review invitation.");
      const participant = await findOne<{ id: number }>("course_participants", {
        course_id: course.id,
        email: email(input(data, "email", 254, true, "your enrolled email")),
        invitation_hash: await hash(invite),
        invitation_expires: { $gt: now() },
      });
      if (!participant || (await findOne("reviews", { participant_id: participant.id }))) {
        throw new InputError("The invitation does not match an eligible participant or has already been used.", 403);
      }
      try {
        await (await col("reviews")).insertOne({
          id: await nextId("reviews"),
          course_id: course.id,
          participant_id: participant.id,
          name: input(data, "name", 120, true, "your name"),
          rating,
          title: input(data, "title", 140, true, "a review title"),
          body: input(data, "body", 4000, true, "your feedback"),
          status: "pending",
          reply: "",
          flagged: 0,
          created_at: now(),
        });
      } catch {
        throw new InputError("The invitation does not match an eligible participant or has already been used.", 403);
      }
      return json("Your verified review has been submitted for moderation.", 201);
    }
    if (action === "useful") {
      const id = integer(data.id);
      const review = await findOne<{ id: number; course_id: number }>("reviews", { id, status: "published" });
      if (!review || !(await findOne("courses", { id: review.course_id, ...publishedFilter(now()) }))) {
        throw new InputError("Review unavailable.", 404);
      }
      const v = await visitor(request, "helpful");
      const result = await (await col("review_votes")).updateOne(
        { review_id: id, visitor: v },
        { $setOnInsert: { id: await nextId("review_votes"), review_id: id, visitor: v } },
        { upsert: true },
      );
      return Response.json({
        message: result.upsertedCount ? "Thanks for your feedback." : "Your vote was already recorded.",
        added: !!result.upsertedCount,
      });
    }
    if (action === "comment") {
      const article = await item("articles", input(data, "article", 100, true));
      if (!article || article.demo || !article.comments_enabled) throw new InputError("Comments are closed.", 404);
      await (await col("comments")).insertOne({
        id: await nextId("comments"),
        article_id: article.id,
        name: input(data, "name", 120, true, "your name"),
        email: email(input(data, "email", 254, true, "your email")),
        body: input(data, "body", 2500, true, "your comment"),
        status: "pending",
        created_at: now(),
      });
      return json("Your comment has been submitted for moderation.", 201);
    }
    return json("Page not found.", 404);
  } catch (err) {
    return error(err);
  }
}
