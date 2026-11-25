import { col, findMany, findOne, nextId, type Row } from "@/db";
import { absolute, now, publishedFilter } from "./content";
import { href, phone } from "./domain";
import { moduleFor, settingGroups, type Field } from "./cms";
import { email, hash, input, InputError, integer, token } from "./security";

const relations = new Set(["course_categories", "article_categories", "courses", "course_batches", "organizations"]);

export async function choices(fields: Field[]) {
  const names = [...new Set(fields.flatMap((field) => (field.table && relations.has(field.table) ? [field.table] : [])))];
  return Object.fromEntries(
    await Promise.all(
      names.map(async (name) => {
        if (name === "course_batches") {
          const [batches, courses] = await Promise.all([
            findMany<{ id: number; course_id: number; title: string }>("course_batches"),
            findMany<{ id: number; title: string }>("courses"),
          ]);
          const courseMap = new Map(courses.map((c) => [c.id, c.title]));
          const joined = batches
            .filter((b) => courseMap.has(b.course_id))
            .map((b) => ({
              id: b.id,
              course_id: b.course_id,
              title: `${b.title} — ${courseMap.get(b.course_id)}`,
              _course: courseMap.get(b.course_id) ?? "",
              _batch: b.title,
            }))
            .sort((a, b) => a._course.localeCompare(b._course) || a._batch.localeCompare(b._batch))
            .map(({ id, course_id, title }) => ({ id, course_id, title }));
          return [name, joined];
        }
        return [name, await findMany(name, {}, { sort: { title: 1 }, projection: { _id: 0, id: 1, title: 1 } })];
      }),
    ),
  );
}

function convert(spec: Field, data: Record<string, unknown>) {
  if (spec.kind === "checkbox") return data[spec.name] === "1" ? 1 : 0;
  const max = spec.kind === "long" ? 50_000 : spec.kind === "file" || spec.kind === "url" ? 2048 : spec.name === "slug" ? 100 : 240;
  const value = input(data, spec.name, max, spec.required, spec.label.toLowerCase());
  if (spec.table) {
    const id = integer(value);
    if (value && !id) throw new InputError("Choose a valid " + spec.label.toLowerCase() + ".");
    return id || null;
  }
  if (spec.options && !spec.options.includes(value)) throw new InputError("Choose a valid " + spec.label.toLowerCase() + ".");
  if (spec.kind === "email" && value) return email(value);
  if ((spec.kind === "file" || spec.kind === "url") && value && !href(value)) throw new InputError("Enter a local path or HTTPS URL.");
  if (spec.name === "slug" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) throw new InputError("Enter a valid URL slug.");
  if (spec.name === "whatsapp" && value && !phone(value)) throw new InputError("Enter the WhatsApp number in international format.");
  if (spec.kind === "number") {
    if (spec.name === "rating" && !value) return null;
    const number = Number(value);
    if (!Number.isInteger(number) || number < 0 || number > 99999 || (spec.name === "rating" && (number < 1 || number > 5))) {
      throw new InputError("Enter a valid number.");
    }
    return number;
  }
  if (spec.kind === "date" || spec.kind === "datetime-local") {
    if (!value) return null;
    const timestamp = new Date(value + (spec.kind === "date" ? "T00:00:00Z" : ":00Z"));
    if (!Number.isFinite(timestamp.getTime()) || timestamp.toISOString().slice(0, value.length) !== value || value.length !== (spec.kind === "date" ? 10 : 16)) {
      throw new InputError("Enter a valid date.");
    }
    return spec.kind === "date" ? value : timestamp.toISOString();
  }
  return value;
}

export async function saveSettings(data: Record<string, unknown>) {
  const selected = settingGroups.flatMap((group) => group.fields).filter((field) => Object.hasOwn(data, field.name));
  if (!selected.length) throw new InputError("Choose a setting to update.");
  const settingsCol = await col("website_settings");
  await settingsCol.bulkWrite(
    selected.map((field) => ({
      updateOne: {
        filter: { key: field.name },
        update: { $set: { key: field.name, value: String(convert(field, data) ?? "") } },
        upsert: true,
      },
    })),
  );
}

const tableDefaults: Record<string, () => Record<string, unknown>> = {
  courses: () => ({ created_at: now() }),
  articles: () => ({ created_at: now() }),
  publications: () => ({ created_at: now() }),
  course_participants: () => ({ invitation_hash: null, invitation_expires: null, created_at: now() }),
};

export async function save(key: string, id: number, data: Record<string, unknown>) {
  const mod = moduleFor(key);
  if (!mod?.fields.length || (mod.readOnly && !id)) throw new InputError("This record cannot be edited.", 404);
  const values = Object.fromEntries(mod.fields.map((field) => [field.name, convert(field, data)]));
  if (key === "resources" && Boolean(values.gated) !== String(values.file).startsWith("/api/media/resource-")) {
    throw new InputError("Upload a file using the selected access setting.");
  }
  if (key === "gallery" && !values.image && !values.video) throw new InputError("Add a photo or video.");

  for (const field of mod.fields) {
    if (field.table && values[field.name]) {
      const target = await findOne(field.table, { id: values[field.name] });
      if (!target) throw new InputError("Please choose an existing related record.", 400);
    }
  }
  if (key === "participants" && values.batch_id) {
    const batch = await findOne("course_batches", { id: values.batch_id, course_id: values.course_id });
    if (!batch) throw new InputError("Choose a batch for this course.");
  }

  const targetCol = await col(mod.table);
  if (!id) {
    const newId = await nextId(mod.table);
    const defaultsForRow = tableDefaults[mod.table]?.() ?? {};
    await targetCol.insertOne({ id: newId, ...defaultsForRow, ...values });
    return newId;
  }

  if (key === "participants") {
    const existing = await findOne("course_participants", { id });
    if (!existing) throw new InputError("The record was unavailable or has a locked enrollment.", 409);
    const changedIdentity = existing.email !== values.email || existing.course_id !== values.course_id;
    if (changedIdentity) {
      const locked = await findOne("reviews", { participant_id: id });
      if (locked) throw new InputError("The record was unavailable or has a locked enrollment.", 409);
      values.invitation_hash = null;
      values.invitation_expires = null;
    }
  }

  const result = await targetCol.updateOne({ id }, { $set: values });
  if (!result.matchedCount) throw new InputError("The record was unavailable or has a locked enrollment.", 409);
  return id;
}

export async function remove(key: string, id: number) {
  const mod = moduleFor(key);
  if (!mod || !id || ["reviews", "comments", "subscribers"].includes(key)) {
    throw new InputError("This record cannot be deleted.");
  }
  const targetCol = await col(mod.table);
  const result = await targetCol.deleteOne({ id });
  if (!result.deletedCount) throw new InputError("Record not found.", 404);

  if (mod.table === "courses") {
    const reviewDocs = await findMany<{ id: number }>("reviews", { course_id: id }, { projection: { _id: 0, id: 1 } });
    const reviewIds = reviewDocs.map((r) => r.id);
    await Promise.all([
      (await col("course_modules")).deleteMany({ course_id: id }),
      (await col("course_batches")).deleteMany({ course_id: id }),
      (await col("course_participants")).deleteMany({ course_id: id }),
      (await col("reviews")).deleteMany({ course_id: id }),
      reviewIds.length ? (await col("review_votes")).deleteMany({ review_id: { $in: reviewIds } }) : Promise.resolve(),
    ]);
  } else if (mod.table === "articles") {
    await (await col("comments")).deleteMany({ article_id: id });
  } else if (mod.table === "course_categories") {
    await (await col("courses")).updateMany({ category_id: id }, { $set: { category_id: null } });
  } else if (mod.table === "article_categories") {
    await (await col("articles")).updateMany({ category_id: id }, { $set: { category_id: null } });
  } else if (mod.table === "organizations") {
    await (await col("professional_experiences")).updateMany({ organization_id: id }, { $set: { organization_id: null } });
  } else if (mod.table === "course_batches") {
    await (await col("course_participants")).updateMany({ batch_id: id }, { $set: { batch_id: null } });
  } else if (mod.table === "course_participants") {
    const reviewDocs = await findMany<{ id: number }>("reviews", { participant_id: id }, { projection: { _id: 0, id: 1 } });
    const reviewIds = reviewDocs.map((r) => r.id);
    await Promise.all([
      (await col("reviews")).deleteMany({ participant_id: id }),
      reviewIds.length ? (await col("review_votes")).deleteMany({ review_id: { $in: reviewIds } }) : Promise.resolve(),
    ]);
  }
}

export async function duplicate(id: number) {
  const row = await findOne("courses", { id });
  if (!row) throw new InputError("Course not found.", 404);
  const slug = String(row.slug).slice(0, 80).replace(/-$/, "") + "-copy-" + crypto.randomUUID().slice(0, 6);
  const newCourseId = await nextId("courses");
  const rest = Object.fromEntries(
    Object.entries(row).filter(([key]) => !["id", "slug", "title", "visible", "featured", "published_at", "created_at"].includes(key)),
  );
  await (await col("courses")).insertOne({
    ...rest,
    id: newCourseId,
    title: String(row.title).slice(0, 220) + " (copy)",
    slug,
    visible: 0,
    featured: 0,
    published_at: null,
    created_at: now(),
  });

  const [modulesList, batchesList] = await Promise.all([
    findMany("course_modules", { course_id: id }, { sort: { position: 1, id: 1 } }),
    findMany("course_batches", { course_id: id }, { sort: { id: 1 } }),
  ]);

  if (modulesList.length) {
    const modulesCol = await col("course_modules");
    const docs = await Promise.all(
      modulesList.map(async (m) => ({
        id: await nextId("course_modules"),
        course_id: newCourseId,
        title: m.title,
        body: m.body ?? "",
        position: m.position ?? 0,
      })),
    );
    await modulesCol.insertMany(docs);
  }

  if (batchesList.length) {
    const batchesCol = await col("course_batches");
    const docs = await Promise.all(
      batchesList.map(async (b) => ({
        id: await nextId("course_batches"),
        course_id: newCourseId,
        title: b.title,
        starts_on: null,
        schedule: b.schedule ?? "",
        price: b.price ?? "",
        availability: "Coming soon",
      })),
    );
    await batchesCol.insertMany(docs);
  }

  return newCourseId;
}

export async function invite(id: number) {
  const participant = await findOne<{ id: number; course_id: number }>("course_participants", { id });
  if (!participant) throw new InputError("Publish the course before inviting participants to review it.");
  const course = await findOne<{ slug: string }>("courses", { id: participant.course_id, ...publishedFilter(now()) });
  if (!course) throw new InputError("Publish the course before inviting participants to review it.");
  const existingReview = await findOne("reviews", { participant_id: id });
  if (existingReview) throw new InputError("This participant already submitted a review.", 409);

  const code = token();
  const result = await (await col("course_participants")).updateOne(
    { id },
    { $set: { invitation_hash: await hash(code), invitation_expires: new Date(Date.now() + 30 * 86400_000).toISOString() } },
  );
  if (!result.matchedCount) throw new InputError("This participant already submitted a review.", 409);
  return absolute("/courses/" + course.slug + "?invite=" + code + "#write-review");
}

export async function dashboard(): Promise<Record<string, number>> {
  const today = new Date().toISOString().slice(0, 10);
  const stamp = now();
  const [eventsCol, participantsCol, subscribersCol, articlesCol, reviewsCol, inquiriesCol] = await Promise.all([
    col("analytics_events"),
    col("course_participants"),
    col("newsletter_subscribers"),
    col("articles"),
    col("reviews"),
    col("contact_inquiries"),
  ]);

  const [visitorsList, courseViews, whatsapp, enrollments, subscribers, pending, articles, reviews, inquiries] = await Promise.all([
    eventsCol.distinct("visitor", { event: "page_view", bucket: today }),
    eventsCol.countDocuments({ event: "page_view", path: { $regex: "^/courses/" } }),
    eventsCol.countDocuments({ event: "whatsapp_click" }),
    participantsCol.countDocuments(),
    subscribersCol.countDocuments({ status: "confirmed" }),
    subscribersCol.countDocuments({ status: "pending" }),
    articlesCol.countDocuments(publishedFilter(stamp)),
    reviewsCol.countDocuments({ status: "pending" }),
    inquiriesCol.countDocuments({ status: "new" }),
  ]);

  return {
    visitors: visitorsList.length,
    course_views: courseViews,
    whatsapp,
    enrollments,
    subscribers,
    pending,
    articles,
    reviews,
    inquiries,
  };
}
