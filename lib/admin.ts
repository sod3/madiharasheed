import { all,db,one,run,stmt,type Row } from "@/db";
import { absolute,now } from "./content";
import { href,phone } from "./domain";
import { moduleFor,settingGroups,type Field } from "./cms";
import { email,hash,input,InputError,integer,token } from "./security";

const relations=new Set(["course_categories","article_categories","courses","course_batches","organizations"]);
export async function choices(fields:Field[]){
  const names=[...new Set(fields.flatMap(field=>field.table && relations.has(field.table)?[field.table]:[]))];
  return Object.fromEntries(await Promise.all(names.map(async name=>[
    name,await all(name==="course_batches" ? "SELECT b.id,b.course_id,b.title||' — '||c.title AS title FROM course_batches b JOIN courses c ON c.id=b.course_id ORDER BY c.title,b.title"
      : "SELECT id,title FROM "+name+" ORDER BY title"),
  ])));
}
function convert(spec:Field,data:Record<string,unknown>) {
  if (spec.kind==="checkbox") return data[spec.name]==="1"?1:0;
  const max=spec.kind==="long" ? 50_000 : spec.kind==="file" || spec.kind==="url" ? 2048 : spec.name==="slug" ? 100 : 240;
  const value=input(data,spec.name,max,spec.required,spec.label.toLowerCase());
  if (spec.table) {
    const id=integer(value);
    if (value && !id) throw new InputError("Choose a valid "+spec.label.toLowerCase()+".");
    return id || null;
  }
  if (spec.options && !spec.options.includes(value)) throw new InputError("Choose a valid "+spec.label.toLowerCase()+".");
  if (spec.kind==="email" && value) return email(value);
  if ((spec.kind==="file" || spec.kind==="url") && value && !href(value)) throw new InputError("Enter a local path or HTTPS URL.");
  if (spec.name==="slug" && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) throw new InputError("Enter a valid URL slug.");
  if (spec.name==="whatsapp" && value && !phone(value)) throw new InputError("Enter the WhatsApp number in international format.");
  if (spec.kind==="number") {
    if (spec.name==="rating" && !value) return null;
    const number=Number(value);
    if (!Number.isInteger(number) || number<0 || number>99999 || (spec.name==="rating" && (number<1 || number>5))) throw new InputError("Enter a valid number.");
    return number;
  }
  if (spec.kind==="date" || spec.kind==="datetime-local") {
    if (!value) return null;
    const timestamp=new Date(value+(spec.kind==="date"?"T00:00:00Z":":00Z"));
    if (!Number.isFinite(timestamp.getTime()) || timestamp.toISOString().slice(0,value.length)!==value || value.length!==(spec.kind==="date"?10:16)) throw new InputError("Enter a valid date.");
    return spec.kind==="date"?value:timestamp.toISOString();
  }
  return value;
}
export async function saveSettings(data:Record<string,unknown>){
  const selected=settingGroups.flatMap(group=>group.fields).filter(field=>Object.hasOwn(data,field.name));
  if (!selected.length) throw new InputError("Choose a setting to update.");
  await db().batch(selected.map(field=>stmt("INSERT INTO website_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",field.name,String(convert(field,data)??""))));
}
export async function save(key:string,id:number,data:Record<string,unknown>){
  const module=moduleFor(key);
  if (!module?.fields.length || (module.readOnly && !id)) throw new InputError("This record cannot be edited.",404);
  const values=Object.fromEntries(module.fields.map(field=>[field.name,convert(field,data)]));
  if (key==="resources" && Boolean(values.gated)!==String(values.file).startsWith("/api/media/resource-")) throw new InputError("Upload a file using the selected access setting.");
  if (key==="gallery" && !values.image && !values.video) throw new InputError("Add a photo or video.");
  if (key==="participants" && values.batch_id && !await one("SELECT id FROM course_batches WHERE id=? AND course_id=?",values.batch_id,values.course_id)) throw new InputError("Choose a batch for this course.");
  const names=Object.keys(values),args=Object.values(values);
  if (!id) {
    const result=await one("INSERT INTO "+module.table+"("+names.join(",")+") VALUES("+names.map(()=>"?").join(",")+") RETURNING id",...args);
    if (!result) throw new InputError("Could not create this record.",500);
    return result.id;
  }
  const participant=key==="participants";
  const updates=names.map(name=>name+"=?").join(",")+(participant?",invitation_hash=CASE WHEN email<>? OR course_id<>? THEN NULL ELSE invitation_hash END,invitation_expires=CASE WHEN email<>? OR course_id<>? THEN NULL ELSE invitation_expires END":"");
  if (participant) args.push(values.email,values.course_id,values.email,values.course_id);
  args.push(id);
  if (participant) args.push(id,values.email,values.course_id);
  const result=await run("UPDATE "+module.table+" SET "+updates+" WHERE id=?"+(participant?" AND (NOT EXISTS(SELECT 1 FROM reviews WHERE participant_id=?) OR (email=? AND course_id=?))":""),...args);
  if (!result.meta.changes) throw new InputError("The record was unavailable or has a locked enrollment.",409);
  return id;
}
export async function remove(key:string,id:number){
  const module=moduleFor(key);
  if (!module || !id || ["reviews","comments","subscribers"].includes(key)) throw new InputError("This record cannot be deleted.");
  const result=await run("DELETE FROM "+module.table+" WHERE id=?",id);
  if (!result.meta.changes) throw new InputError("Record not found.",404);
}
export async function duplicate(id:number) {
  const row=await one("SELECT * FROM courses WHERE id=?",id);
  if (!row) throw new InputError("Course not found.",404);
  const slug=String(row.slug).slice(0,80).replace(/-$/,"")+"-copy-"+crypto.randomUUID().slice(0,6);
  const fields=Object.keys(row).filter(key=>!["id","slug","title","visible","featured","published_at","created_at"].includes(key)).join(",");
  const result=await db().batch<Row>([
    stmt("INSERT INTO courses(title,slug,"+fields+") SELECT ?,?,"+fields+" FROM courses WHERE id=? RETURNING id",String(row.title).slice(0,220)+" (copy)",slug,id),
    stmt("INSERT INTO course_modules(course_id,title,body,position) SELECT (SELECT id FROM courses WHERE slug=?),title,body,position FROM course_modules WHERE course_id=?",slug,id),
    stmt("INSERT INTO course_batches(course_id,title,schedule,price,availability) SELECT (SELECT id FROM courses WHERE slug=?),title,schedule,price,'Coming soon' FROM course_batches WHERE course_id=?",slug,id),
  ]);
  if (!result[0].results.length) throw new InputError("Course unavailable.",409);
  return result[0].results[0].id;
}
export async function invite(id:number){
  const course=await one("SELECT c.slug FROM courses c JOIN course_participants p ON p.course_id=c.id WHERE p.id=? AND c.visible=1 AND (c.published_at IS NULL OR c.published_at<=?)",id,now());
  if (!course) throw new InputError("Publish the course before inviting participants to review it.");
  const code=token();
  const saved=await run("UPDATE course_participants SET invitation_hash=?,invitation_expires=? WHERE id=? AND NOT EXISTS(SELECT 1 FROM reviews WHERE participant_id=?)",await hash(code),new Date(Date.now()+30*86400_000).toISOString(),id,id);
  if (!saved.meta.changes) throw new InputError("This participant already submitted a review.",409);
  return absolute("/courses/"+course.slug+"?invite="+code+"#write-review");
}
export async function dashboard(){
  return one<Record<string,number>>("SELECT "+
    "(SELECT COUNT(DISTINCT visitor) FROM analytics_events WHERE event='page_view' AND bucket=date('now')) AS visitors,"+
    "(SELECT COUNT(*) FROM analytics_events WHERE event='page_view' AND path LIKE '/courses/%') AS course_views,"+
    "(SELECT COUNT(*) FROM analytics_events WHERE event='whatsapp_click') AS whatsapp,"+
    "(SELECT COUNT(*) FROM course_participants) AS enrollments,"+
    "(SELECT COUNT(*) FROM newsletter_subscribers WHERE status='confirmed') AS subscribers,"+
    "(SELECT COUNT(*) FROM newsletter_subscribers WHERE status='pending') AS pending,"+
    "(SELECT COUNT(*) FROM articles WHERE visible=1 AND (published_at IS NULL OR published_at<=?)) AS articles,"+
    "(SELECT COUNT(*) FROM reviews WHERE status='pending') AS reviews,"+
    "(SELECT COUNT(*) FROM contact_inquiries WHERE status='new') AS inquiries",now());
}
