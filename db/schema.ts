import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const id = () => integer("id").primaryKey({autoIncrement:true});
const str = (name:string) => text(name).notNull().default("");
const title = () => text("title").notNull();
const slug = () => text("slug").notNull().unique();
const created = () => text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`);
const flag = (name:string) => integer(name).notNull().default(0);
const position = () => flag("position");
const visible = () => flag("visible");
const featured = () => flag("featured");
const photos = () => ({image:str("image"),alt:str("alt")});
const copy = () => ({summary:str("summary"),body:str("body")});
const publish = () => ({visible:visible(),published_at:text("published_at"),seo_title:str("seo_title"),seo_description:str("seo_description"),created_at:created()});
const listed = () => ({id:id(),title:title(),visible:visible(),position:position()});
const taxonomy = () => ({id:id(),title:title().unique(),position:position()});
export const courseCategories = sqliteTable("course_categories",taxonomy());
export const articleCategories = sqliteTable("article_categories",taxonomy());
export const courses = sqliteTable("courses",{
  id:id(),title:title(),slug:slug(),...copy(),...photos(),video:str("video"),
  category_id:integer("category_id").references(()=>courseCategories.id,{onDelete:"set null"}),
  instructor:str("instructor"),instructor_bio:str("instructor_bio"),duration:str("duration"),format:str("format"),price:str("price"),availability:str("availability"),
  audience:str("audience"),outcomes:str("outcomes"),requirements:str("requirements"),benefits:str("benefits"),certificate:str("certificate"),faq:str("faq"),
  position:position(),featured:featured(),...publish(),
});
export const modules = sqliteTable("course_modules",{
  id:id(),course_id:integer("course_id").notNull().references(()=>courses.id,{onDelete:"cascade"}),title:title(),body:str("body"),position:position(),
},t=>[index("module_course_idx").on(t.course_id,t.position)]);
export const batches = sqliteTable("course_batches",{
  id:id(),course_id:integer("course_id").notNull().references(()=>courses.id,{onDelete:"cascade"}),title:title(),starts_on:text("starts_on"),
  schedule:str("schedule"),price:str("price"),availability:str("availability"),
},t=>[index("batch_course_idx").on(t.course_id,t.starts_on)]);
export const participants = sqliteTable("course_participants",{
  id:id(),course_id:integer("course_id").notNull().references(()=>courses.id,{onDelete:"cascade"}),
  batch_id:integer("batch_id").references(()=>batches.id,{onDelete:"set null"}),
  name:text("name").notNull(),email:text("email").notNull(),invitation_hash:text("invitation_hash"),invitation_expires:text("invitation_expires"),created_at:created(),
},t=>[uniqueIndex("participant_course_email_idx").on(t.course_id,t.email)]);
export const reviews = sqliteTable("reviews",{
  id:id(),course_id:integer("course_id").notNull().references(()=>courses.id,{onDelete:"cascade"}),
  participant_id:integer("participant_id").notNull().unique().references(()=>participants.id,{onDelete:"cascade"}),
  name:text("name").notNull(),title:title(),rating:integer("rating").notNull(),body:str("body"),status:text("status").notNull().default("pending"),
  reply:str("reply"),flagged:flag("flagged"),created_at:created(),
},t=>[check("valid_review_rating",sql`${t.rating} BETWEEN 1 AND 5`),index("review_course_status_idx").on(t.course_id,t.status)]);
export const votes = sqliteTable("review_votes",{
  id:id(),review_id:integer("review_id").notNull().references(()=>reviews.id,{onDelete:"cascade"}),visitor:text("visitor").notNull(),
},t=>[uniqueIndex("review_visitor_idx").on(t.review_id,t.visitor)]);
export const articles = sqliteTable("articles",{
  id:id(),title:title(),slug:slug(),...copy(),...photos(),category_id:integer("category_id").references(()=>articleCategories.id,{onDelete:"set null"}),
  language:text("language").notNull().default("en"),author:str("author"),comments_enabled:flag("comments_enabled"),featured:featured(),...publish(),
});
export const comments = sqliteTable("comments",{
  id:id(),article_id:integer("article_id").notNull().references(()=>articles.id,{onDelete:"cascade"}),name:text("name").notNull(),
  email:text("email").notNull(),body:str("body"),status:text("status").notNull().default("pending"),created_at:created(),
});
export const publications = sqliteTable("publications",{
  id:id(),title:title(),slug:slug(),...copy(),...photos(),category:str("category"),publisher:str("publisher"),issue_date:text("issue_date"),
  purchase_url:str("purchase_url"),download_url:str("download_url"),reference_url:str("reference_url"),...publish(),
});
export const organizations = sqliteTable("organizations",{...listed(),...photos(),url:str("url")});
export const experience = sqliteTable("professional_experiences",{
  ...listed(),organization_id:integer("organization_id").references(()=>organizations.id,{onDelete:"set null"}),date_label:str("date_label"),
  body:str("body"),impact:str("impact"),...photos(),url:str("url"),
});
export const achievements = sqliteTable("achievements",{
  ...listed(),issuer:str("issuer"),category:str("category"),date_label:str("date_label"),body:str("body"),...photos(),featured:featured(),
});
export const education = sqliteTable("qualifications",{...listed(),issuer:str("issuer"),date_label:str("date_label"),body:str("body")});
export const milestones = sqliteTable("milestones",{...listed(),date_label:str("date_label"),body:str("body")});
export const media = sqliteTable("media_mentions",{...listed(),category:str("category"),date_label:str("date_label"),body:str("body"),url:str("url")});
export const gallery = sqliteTable("gallery_items",{...listed(),...photos(),category:str("category"),body:str("body"),video:str("video")});
export const testimonials = sqliteTable("testimonials",{
  id:id(),name:text("name").notNull(),role:str("role"),relationship:str("relationship"),body:str("body"),...photos(),rating:integer("rating"),visible:visible(),position:position(),
});
export const resources = sqliteTable("resources",{
  ...listed(),slug:slug(),category:str("category"),summary:str("summary"),...photos(),file:text("file").notNull(),gated:flag("gated"),
});
export const settings = sqliteTable("website_settings",{key:text("key").primaryKey(),value:text("value").notNull()});
export const subscribers = sqliteTable("newsletter_subscribers",{
  id:id(),name:text("name").notNull(),email:text("email").notNull().unique(),status:text("status").notNull().default("pending"),
  consent_source:text("consent_source").notNull(),consent_at:text("consent_at").notNull(),token_salt:text("token_salt").notNull(),
  confirmed_at:text("confirmed_at"),unsubscribed_at:text("unsubscribed_at"),sent_at:text("sent_at"),sync_status:text("sync_status").notNull().default("none"),created_at:created(),
});
export const inquiries = sqliteTable("contact_inquiries",{
  id:id(),name:text("name").notNull(),email:text("email").notNull(),title:title(),category:str("category"),body:str("body"),status:text("status").notNull().default("new"),created_at:created(),
});
export const events = sqliteTable("analytics_events",{
  id:id(),event:text("event").notNull(),path:text("path").notNull(),visitor:text("visitor").notNull(),bucket:text("bucket").notNull(),created_at:created(),
},t=>[uniqueIndex("event_unique_idx").on(t.event,t.path,t.visitor,t.bucket),index("event_path_idx").on(t.event,t.path)]);
export const limits = sqliteTable("request_limits",{key:text("key").primaryKey(),hits:integer("hits").notNull(),expires_at:integer("expires_at").notNull()});
export const admins = sqliteTable("admin_users",{user_id:text("user_id").primaryKey(),email:text("email").notNull(),last_seen_at:text("last_seen_at").notNull()});
