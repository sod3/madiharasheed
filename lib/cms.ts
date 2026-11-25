import { courseFormats, courseStates, type Settings } from "./domain";
type Kind="text"|"long"|"checkbox"|"file"|"url"|"email"|"number"|"date"|"datetime-local"|"select";
export type Field={name:string;label:string;kind:Kind;required?:boolean;options?:string[];table?:string;help?:string};
function field(name:string,label:string,kind:Kind="text",required=false,help?:string):Field {return {name,label,kind,required,help};}
const select=(name:string,label:string,options:string[])=>({...field(name,label,"select",true),options});
const relation=(name:string,label:string,table:string,required=false)=>({...field(name,label,"select",required),table});
const title=field("title","Title","text",true);
const slug=field("slug","URL slug","text",true,"Use lowercase letters, digits, and hyphens.");
const body=field("body","Content","long",false,"Use blank lines between paragraphs and ## for subheadings.");
const caption=field("body","Caption","long");
const summary=field("summary","Short introduction","long");
const images=[field("image","Image","file"),field("alt","Image description")];
const video=field("video","Video","file",false,"Upload an MP4 or WebM or paste a direct video URL.");
const order=field("position","Display order","number");
const visible=field("visible","Publicly visible","checkbox");
const featured=field("featured","Feature on the website","checkbox");
const category=field("category","Category");
const dateLabel=field("date_label","Date or period");
const issuer=field("issuer","Institution or issuer");
const link=field("url","Related URL","url");
const price=field("price","Price", "text",false,"Include the currency, or enter Free.");
const publishing=[visible,field("published_at","Publication date and time (UTC)","datetime-local",false,"Leave empty to publish immediately when visible."),
  field("seo_title","Search title"),field("seo_description","Search description","long")];
const course=relation("course_id","Course","courses",true);
const name=field("name","Name","text",true);
const email=field("email","Email address","email",true);
const moderation=select("status","Moderation status",["pending","published","rejected"]);
export type Module={label:string;table:string;fields:Field[];prefix?:string;readOnly?:boolean};
export const modules:Record<string,Module>={
  courses:{label:"Courses",table:"courses",prefix:"/courses/",fields:[title,slug,relation("category_id","Category","course_categories"),summary,body,
    ...images,video,field("instructor","Instructor"),field("instructor_bio","Instructor biography","long"),field("duration","Duration"),
    select("format","Learning format",courseFormats),price,select("availability","Availability",courseStates),
    field("audience","Who it’s for","long",false,"Use one item per line."),field("outcomes","Learning outcomes","long",false,"Use one item per line."),
    field("requirements","Requirements","long"),field("benefits","Benefits","long"),field("certificate","Certificate","long"),
    field("faq","Frequently asked questions","long",false,"Use one question | answer pair per line."),order,featured,...publishing]},
  "course-categories":{label:"Course categories",table:"course_categories",fields:[title,order]},
  curriculum:{label:"Curriculum",table:"course_modules",fields:[course,title,body,order]},
  batches:{label:"Batches",table:"course_batches",fields:[course,title,field("starts_on","Start date","date"),field("schedule","Session schedule","long"),price,
    select("availability","Registration",["Open","Closed","Coming soon"])]},
  participants:{label:"Participants",table:"course_participants",fields:[course,relation("batch_id","Batch","course_batches"),name,email]},
  reviews:{label:"Student reviews",table:"reviews",fields:[moderation,field("reply","Public reply","long"),field("flagged","Flag for follow-up","checkbox")],readOnly:true},
  articles:{label:"Reflections",table:"articles",prefix:"/reflections/",fields:[title,slug,relation("category_id","Category","article_categories"),
    select("language","Language",["en","ur"]),field("author","Byline"),summary,body,...images,field("comments_enabled","Allow moderated comments","checkbox"),featured,...publishing]},
  "article-categories":{label:"Reflection categories",table:"article_categories",fields:[title,order]},
  comments:{label:"Comments",table:"comments",fields:[moderation],readOnly:true},
  publications:{label:"Publications",table:"publications",prefix:"/publications/",fields:[title,slug,category,field("publisher","Publisher"),field("issue_date","Publication date","date"),
    summary,body,...images,field("purchase_url","Purchase URL","url"),field("download_url","Authorized download","file"),field("reference_url","Reference URL","url"),...publishing]},
  gallery:{label:"Gallery",table:"gallery_items",fields:[title,category,...images,video,caption,order,visible]},
  resources:{label:"Resources",table:"resources",fields:[title,slug,category,summary,...images,field("gated","Require confirmed newsletter subscription","checkbox"),field("file","Download","file",true),order,visible]},
  organizations:{label:"Organizations",table:"organizations",fields:[title,...images,link,order,visible]},
  experience:{label:"Professional experience",table:"professional_experiences",fields:[title,relation("organization_id","Organization","organizations"),dateLabel,
    {...body,label:"Responsibilities and contributions"},field("impact","Professional impact","long"),...images,link,order,visible]},
  achievements:{label:"Achievements",table:"achievements",fields:[title,select("category","Recognition category",["Academic achievements","Professional recognition","Awards and honors","Leadership achievements","Certifications","Social and community contributions","Special recognitions"]),issuer,dateLabel,body,...images,order,featured,visible]},
  qualifications:{label:"Education and training",table:"qualifications",fields:[title,issuer,dateLabel,body,order,visible]},
  milestones:{label:"Career timeline",table:"milestones",fields:[title,dateLabel,body,order,visible]},
  media:{label:"Media and speaking",table:"media_mentions",fields:[title,category,dateLabel,body,link,order,visible]},
  testimonials:{label:"Testimonials",table:"testimonials",fields:[name,field("role","Designation"),field("relationship","Course or relationship"),{...body,label:"Testimonial",required:true},...images,field("rating","Rating (optional, 1–5)","number"),order,visible]},
  subscribers:{label:"Subscribers",table:"newsletter_subscribers",fields:[],readOnly:true},
  inquiries:{label:"Inquiries",table:"contact_inquiries",fields:[select("status","Status",["new","read","replied"])],readOnly:true},
};
export const moduleFor=(key:string)=>Object.hasOwn(modules,key) ? modules[key]:undefined;
export const sections={
  Learning:["courses","course-categories","curriculum","batches","participants","reviews"],
  Publishing:["articles","article-categories","comments","publications","gallery","resources"],
  Profile:["organizations","experience","achievements","qualifications","milestones","media","testimonials"],
  Community:["subscribers","inquiries"],
};
const setting=(name:keyof Settings,label:string,kind:Kind="text",required=false,help?:string)=>field(name,label,kind,required,help);
export const settingGroups=[
  {title:"Brand and homepage",fields:[
    setting("site_title","Site title","text",true),setting("author_name","Author’s public name"),setting("hero_label","Hero label"),
    setting("hero_line_1","Headline, line one"),setting("hero_line_2","Headline, line two"),setting("hero_line_3","Headline, line three"),
    setting("hero_description","Hero introduction","long"),setting("hero_image","Author portrait","file"),setting("hero_alt","Portrait description"),
    setting("intro_title","Biography headline"),setting("intro_body","Short biography","long"),setting("intro_quote","Verified personal quote","long"),
    setting("statistics","Verified career statistics","long",false,"Add one value | label pair per line."),
  ]},
  {title:"Author profile and speaking",fields:[
    setting("about_image","About portrait","file"),setting("about_image_alt","Portrait description"),setting("background","Personal background","long"),
    setting("philosophy","Philosophy","long"),setting("beyond","Beyond the profession","long"),setting("professional_bio","Downloadable biography","file"),
    setting("media_kit","Media kit","file"),setting("speaking_intro","Speaking introduction","long"),setting("speaking_topics","Speaking topics","long"),setting("speaking_types","Engagement types","long"),
  ]},
  {title:"Contact and social links",fields:[
    setting("email","Professional email","email"),setting("whatsapp","WhatsApp number with country code"),
    setting("linkedin","LinkedIn","url"),setting("instagram","Instagram","url"),setting("facebook","Facebook","url"),setting("youtube","YouTube","url"),setting("other_social","Other social link","url"),
  ]},
  {title:"Newsletter and navigation",fields:[
    setting("newsletter_title","Newsletter headline"),setting("newsletter_description","Newsletter introduction","long"),
    setting("nav_order","Navigation order","text",false,"List page names separated by commas."),
    setting("show_gallery","Show gallery","checkbox"),setting("show_speaking","Show speaking and collaboration","checkbox"),
    setting("show_resources","Show free resources","checkbox"),setting("show_testimonials","Show verified testimonials","checkbox"),setting("show_demo","Show sample content while catalogues are empty","checkbox"),
  ]},
];
