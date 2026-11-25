import type {MetadataRoute} from "next";
import {absolute} from "@/lib/content";
export const dynamic="force-dynamic";
export default function robots():MetadataRoute.Robots {
  return process.env.PRIVATE_PREVIEW==="1"?{rules:{userAgent:"*",disallow:"/"}}:
    {rules:{userAgent:"*",allow:"/",disallow:["/api/","/admin","/newsletter"]},sitemap:absolute("/sitemap.xml")};
}
