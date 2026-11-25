import type {MetadataRoute} from "next";
import {absolute,list,settings} from "@/lib/content";
export const dynamic="force-dynamic";
export default async function sitemap():Promise<MetadataRoute.Sitemap> {
  const [site,courses,articles,publications]=await Promise.all([settings(),list("courses"),list("articles"),list("publications")]);
  const pages=["/","/about","/courses","/reflections","/publications","/contact","/privacy"];
  if(site.show_gallery==="1")pages.push("/gallery");
  if(site.show_speaking==="1")pages.push("/speaking");
  if(site.show_resources==="1")pages.push("/resources");
  return [...pages.map(path=>({url:absolute(path)})),...courses.filter(row=>!row.demo).map(row=>({url:absolute("/courses/"+row.slug)})),
    ...articles.filter(row=>!row.demo).map(row=>({url:absolute("/reflections/"+row.slug),lastModified:String(row.published_at||row.created_at)})),
    ...publications.map(row=>({url:absolute("/publications/"+row.slug),lastModified:String(row.published_at||row.created_at)}))];
}
