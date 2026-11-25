import type { Row } from "@/db";

export const images={hero:"/images/writing-desk.webp",craft:"/images/writing-workshop.webp",notes:"/images/notes.webp"};
export const courseFormats=["Live online","Self-paced","In-person workshop","On-demand video","Free resource"];
export const courseStates=["Upcoming","Ongoing","Self-paced","Registration closed","Coming soon"];
export const inquiryTypes=["Course registration","Speaking invitation","Professional collaboration","Writing opportunity","Media and interviews","General inquiry"];
export const defaults={
  site_title:"The Writing Room",author_name:"",hero_label:"Writer · Educator · Lifelong Learner",
  hero_line_1:"Words that inspire.",hero_line_2:"Knowledge that empowers.",hero_line_3:"Experiences that transform.",
  hero_description:"A space for meaningful reflections, transformative learning, and ideas shaped by a journey of professional excellence, curiosity, and purpose.",
  hero_image:"",hero_alt:"",intro_title:"The work behind the words",intro_body:"",intro_quote:"",about_image:"",about_image_alt:"",
  background:"",philosophy:"",beyond:"",professional_bio:"",media_kit:"",statistics:"",
  speaking_topics:"",speaking_types:"",speaking_intro:"",email:"",whatsapp:"",
  linkedin:"",instagram:"",facebook:"",youtube:"",other_social:"",
  newsletter_title:"A little wisdom in your inbox.",
  newsletter_description:"Receive thoughtful reflections, valuable insights, learning resources, and updates on upcoming courses directly in your inbox.",
  nav_order:"",show_gallery:"1",show_speaking:"1",show_resources:"1",show_testimonials:"1",show_demo:"1",
};
export type Settings = typeof defaults;
export function href(value:unknown) {
  if (typeof value!=="string" || !value.trim()) return "";
  if (/^\/(?!\/)[^\\\s]*$/.test(value)) return value;
  try {const url=new URL(value);return url.protocol==="https:" && !url.username && !url.password ? url.href : "";}catch{return "";}
}
export function phone(value:string) {
  const number=value.replace(/[\s()+-]/g,"");
  return /^[1-9]\d{7,14}$/.test(number) ? number:"";
}
export function whatsapp(number:string,message:string) {
  return phone(number) ? "https://wa.me/" + phone(number) + "?text=" + encodeURIComponent(message):"";
}
export function date(value:unknown) {
  if (!value) return "";
  const timestamp=new Date(String(value));
  return Number.isNaN(timestamp.getTime()) ? "" : new Intl.DateTimeFormat("en",{dateStyle:"long",timeZone:"UTC"}).format(timestamp);
}
export function readings(value:unknown) {return Math.max(1,Math.ceil(String(value??"").trim().split(/\s+/).length/220))+" min read";}
export function text(row:Row,key:string) {return String(row[key]??"");}
export const openCourse = (row:Row) => !row.demo && courseStates.slice(0,3).includes(text(row,"availability"));
export function categories(rows:Row[]) {return [...new Set(rows.map(row=>text(row,"category")).filter(Boolean))].sort();}
export type Query=Record<string,string|string[]|undefined>;
export function q(query:Query,key:string,max=160) {
  const value=query[key];return typeof value==="string" ? value.trim().slice(0,max):"";
}
export const stars=(rating:number)=>"★".repeat(Math.min(5,Math.max(0,Math.round(rating))))+"☆".repeat(5-Math.min(5,Math.max(0,Math.round(rating))));
