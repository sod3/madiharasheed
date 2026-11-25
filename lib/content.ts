import { cache } from "react";
import { env } from "cloudflare:workers";
import { all, one, type Row } from "@/db";
import { defaults, type Settings } from "./domain";
import { exampleArticles, exampleCourses, exampleGallery } from "./sample";

export const settings=cache(async ():Promise<Settings>=>{
  const values=await all<{key:keyof Settings;value:string}>("SELECT key,value FROM website_settings");
  const result={...defaults};
  for (const {key,value} of values) if (Object.hasOwn(result,key)) result[key]=value;
  return result;
});
export const now=()=>new Date().toISOString();
const published="x.visible=1 AND (x.published_at IS NULL OR x.published_at<=?)";
export type Catalogue="courses"|"articles"|"publications";
const selectors={
  courses:"SELECT x.*,COALESCE(c.title,'') AS category,(SELECT COUNT(*) FROM reviews r WHERE r.course_id=x.id AND r.status='published') AS review_count,(SELECT AVG(r.rating) FROM reviews r WHERE r.course_id=x.id AND r.status='published') AS average FROM courses x LEFT JOIN course_categories c ON x.category_id=c.id",
  articles:"SELECT x.*,COALESCE(c.title,'') AS category,(SELECT COUNT(*) FROM analytics_events e WHERE e.event='page_view' AND e.path='/reflections/'||x.slug) AS views FROM articles x LEFT JOIN article_categories c ON x.category_id=c.id",
  publications:"SELECT x.* FROM publications x",
};
export const list=cache(async (type:Catalogue)=>{
  const order=type==="courses" ? "x.featured DESC,x.position,x.id DESC":"COALESCE(x.published_at,x.created_at) DESC";
  const rows=await all(selectors[type]+" WHERE "+published+" ORDER BY "+order+" LIMIT 150",now());
  if (rows.length || (await settings()).show_demo!=="1") return rows;
  return type==="courses" ? exampleCourses : type==="articles" ? exampleArticles : [];
});
export const item=cache(async (type:Catalogue,slug:string,preview=false)=>{
  const row=await one(selectors[type]+" WHERE x.slug=?"+(preview ? "" : " AND "+published),slug,...(preview ? []:[now()]));
  return row ?? (await list(type)).find(row=>row.demo && row.slug===slug) ?? null;
});
type Collection="organizations"|"professional_experiences"|"achievements"|"qualifications"|"milestones"|"media_mentions"|"testimonials"|"gallery_items"|"resources";
export const collection=cache(async (type:Collection):Promise<Row[]>=>{
  const query=type==="professional_experiences"
    ? "SELECT e.*,o.title AS organization,o.image AS logo FROM professional_experiences e LEFT JOIN organizations o ON e.organization_id=o.id AND o.visible=1 WHERE e.visible=1 ORDER BY e.position,e.id"
    : "SELECT * FROM "+type+" WHERE visible=1 ORDER BY position,id";
  const result=await all(query+" LIMIT 150");
  return result.length || type!=="gallery_items" || (await settings()).show_demo!=="1" ? result : exampleGallery;
});
export function origin(){return new URL(env.SITE_URL??"http://localhost:5173").origin;}
export function absolute(path:string){return new URL(path,origin()).href;}
