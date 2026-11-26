import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {Activity,BookOpen,ClipboardList,FileText,Mail,MessageCircle,Search,Settings,Star,Users} from "lucide-react";
import {findMany,findOne,type Row} from "@/db";
import {settings,now} from "@/lib/content";
import {date,q,type Query} from "@/lib/domain";
import {admin,adminConfigured,adminEmailRequired,integer} from "@/lib/security";
import {choices,dashboard} from "@/lib/admin";
import {modules,moduleFor,sections,settingGroups,type Module} from "@/lib/cms";
import {deliveryConfigured} from "@/lib/newsletter";
import {AdminAction,AdminLogin,AdminSignOut,Editor} from "@/components/editor";
import "./admin.css";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Website editor | Madiha Rasheed",robots:{index:false,follow:false}};

function state(row:Row){
  if(row.status)return row.status;
  if(row.visible==null)return row.availability||"";
  if(!row.visible)return "Draft";
  return row.published_at&&String(row.published_at)>now()?"Scheduled":"Visible";
}

export default async function Admin({params,searchParams}:{params:Promise<{section?:string[]}>;searchParams:Promise<Query>}) {
  const user=await admin();
  if(!user){
    return <main id="main" className="admin-gate reading section"><BookOpen size={31}/><h1>Editor access</h1>
      <p>{adminConfigured()?"Sign in to manage this website.":"Admin login is not configured yet. Set ADMIN_PASSWORD and RATE_SECRET (32+ characters) in your environment variables."}</p>
      {adminConfigured()?<AdminLogin requiresEmail={adminEmailRequired()}/>:<div className="actions"><Link href="/" className="button outline">Back to website</Link></div>}</main>;
  }
  const [{section=[]},query,site]=await Promise.all([params,searchParams,settings()]);
  const key=section[0]??"",mod=moduleFor(key);
  if(section.length>1 || key&&key!=="settings"&&!mod)notFound();
  return <div className="admin-layout">
    <aside className="admin-nav"><Link className="editor-brand" href="/admin"><BookOpen size={22}/><span>{site.site_title}<small>Website editor</small></span></Link>
      <nav aria-label="Editor sections"><Link href="/admin" aria-current={!key?"page":undefined}>Overview</Link>
        {Object.entries(sections).map(([label,keys])=><details key={label} open><summary>{label}</summary>{keys.map(item=><Link href={"/admin/"+item} aria-current={key===item?"page":undefined} key={item}>{modules[item].label}</Link>)}</details>)}
        <Link href="/admin/settings" aria-current={key==="settings"?"page":undefined}><Settings size={16}/> Website settings</Link></nav>
      <Link className="text-link" href="/">View website</Link><AdminSignOut/></aside>
    <main className="admin-main" id="main">
      {!key?<Overview/>:key==="settings"?<><div className="editor-title"><div><h1>Website settings</h1><p>Edit the author profile, homepage, contact details, and navigation.</p></div></div>
        <div className="settings-groups">{settingGroups.map((group,index)=><details className="admin-panel" key={group.title} open={index===0}><summary>{group.title}</summary>
          <Editor module="settings" fields={group.fields} record={site}/></details>)}</div></>:mod?<ModulePage module={mod} moduleKey={key} query={query}/>:null}
    </main>
  </div>;
}
async function Overview(){
  const counts=await dashboard();
  const metrics=[
    ["visitors","Visitors today",Activity,""],["course_views","Course page views",BookOpen,"courses"],["whatsapp","WhatsApp registration clicks",MessageCircle,"courses"],
    ["enrollments","Confirmed enrollments",Users,"participants"],["subscribers","Confirmed subscribers",Mail,"subscribers"],["articles","Published reflections",FileText,"articles"],
    ["reviews","Pending reviews",Star,"reviews"],["inquiries","New inquiries",ClipboardList,"inquiries"],
  ] as const;
  return <><header className="editor-title"><div><h1>Overview</h1><p>Manage your writing, courses, and community.</p></div><Link href="/" className="button outline">View website</Link></header>
    <div className="metric-grid">{metrics.map(([key,label,Icon,section])=>{
      const content=<><Icon size={20} strokeWidth={1.6}/><strong>{counts?.[key]??0}</strong><span>{label}</span></>;
      return section?<Link href={"/admin/"+section} className="metric" key={key}>{content}</Link>:<div className="metric" key={key}>{content}</div>;
    })}</div>
    <div className="admin-cards"><section className="admin-panel"><h2>Profile and branding</h2><p>Add your verified biography, portrait, professional credentials, and contact details.</p><Link className="text-link" href="/admin/settings">Open website settings</Link></section>
      <section className="admin-panel"><h2>Newsletter delivery</h2><p>{deliveryConfigured()?"Confirmation and welcome email are configured.":"Subscriber requests are stored. A verified Resend sender is required to deliver confirmation and welcome email."}</p>
        <p className="muted">{counts?.pending??0} pending confirmations</p><Link className="text-link" href="/admin/subscribers">Manage subscribers</Link></section></div></>;
}
async function ModulePage({module,moduleKey,query}:{module:Module;moduleKey:string;query:Query}){
  const id=integer(q(query,"edit")),make=q(query,"new")==="1"&&!module.readOnly;
  const search=q(query,"q"),page=Math.min(integer(q(query,"page"))||1,400);
  const table=module.table,searchBy=["participants","subscribers","testimonials","comments"].includes(moduleKey)?"name":"title";
  const escaped=search.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const filter=search?{[searchBy]:{$regex:escaped,$options:"i"}}:{};
  const projection=moduleKey==="participants"
    ? {_id:0,id:1,name:1,email:1,course_id:1,batch_id:1,created_at:1}
    : moduleKey==="subscribers"
      ? {_id:0,id:1,name:1,email:1,status:1,consent_at:1,sync_status:1}
      : {_id:0};
  const [rows,record,options]=await Promise.all([
    findMany(table,filter,{sort:{id:-1},skip:(page-1)*25,limit:26,projection}),
    id?findOne(table,{id}):null,make||id?choices(module.fields):{},
  ]);
  if(id&&!record)notFound();
  const path="/admin/"+moduleKey,label=record?String(record.title||record.name||"Record"):"New record";
  const title=(row:Row)=>row.title||row.name||"Record";
  return <><header className="editor-title"><div><Link href="/admin" className="text-link">Overview</Link><h1>{module.label}</h1></div><div className="actions">
    {!module.readOnly&&<Link className="button" href={path+"?new=1"}>Add record</Link>}
    {moduleKey==="subscribers"&&<a className="button" href="/api/admin/export" download="newsletter-subscribers.csv">Export CSV</a>}</div></header>
    {(make||record)&&<section className="admin-panel current-editor"><div className="editor-bar"><div><h2>{label}</h2>{q(query,"saved")==="1"&&<p className="status" role="status">Record saved.</p>}</div>
      <div className="actions">{module.prefix&&record?.slug&&<a href={module.prefix+record.slug+"?preview=1"} target="_blank" rel="noreferrer" className="button outline small">Preview</a>}
      <a href={path} className="text-link">Close editor</a></div></div>
      {record&&["inquiries","reviews","comments"].includes(moduleKey)&&<div className="record-note"><p className="meta">{[record.name,record.email,record.rating?record.rating+" out of 5 stars":"",date(record.created_at)].filter(Boolean).join(" · ")}</p><p>{record.body}</p></div>}
      {record&&moduleKey==="subscribers"&&<div className="record-note"><dl>{["email","status","consent_source","consent_at","confirmed_at","unsubscribed_at","sync_status"].map(key=><div key={key}><dt>{key.replaceAll("_"," ")}</dt><dd>{record[key]||"—"}</dd></div>)}</dl>
        {record.status!=="pending"&&<AdminAction id={id} action="sync" label="Sync with email provider"/>}</div>}
      {!!module.fields.length&&<Editor module={moduleKey} key={id||"new"} fields={module.fields} record={record??undefined} choices={options}/>}
      {moduleKey==="participants"&&!!record&&<div className="invite"><h3>Verified review invitation</h3><p>Share a one-time link privately with this enrolled participant. Generating a new link replaces the previous link.</p><AdminAction id={id} action="invite" label="Create review invitation"/></div>}
    </section>}
    <section className="admin-panel"><div className="editor-bar"><h2>Records</h2><form method="get" action={path} className="search"><Search size={17}/>
      <input type="search" name="q" aria-label="Search records" placeholder="Search records" defaultValue={search}/><button className="button small">Search</button></form></div>
      {rows.length?<div className="table-scroll"><table><thead><tr><th scope="col">{searchBy==="name"?"Name":"Title"}</th><th scope="col">Details</th><th scope="col">Status</th><th scope="col"><span className="sr">Action</span></th></tr></thead>
        <tbody>{rows.slice(0,25).map(row=><tr key={row.id}><td><strong>{title(row)}</strong></td><td>{row.email||row.issuer||row.category||row.slug||row.availability||"—"}</td>
          <td>{state(row)?<span className="badge">{state(row)}</span>:"—"}</td><td><a className="text-link" href={path+"?edit="+row.id} aria-label={(module.readOnly?"View ":"Edit ")+title(row)}>{module.readOnly?"View":"Edit"}</a></td></tr>)}</tbody>
        </table></div>:<p className="muted">{search?"No records match this search.":"No records have been added."}</p>}
      {(page>1||rows.length>25)&&<div className="actions pager">{page>1&&<a className="button outline small" href={path+"?q="+encodeURIComponent(search)+"&page="+(page-1)}>Previous</a>}
        <span className="muted">Page {page}</span>{rows.length>25&&<a className="button outline small" href={path+"?q="+encodeURIComponent(search)+"&page="+(page+1)}>Next</a>}</div>}
    </section>
  </>;
}
