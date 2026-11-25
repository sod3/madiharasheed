import { one,run,type Row } from "@/db";
import { absolute,now,origin } from "./content";
import { InputError,matches,sign,token } from "./security";
type Mode="confirm"|"unsubscribe"|"access";
const threeDays=3*86400_000;
const week=7*86400_000;
const cookie="writing_room_reader";
const secureCookie=()=>origin().startsWith("https://")?"; Secure":"";
export const deliveryConfigured=()=>!!process.env.RESEND_API_KEY && !!process.env.NEWSLETTER_FROM;
async function resend(path:string,data:Record<string,unknown>,method="POST",idempotency=""){
  if (!process.env.RESEND_API_KEY) return false;
  try {
    const result=await fetch("https://api.resend.com"+path,{method,signal:AbortSignal.timeout(8000),
      headers:{Authorization:"Bearer "+process.env.RESEND_API_KEY,"Content-Type":"application/json",...(idempotency?{"Idempotency-Key":idempotency}:{})},
      body:JSON.stringify(data)});
    return result.ok;
  } catch {return false;}
}
async function signed(row:Row,mode:Mode){
  return row.id+"."+await sign(mode+"|"+row.id+"|"+row.token_salt);
}
async function link(row:Row,mode:Mode,resource=""){
  const params=new URLSearchParams({action:mode,t:await signed(row,mode)});
  if(resource)params.set("resource",resource);
  return absolute("/newsletter?"+params.toString());
}
async function send(row:Row,subject:string,message:string,requestId:string){
  return deliveryConfigured() && resend("/emails",{from:process.env.NEWSLETTER_FROM,to:[row.email],subject,text:message},"POST",requestId);
}

export async function subscribe(name:string,email:string,resource:string) {
  const source=resource ? "resource:"+resource : "newsletter";
  let row=await one("SELECT * FROM newsletter_subscribers WHERE email=?",email);
  if (!row) {
    row=await one("INSERT INTO newsletter_subscribers(name,email,consent_at,consent_source,token_salt) VALUES(?,?,?,?,?) ON CONFLICT(email) DO NOTHING RETURNING *",name,email,now(),source,token())
      ?? await one("SELECT * FROM newsletter_subscribers WHERE email=?",email);
  }
  if (!row) throw new InputError("The request could not be stored. Try again.",503);
  if (row.status==="confirmed" && !resource) return "If this address is eligible, you’ll receive a confirmation email.";
  if (row.status==="unsubscribed" || (row.status==="pending" && Date.now()-Date.parse(String(row.consent_at))>threeDays)) {
    const renewed=await one("UPDATE newsletter_subscribers SET status='pending',name=?,consent_at=?,consent_source=?,token_salt=?,sent_at=NULL,sync_status='none' WHERE id=? AND token_salt=? RETURNING *",
      name,now(),source,token(),row.id,row.token_salt);
    if (!renewed) return "Check your inbox for the link to continue.";
    row=renewed;
  }
  if (!deliveryConfigured()) return "Your request was saved. Email confirmation is currently unavailable.";
  const stamp=now();
  const reserved=await one("UPDATE newsletter_subscribers SET sent_at=? WHERE id=? AND token_salt=? AND (sent_at IS NULL OR sent_at<?) RETURNING *",stamp,row.id,row.token_salt,new Date(Date.now()-60000).toISOString());
  if (!reserved) return "Check your inbox for the link to continue.";
  const mode=row.status==="confirmed"?"access":"confirm";
  const sent=await send(row,mode==="confirm"?"Confirm your newsletter subscription":"Your reading resource",
    "Continue with this link:\n\n"+await link(row,mode,resource)+"\n\nIf you did not request this email, you can ignore it.",mode+"/"+row.id+"/"+stamp);
  if (!sent) {
    await run("UPDATE newsletter_subscribers SET sent_at=NULL WHERE id=? AND sent_at=?",row.id,stamp);
    return "Your request was saved. The confirmation email could not be sent. Try again shortly.";
  }
  return "Check your inbox for the link to continue.";
}

export async function sync(id:number){
  if (!process.env.RESEND_SEGMENT_ID || !process.env.RESEND_API_KEY) return false;
  for (let attempt=0;attempt<3;attempt++) {
    const row=await one("SELECT * FROM newsletter_subscribers WHERE id=?",id);
    if (!row) return false;
    const path="/contacts/"+encodeURIComponent(String(row.email));
    const sent=row.status!=="confirmed"
      ? await resend(path,{unsubscribed:true},"PATCH")
      : await resend("/contacts",{email:row.email,first_name:row.name,unsubscribed:false,segments:[{id:process.env.RESEND_SEGMENT_ID}]})
        || (await resend(path,{unsubscribed:false,first_name:row.name},"PATCH") && await resend(path+"/segments/"+process.env.RESEND_SEGMENT_ID,{}));
    const saved=await run("UPDATE newsletter_subscribers SET sync_status=? WHERE id=? AND status=? AND token_salt=?",sent?"synced":"retry",id,row.status,row.token_salt);
    if (saved.meta.changes) return sent;
  }
  await run("UPDATE newsletter_subscribers SET sync_status='retry' WHERE id=?",id);
  return false;
}

export async function subscriberAction(mode:Mode,code:string) {
  const parts=/^(\d{1,12})\.[a-f0-9]{64}$/.exec(code);
  if (!parts) throw new InputError("This subscription link is invalid.");
  const id=Number(parts[1]);
  const row=await one("SELECT * FROM newsletter_subscribers WHERE id=?",id);
  if (!row || !matches(code,await signed(row,mode))) throw new InputError("This subscription link is invalid or has been replaced.");
  if (mode==="unsubscribe"){
    await run("UPDATE newsletter_subscribers SET status='unsubscribed',unsubscribed_at=COALESCE(unsubscribed_at,?) WHERE id=? AND token_salt=?",now(),id,row.token_salt);
    await sync(id);
    return {message:"You’ve been unsubscribed.",cookie:cookie+"=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"+secureCookie(),confirmed:false};
  }
  if (row.status==="unsubscribed" || (mode==="access" && (row.status!=="confirmed" || !row.sent_at || Date.now()-Date.parse(String(row.sent_at))>week))) {
    throw new InputError("Request a fresh link from the newsletter or resource page.");
  }
  if (mode==="confirm" && row.status==="pending" && Date.now()-Date.parse(String(row.consent_at))>threeDays) throw new InputError("The link has expired. Submit the newsletter form again.");
  const confirmed=mode==="confirm" ? await one("UPDATE newsletter_subscribers SET status='confirmed',confirmed_at=?,unsubscribed_at=NULL WHERE id=? AND status='pending' AND token_salt=? RETURNING *",
    now(),id,row.token_salt) : null;
  if (confirmed) {
    await sync(id);
    await send(confirmed,"Welcome to The Writing Room","You’re subscribed. Thank you for joining.\n\nUnsubscribe at any time:\n"+await link(confirmed,"unsubscribe"),"welcome/"+id+"/"+confirmed.token_salt);
  }
  const current=await one("SELECT * FROM newsletter_subscribers WHERE id=? AND status='confirmed' AND token_salt=?",id,row.token_salt);
  if (!current) throw new InputError("This link has been replaced. Request a fresh link.");
  const payload=id+"."+Math.floor((Date.now()+week)/1000);
  const proof=payload+"."+await sign("reader|"+payload+"|"+row.token_salt);
  return {message:mode==="access"?"Your resource is ready.":"Your subscription is confirmed.",cookie:cookie+"="+proof+"; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax"+secureCookie(),confirmed:!!confirmed};
}
export async function hasSubscription(request:Request){
  const value=request.headers.get("cookie")?.split(";").map(c=>c.trim()).find(c=>c.startsWith(cookie+"="))?.slice(cookie.length+1)??"";
  const parts=/^(\d{1,12})\.(\d+)\.([a-f0-9]{64})$/.exec(value);
  if (!parts || Number(parts[2])<Date.now()/1000) return false;
  const row=await one("SELECT token_salt FROM newsletter_subscribers WHERE id=? AND status='confirmed'",Number(parts[1]));
  return !!row && matches(parts[3],await sign("reader|"+parts[1]+"."+parts[2]+"|"+row.token_salt));
}
export async function webhook(request:Request) {
  if (!process.env.RESEND_WEBHOOK_SECRET) return new Response(null,{status:404});
  const id=request.headers.get("svix-id")??"";
  const time=request.headers.get("svix-timestamp")??"";
  const signatures=request.headers.get("svix-signature")??"";
  if (!id || !/^\d{10}$/.test(time) || Math.abs(Date.now()/1000-Number(time))>300) return new Response(null,{status:401});
  const raw=await request.text();
  if (raw.length>100_000) return new Response(null,{status:413});
  const bytes=Uint8Array.from(atob(process.env.RESEND_WEBHOOK_SECRET.replace(/^whsec_/,"")),char=>char.charCodeAt(0));
  const key=await crypto.subtle.importKey("raw",bytes,{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const signature="v1,"+btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(id+"."+time+"."+raw)))));
  if (!signatures.split(" ").some(value=>matches(value,signature))) return new Response(null,{status:401});
  const event=JSON.parse(raw);
  if (event.type==="contact.updated" && event.data?.unsubscribed===true && typeof event.data.email==="string") {
    await run("UPDATE newsletter_subscribers SET status='unsubscribed',unsubscribed_at=?,sync_status='synced' WHERE email=? AND status='confirmed' AND confirmed_at<=?",
      now(),event.data.email.toLowerCase(),event.created_at??now());
  }
  return new Response(null,{status:204});
}
