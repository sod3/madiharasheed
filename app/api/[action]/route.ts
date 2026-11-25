import {all,one,run} from "@/db";
import {item,now} from "@/lib/content";
import {inquiryTypes} from "@/lib/domain";
import {subscribe,subscriberAction,webhook} from "@/lib/newsletter";
import {email,error,hash,input,InputError,integer,json,limit,read,track,visitor} from "@/lib/security";
const orders={newest:"r.created_at DESC,r.id DESC",highest:"r.rating DESC,r.id DESC",helpful:"helpful DESC,r.id DESC"};
type Route={params:Promise<{action:string}>};
export async function GET(request:Request,{params}:Route) {
  if ((await params).action!=="reviews") return json("Page not found.",404);
  try {
    const query=new URL(request.url).searchParams;
    const course=await item("courses",query.get("course")??"");
    if (!course) return json("Course not found.",404);
    const sort=query.get("sort")??"newest";
    if (!Object.hasOwn(orders,sort)) throw new InputError("Choose a valid sort order.");
    const items=await all("SELECT r.id,r.title,r.name,r.rating,r.body,r.reply,r.created_at,(SELECT COUNT(*) FROM review_votes v WHERE v.review_id=r.id) AS helpful "+
      "FROM reviews r WHERE r.course_id=? AND r.status='published' ORDER BY "+orders[sort as keyof typeof orders]+" LIMIT 9 OFFSET ?",course.id,Math.min(integer(query.get("offset")),10000));
    return Response.json({items,count:Number(course.review_count??0)});
  } catch(err){return error(err);}
}
export async function POST(request:Request,{params}:Route) {
  try {
    const {action}=await params;
    if (action==="resend-webhook") return await webhook(request);
    const data=await read(request);
    if (action==="events") {
      await track(request,"page_view",input(data,"path",155,true));
      return new Response(null,{status:204});
    }
    if (input(data,"website")) throw new InputError("The form could not be submitted.");
    await limit(request,action,action==="useful"?30:8);
    if (action==="contact") {
      const type=input(data,"category",100,true,"an inquiry type");
      if (!inquiryTypes.includes(type)) throw new InputError("Choose a valid inquiry type.");
      await run("INSERT INTO contact_inquiries(name,email,title,category,body) VALUES(?,?,?,?,?)",
        input(data,"name",120,true,"your name"),email(input(data,"email",254,true,"your email")),input(data,"title",180,true,"a subject"),type,input(data,"body",6000,true,"a message"));
      return json("Your message has been received. Thank you for getting in touch.",201);
    }
    if (action==="subscribe") {
      if (data.consent!=="yes") throw new InputError("Please confirm that you agree to receive newsletter emails.");
      const resource=input(data,"resource",100);
      if (resource && !await one("SELECT id FROM resources WHERE slug=? AND visible=1 AND gated=1",resource)) throw new InputError("That resource is unavailable.",404);
      return json(await subscribe(input(data,"name",80,true,"your first name"),email(input(data,"email",254,true,"your email")),resource),202);
    }
    if (action==="newsletter") {
      const mode=input(data,"mode",15,true);
      if (mode!=="confirm" && mode!=="access" && mode!=="unsubscribe") throw new InputError("This subscription action is invalid.");
      const result=await subscriberAction(mode,input(data,"token",110,true));
      if (result.confirmed) await track(request,"newsletter_confirmed","/").catch(()=>undefined);
      return Response.json({message:result.message},{headers:{"Set-Cookie":result.cookie,"Cache-Control":"no-store"}});
    }
    if (action==="review") {
      const course=await item("courses",input(data,"course",100,true));
      if (!course || course.demo) throw new InputError("Reviews are open for verified participants of published courses.",404);
      const rating=integer(data.rating),invite=input(data,"invite",64,true,"your review invitation");
      if (!rating || rating>5 || !/^[a-f0-9]{64}$/.test(invite)) throw new InputError("Enter a rating and a valid review invitation.");
      const row=await one("INSERT INTO reviews(course_id,participant_id,name,rating,title,body) "+
        "SELECT p.course_id,p.id,?,?,?,? FROM course_participants p WHERE p.course_id=? AND p.email=? AND p.invitation_hash=? AND p.invitation_expires>? "+
        "AND NOT EXISTS(SELECT 1 FROM reviews r WHERE r.participant_id=p.id) RETURNING id",
        input(data,"name",120,true,"your name"),rating,input(data,"title",140,true,"a review title"),input(data,"body",4000,true,"your feedback"),
        course.id,email(input(data,"email",254,true,"your enrolled email")),await hash(invite),now());
      if (!row) throw new InputError("The invitation does not match an eligible participant or has already been used.",403);
      return json("Your verified review has been submitted for moderation.",201);
    }
    if (action==="useful") {
      const id=integer(data.id);
      const row=await one("SELECT r.id FROM reviews r JOIN courses c ON r.course_id=c.id WHERE r.id=? AND r.status='published' AND c.visible=1 AND (c.published_at IS NULL OR c.published_at<=?)",id,now());
      if (!row) throw new InputError("Review unavailable.",404);
      const result=await run("INSERT OR IGNORE INTO review_votes(review_id,visitor) VALUES(?,?)",id,await visitor(request,"helpful"));
      return Response.json({message:result.meta.changes?"Thanks for your feedback.":"Your vote was already recorded.",added:!!result.meta.changes});
    }
    if (action==="comment") {
      const article=await item("articles",input(data,"article",100,true));
      if (!article || article.demo || !article.comments_enabled) throw new InputError("Comments are closed.",404);
      await run("INSERT INTO comments(article_id,name,email,body) VALUES(?,?,?,?)",article.id,input(data,"name",120,true,"your name"),
        email(input(data,"email",254,true,"your email")),input(data,"body",2500,true,"your comment"));
      return json("Your comment has been submitted for moderation.",201);
    }
    return json("Page not found.",404);
  } catch(err){return error(err);}
}
