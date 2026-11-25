import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { one,run } from "@/db";
import { origin } from "./content";
export class InputError extends Error {constructor(message:string,readonly status=400){super(message);}}
export async function admin() {
  const user=await getChatGPTUser();
  const emails=(env.ADMIN_EMAILS??"").split(",").map(email=>email.trim().toLowerCase()).filter(Boolean);
  return user && emails.includes(user.email.toLowerCase()) ? user:null;
}
export const json=(message:string,status=200)=>Response.json({message},{status});
export function error(error:unknown) {
  if (error instanceof InputError) return json(error.message,error.status);
  const message=error instanceof Error?error.message:"";
  if (/UNIQUE constraint failed/i.test(message)) return json("A record with these details already exists.",409);
  if (/FOREIGN KEY constraint failed/i.test(message)) return json("Please choose an existing related record.",400);
  console.error("Request failed",error instanceof Error?error.name:"Unknown");
  return json("The request could not be completed. Please try again.",500);
}
export function sameOrigin(request:Request) {
  const source=request.headers.get("origin");
  if (!source || ![new URL(request.url).origin,origin()].includes(source)) throw new InputError("Submit this form from the website.",403);
}
export async function read(request:Request) {
  sameOrigin(request);
  if (!request.headers.get("content-type")?.includes("application/json")) throw new InputError("This form requires JavaScript.");
  if (Number(request.headers.get("content-length")??0)>150_000) throw new InputError("This form is too large.",413);
  const source=await request.text();
  if (source.length>150_000) throw new InputError("This form is too large.",413);
  let value:unknown;
  try {value=JSON.parse(source);} catch {throw new InputError("This form could not be read.");}
  if (!value || typeof value!=="object" || Array.isArray(value)) throw new InputError("This form could not be read.");
  return value as Record<string,unknown>;
}
export function input(data:Record<string,unknown>,key:string,max=400,required=false,label=key) {
  const value=data[key];
  if (value!=null && typeof value!=="string") throw new InputError("Enter a valid "+label+".");
  const trimmed=typeof value==="string"?value.trim():"";
  if (required && !trimmed) throw new InputError("Enter "+label+".");
  if (trimmed.length>max) throw new InputError(label+" is too long.");
  return trimmed;
}
export function email(value:string) {
  const clean=value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(clean) || clean.length>254) throw new InputError("Enter a valid email address.");
  return clean;
}
export function integer(value:unknown) {
  if (typeof value!=="number" && typeof value!=="string") return 0;
  const number=Number(value);
  return Number.isSafeInteger(number) && number>0 ? number:0;
}
const hex=(bytes:Uint8Array)=>Array.from(bytes,value=>value.toString(16).padStart(2,"0")).join("");
export function token(){return hex(crypto.getRandomValues(new Uint8Array(32)));}
export async function hash(value:string){return hex(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value))));}
export async function sign(value:string) {
  const secret=env.RATE_SECRET;
  if (!secret || secret.length<32) throw new InputError("Server security is being configured.",503);
  const enc=new TextEncoder();
  const key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return hex(new Uint8Array(await crypto.subtle.sign("HMAC",key,enc.encode(value))));
}
export function matches(a:string,b:string) {
  if (a.length!==b.length) return false;
  let diff=0;for(let i=0;i<a.length;i++) diff|=a.charCodeAt(i)^b.charCodeAt(i);
  return diff===0;
}
export function visitor(request:Request,scope:string){
  return sign(scope+"|"+(request.headers.get("cf-connecting-ip")??"local")+"|"+(request.headers.get("user-agent")??"").slice(0,180));
}
export async function limit(request:Request,action:string,max=8) {
  const now=Math.floor(Date.now()/1000),bucket=Math.floor(now/900);
  const key=await visitor(request,action+"|"+bucket);
  const row=await one<{hits:number}>("INSERT INTO request_limits(key,hits,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET hits=hits+1 RETURNING hits",key,(bucket+1)*900);
  if (row && row.hits>max) throw new InputError("Too many requests. Try again in a few minutes.",429);
  if (Math.random()<0.025) await run("DELETE FROM request_limits WHERE expires_at<?",now);
}
export async function track(request:Request,event:string,path:string) {
  if (!/^\/(?:|[a-z-]{1,35}(?:\/[a-z0-9-]{1,100})?)$/.test(path) || /^\/(admin|api|newsletter)(\/|$)/.test(path)) return;
  const day=new Date().toISOString().slice(0,10);
  await run("INSERT OR IGNORE INTO analytics_events(event,path,visitor,bucket) VALUES(?,?,?,?)",event,path,await visitor(request,"metrics|"+day),day);
}
