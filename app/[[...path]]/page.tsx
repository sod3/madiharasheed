import type {Metadata} from "next";
import {notFound,unstable_rethrow} from "next/navigation";
import {databaseConfigured} from "@/db";
import {absolute,item,origin,settings,type Catalogue} from "@/lib/content";
import {defaults,images,href,q,text,type Query} from "@/lib/domain";
import {admin} from "@/lib/security";
import {Footer} from "@/components/editorial";
import {Header,Metrics} from "@/components/interactions";
import {About,ArticleDetail,CataloguePage,Connect,CourseDetail,GalleryPage,Home,NewsletterPage,Privacy,Publication,Resources} from "@/components/pages";

export const dynamic="force-dynamic";
const links=[
  ["Home",""],["About","about"],["Courses","courses"],["Reflections","reflections"],["Publications","publications"],["Gallery","gallery"],["Contact","contact"],
] as const;
const descriptions:Record<string,[string,string]>={
  "":["","Discover writing, learning opportunities, and thoughtful reflections."],
  about:["About","The author’s background, education, experience, and professional honors."],
  courses:["Courses","Discover writing courses, practical workshops, and guided learning."],
  reflections:["Reflections","Read essays and observations on writing, learning, and everyday life."],
  publications:["Publications","Explore published books, essays, and resources."],
  gallery:["Gallery","Photographs and videos from the work behind the writing."],
  speaking:["Speaking & collaboration","Invite the author to speak, lead a workshop, or collaborate."],
  resources:["Free resources","Explore free writing guides, worksheets, and educational materials."],
  contact:["Contact","Contact the author about courses, speaking, writing, or collaboration."],
  newsletter:["Newsletter","Subscribe or manage your newsletter subscription."],
  privacy:["Privacy","How the site handles contact details, subscriptions, and visitor activity."],
};
const catalogue:Record<string,Catalogue>={courses:"courses",reflections:"articles",publications:"publications"};
type Props={params:Promise<{path?:string[]}>;searchParams:Promise<Query>};

async function resolve(props:Props){
  const [{path=[]},query]=await Promise.all([props.params,props.searchParams]);
  const page=path[0]??"",slug=path[1];
  if (path.length>2||!Object.hasOwn(descriptions,page)||(path.length===2&&!Object.hasOwn(catalogue,page)))notFound();
  const site=await settings();
  if ((page==="gallery"&&site.show_gallery!=="1")||(page==="resources"&&site.show_resources!=="1")||(page==="speaking"&&site.show_speaking!=="1"))notFound();
  const preview=!!slug&&q(query,"preview")==="1"&&!!await admin();
  const row=slug?await item(catalogue[page],slug,preview):null;
  if (slug&&!row)notFound();
  return {page,slug,row,query,site,preview};
}
export async function generateMetadata(props:Props):Promise<Metadata>{
  try {
    const {page,slug,row,site,preview,query}=await resolve(props);
    const [label,summary]=descriptions[page];
    const name=row?text(row,"seo_title")||text(row,"title"):label;
    const title=site.site_title+(name?" | "+name:" | Writing, learning & reflections");
    const description=row?text(row,"seo_description")||text(row,"summary")||summary:summary;
    const url=absolute("/"+page+(slug?"/"+slug:""));
    const image=absolute(href(row?.image)||href(site.hero_image)||images.hero);
    const index=!row?.demo&&!preview&&!q(query,"invite")&&page!=="newsletter"&&process.env.PRIVATE_PREVIEW!=="1";
    return {title,description,metadataBase:new URL(origin()),alternates:{canonical:url},robots:{index,follow:index},
      openGraph:{type:page==="reflections"&&row?"article":"website",title,description,url,siteName:site.site_title,images:[image]},
      twitter:{card:"summary_large_image",title,description,images:[image]}};
  } catch (err) {
    unstable_rethrow(err);
    return {title:defaults.site_title};
  }
}
export default async function Page(props:Props){
  let resolved: Awaited<ReturnType<typeof resolve>>;
  try {
    resolved = await resolve(props);
  } catch (err) {
    unstable_rethrow(err);
    const message = err instanceof Error ? err.message : "";
    const missingConfig = !databaseConfigured() && process.env.VERCEL === "1";
    const missingSchema = /no such table/i.test(message);
    return <main id="main" className="reading section stack">
      <h1>Database setup required</h1>
      <p>{missingConfig
        ? "Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your Vercel Project Environment Variables and redeploy."
        : missingSchema
          ? "Your Turso database is connected, but its tables have not been created yet. Run npm run db:push against your Turso database."
          : "The website could not connect to the database. Verify TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel Environment Variables."}</p>
      <p className="muted">Check <a className="text-link" href="/api/health">/api/health</a> for live connection diagnostics.</p>
    </main>;
  }
  const {page,row,query,site,preview}=resolved;
  const order=site.nav_order.toLowerCase().split(",").map(value=>value.trim());
  const nav=links.filter(([,path])=>path!=="gallery"||site.show_gallery==="1").map(([label,path])=>({label,href:"/"+path}));
  nav.sort((a,b)=>(order.indexOf(a.label.toLowerCase())+1||100)-(order.indexOf(b.label.toLowerCase())+1||100));
  let content:React.ReactNode;
  switch(page){
    case "":content=<Home site={site}/>;break;
    case "about":content=<About site={site}/>;break;
    case "courses":content=row?<CourseDetail row={row} site={site} preview={preview} query={query}/>:<CataloguePage site={site} type="courses" query={query}/>;break;
    case "reflections":content=row?<ArticleDetail row={row} site={site} preview={preview}/>:<CataloguePage site={site} type="articles" query={query}/>;break;
    case "publications":content=row?<Publication row={row} site={site} preview={preview}/>:<CataloguePage site={site} type="publications" query={query}/>;break;
    case "gallery":content=<GalleryPage query={query}/>;break;
    case "contact":content=<Connect site={site} query={query}/>;break;
    case "speaking":content=<Connect site={site} query={query} speaking/>;break;
    case "resources":content=<Resources query={query}/>;break;
    case "newsletter":content=<NewsletterPage site={site} query={query}/>;break;
    case "privacy":content=<Privacy/>;break;
  }
  return <><Header title={site.site_title} links={nav} current={"/"+page}/><main id="main">{content}</main><Footer site={site}/><Metrics id={process.env.GA_ID??""}/></>;
}
