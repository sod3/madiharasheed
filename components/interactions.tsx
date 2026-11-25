"use client";
import {useEffect,useRef,useState} from "react";
import {BookOpen,Menu,X,ChevronDown,Mail,MessageCircle,ThumbsUp,BadgeCheck} from "lucide-react";
import type {Row} from "@/db";
import {date,href,stars,text} from "@/lib/domain";

export function Brand({title}:{title:string}) {
  return <a href="/" className="brand"><span><BookOpen size={20} strokeWidth={1.65} aria-hidden="true"/></span>{title}</a>;
}
export function Header({title,links,current}:{title:string;links:{label:string;href:string}[];current:string}) {
  const [open,setOpen]=useState(false);
  const button=useRef<HTMLButtonElement>(null);
  const menu=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!open)return;
    menu.current?.querySelector("a")?.focus();
    const close=(event:KeyboardEvent)=>{if(event.key==="Escape"){setOpen(false);button.current?.focus();}};
    document.addEventListener("keydown",close);
    return ()=>document.removeEventListener("keydown",close);
  },[open]);
  const navigation=links.map(link=><a key={link.href} href={link.href} aria-current={link.href===current?"page":undefined}>{link.label}</a>);
  return <header className="header"><div className="shell header-row">
    <Brand title={title}/><nav className="desktop-nav" aria-label="Main navigation">{navigation}</nav>
    <a href="/contact" className="button small header-contact">Get in Touch</a>
    <button ref={button} type="button" className="icon menu" aria-label={open?"Close menu":"Open menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
  </div><div className="mobile-nav" id="mobile-navigation" hidden={!open} ref={menu}>
    <nav aria-label="Mobile navigation">{navigation}</nav><a href="/contact" className="button">Get in Touch</a>
  </div></header>;
}
export function AsyncForm({endpoint,label,children,download="",reset=true}:{endpoint:string;label:string;children:React.ReactNode;download?:string;reset?:boolean}) {
  const [busy,setBusy]=useState(false),[status,setStatus]=useState<{message:string;ok:boolean}|null>(null);
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;
    const form=event.currentTarget;
    setBusy(true);setStatus(null);
    try {
      const result=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(form)))});
      const body=await result.json() as {message:string};
      setStatus({message:body.message,ok:result.ok});
      if(result.ok && reset)form.reset();
    }catch{setStatus({message:"The request could not be sent. Try again.",ok:false});}
    finally{setBusy(false);}
  }
  return <form className="form" method="post" action={endpoint} onSubmit={submit}>
    {children}<label className="sr" aria-hidden="true">Leave empty<input name="website" tabIndex={-1} autoComplete="off"/></label>
    {status?.ok && download ? <a className="button" href={download}>Download resource</a>:<button className="button" disabled={busy}>{busy?"Submitting…":label}</button>}
    {status && <p className={status.ok?"status":"status error"} role={status.ok?"status":"alert"}>{status.message}</p>}
  </form>;
}
export function SubscribeFields({resource=""}:{resource?:string}) {
  return <>
    {resource && <input name="resource" type="hidden" value={resource}/>}
    <div className="pair"><label>First name<input name="name" placeholder="Your first name" autoComplete="given-name" maxLength={80} required/></label>
      <label>Email address<input type="email" name="email" placeholder="you@example.com" autoComplete="email" maxLength={254} required/></label></div>
    <label className="check"><input name="consent" type="checkbox" value="yes" required/><span>I agree to receive the newsletter. I can unsubscribe at any time. <a href="/privacy">Privacy policy</a></span></label>
  </>;
}
export function Gallery({items}:{items:Row[]}) {
  const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement|null>(null),[index,setIndex]=useState(0);
  const current=items[index];
  const step=(direction:number)=>setIndex(index=>(index+direction+items.length)%items.length);
  return <><div className="masonry">{items.map((item,index)=><figure key={item.id}>
    <button aria-label={"Open "+item.title} type="button" onClick={event=>{trigger.current=event.currentTarget;setIndex(index);dialog.current?.showModal();}}>
      {href(item.image) ? <img src={href(item.image)} alt={text(item,"alt")} loading="lazy" decoding="async"/>:<span className="placeholder">Play video</span>}
    </button><figcaption><h3>{item.title}</h3><p>{item.category}{item.demo?" · Editorial sample":""}</p>{item.body && <p>{item.body}</p>}</figcaption>
  </figure>)}</div>
  <dialog ref={dialog} aria-label={text(current,"title")} onClose={()=>trigger.current?.focus()} onKeyDown={event=>{if(event.key==="ArrowLeft")step(-1);if(event.key==="ArrowRight")step(1);}}>
    <button className="icon close" aria-label="Close viewer" type="button" onClick={()=>dialog.current?.close()}><X/></button>
    {current.video ? <video key={text(current,"video")} controls playsInline preload="metadata" src={href(current.video)} poster={href(current.image)}/> :
      <img src={href(current.image)} alt={text(current,"alt")}/>}
    <div className="lightbox-caption"><strong>{current.title}</strong>{items.length>1 && <div className="actions"><button type="button" className="text-link" onClick={()=>step(-1)}>Previous</button><button type="button" className="text-link" onClick={()=>step(1)}>Next</button></div>}</div>
  </dialog></>;
}
export function Registration({course,batches,ready,open}:{course:Row;batches:Row[];ready:boolean;open:boolean}) {
  const available=batches.filter(row=>row.availability==="Open");
  const [id,setId]=useState(available[0]?.id??0);
  const batch=available.find(row=>row.id===id);
  const canRegister=open && (!batches.length || !!batch);
  const link="/api/register?course="+course.slug+(batch?"&batch="+batch.id:"");
  const ask="/contact?category=Course%20registration&subject="+encodeURIComponent(text(course,"title"));
  return <>
    <aside id="registration" className="registration"><p className="eyebrow">{course.demo?"Sample course":course.availability}</p>
      <h2>{batch?.price || course.price || (course.demo?"Course preview":"Price on request")}</h2>
      <p className="muted">{[course.duration,course.format,batch?.starts_on?"Starts "+date(batch.starts_on):""].filter(Boolean).join(" · ")}</p>
      {canRegister && available.length>0 && <label>Choose a batch<span className="select"><select value={id} onChange={event=>setId(Number(event.target.value))}>
        {available.map(row=><option key={row.id} value={row.id}>{row.title}</option>)}</select><ChevronDown size={16}/></span></label>}
      {course.demo ? <p className="muted">This sample shows the lesson structure. Registration opens with a published course.</p> :
      canRegister && ready ? <a className="button" href={link} target="_blank" rel="noreferrer nofollow"><MessageCircle size={18}/> Register via WhatsApp</a> :
      <a className="button outline" href={ask}>{canRegister?"Ask about registration":"Ask about this course"}</a>}
    </aside>
    {canRegister && <div className="mobile-register"><a className="button" href={ready?(available.length>1?"#registration":link):ask}
      target={ready && available.length<2?"_blank":undefined} rel={ready?"noreferrer nofollow":undefined}>{ready?(available.length>1?"Choose a registration batch":"Register via WhatsApp"):"Ask about registration"}</a></div>}
  </>;
}
function ReviewCard({row}:{row:Row}) {
  const [votes,setVotes]=useState(Number(row.helpful??0)),[voted,setVoted]=useState(false),[status,setStatus]=useState("");
  async function vote(){
    setVoted(true);
    try{
      const response=await fetch("/api/useful",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:row.id})});
      const result=await response.json() as {added?:boolean;message:string};
      setStatus(result.message);
      if(result.added)setVotes(votes=>votes+1);
      if(!response.ok)setVoted(false);
    }catch{setVoted(false);setStatus("The vote could not be saved.");}
  }
  return <article className="review"><div className="review-person">
    <span className="initials" aria-hidden="true">{text(row,"name").split(/\s+/).slice(0,2).map(word=>word[0]).join("").toUpperCase()}</span>
    <div><strong>{row.name}</strong><small><BadgeCheck size={15}/> Verified participant</small></div><time dateTime={text(row,"created_at")}>{date(row.created_at)}</time>
    </div><p className="stars" aria-label={row.rating+" out of 5 stars"}>{stars(Number(row.rating))}</p><h3>{row.title}</h3><p>{row.body}</p>
    {row.reply && <blockquote><strong>Instructor’s reply</strong><p>{row.reply}</p></blockquote>}
    <button type="button" className="text-link" onClick={vote} disabled={voted}><ThumbsUp size={15}/> Helpful ({votes})</button>
    <span className="status" role="status">{status}</span>
  </article>;
}
export function Reviews({course,items,distribution,invite,allow}:{course:Row;items:Row[];distribution:Row[];invite:string;allow:boolean}) {
  const count=Number(course.review_count??0),average=Number(course.average??0);
  const [rows,setRows]=useState(items),[sort,setSort]=useState("newest"),[busy,setBusy]=useState(false),[show,setShow]=useState(!!invite),[status,setStatus]=useState("");
  async function load(order:string,append=false){
    if(busy)return;
    setBusy(true);setStatus("");
    try{
      const query=new URLSearchParams({course:text(course,"slug"),sort:order,offset:String(append?rows.length:0)});
      const response=await fetch("/api/reviews?"+query.toString());
      if(!response.ok)throw new Error("Request failed");
      const data=await response.json() as {items:Row[]};
      setRows(append?[...rows,...data.items]:data.items);setSort(order);
    }catch{setStatus("Reviews could not be loaded. Try again.");}finally{setBusy(false);}
  }
  return <section id="reviews" className="reviews">
    <div className="section-head"><div><h2>Student reviews</h2><p>Feedback from verified course participants.</p></div>
      {allow && <button type="button" className="button outline" aria-expanded={show} aria-controls="write-review" onClick={()=>setShow(!show)}>Write a Review</button>}</div>
    {count ? <>
      <div className="ratings"><div><strong>{average.toFixed(1)}</strong><div className="stars" aria-label={average.toFixed(1)+" out of 5 stars"}>{stars(average)}</div><p>{count} verified {count===1?"review":"reviews"}</p></div>
      <div className="rating-bars">{[5,4,3,2,1].map(rating=>{const n=Number(distribution.find(row=>row.rating===rating)?.count??0);return <label key={rating}><span>{rating} star</span><meter aria-label={rating+" star reviews"} min={0} max={count} value={n}/><span>{n}</span></label>;})}</div></div>
      <label className="sort">Sort reviews<select value={sort} onChange={event=>load(event.target.value)} disabled={busy}><option value="newest">Newest</option><option value="highest">Highest rated</option><option value="helpful">Most helpful</option></select></label>
      {rows.map(row=><ReviewCard key={row.id} row={row}/>)}
      {rows.length<count && <button type="button" className="button outline" disabled={busy} onClick={()=>load(sort,true)}>{busy?"Loading…":"Load more reviews"}</button>}
      <p className="status" role="status">{status}</p>
    </>:<div className="empty"><h3>No reviews yet</h3><p>{allow?"Completed this course? Use your review invitation to share your experience.":"Verified reviews will appear when a course is published and participants share feedback."}</p></div>}
    {allow && <div id="write-review" className="panel" hidden={!show}><h3>Share your experience</h3><p>Use your enrollment email and review invitation.</p>
      <AsyncForm endpoint="/api/review" label="Submit review">
        <input name="course" type="hidden" value={text(course,"slug")}/>
        {invite?<input name="invite" type="hidden" value={invite}/>:<label>Invitation code<input name="invite" required maxLength={64} autoComplete="off"/></label>}
        <div className="pair"><label>Name<input name="name" autoComplete="name" required/></label><label>Email<input type="email" name="email" autoComplete="email" required/></label></div>
        <fieldset className="rating-input"><legend>Your rating</legend>{[1,2,3,4,5].map(number=><label key={number}><input type="radio" name="rating" required value={number}/>{number} {number===1?"star":"stars"}</label>)}</fieldset>
        <label>Review title<input name="title" maxLength={140} required/></label><label>Feedback<textarea name="body" rows={5} maxLength={4000} required/></label>
      </AsyncForm></div>}
  </section>;
}
export function ReadTools({url,title}:{url:string;title:string}) {
  const [position,setPosition]=useState(0),[copied,setCopied]=useState(false);
  useEffect(()=>{
    const update=()=>{
      const node=document.getElementById("reading-body");
      if(!node)return;
      const rect=node.getBoundingClientRect();
      setPosition(Math.min(1,Math.max(0,(innerHeight/3-rect.top)/Math.max(1,rect.height-innerHeight/3))));
    };
    update();window.addEventListener("scroll",update,{passive:true});return()=>window.removeEventListener("scroll",update);
  },[]);
  return <><div className="progress" aria-hidden="true"><span style={{transform:"scaleX("+position+")"}}/></div>
    <div className="actions share"><button type="button" className="text-link" onClick={async()=>{try{await navigator.clipboard.writeText(url);setCopied(true);}catch{setCopied(false);}}}>{copied?"Link copied":"Copy link"}</button>
      <a className="text-link" target="_blank" rel="noreferrer" href={"https://wa.me/?text="+encodeURIComponent(title+" "+url)}>Share on WhatsApp</a></div></>;
}
export function Metrics({id}:{id:string}) {
  useEffect(()=>{
    fetch("/api/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:location.pathname}),keepalive:true}).catch(()=>undefined);
    const params=new URLSearchParams(location.search);
    if (!/^G-[A-Z0-9]+$/.test(id) || ["invite","preview","t"].some(key=>params.has(key))) return;
    try {if(localStorage.getItem("writing-room-analytics")!=="yes")return;}catch{return;}
    const global=window as Window & {dataLayer?:unknown[];gtag?:(...args:unknown[])=>void};
    global.dataLayer??=[];
    global.gtag=function(){global.dataLayer?.push(arguments);};
    global.gtag("js",new Date());
    global.gtag("config",id,{page_location:location.origin+location.pathname,allow_google_signals:false});
    const script=document.createElement("script");script.src="https://www.googletagmanager.com/gtag/js?id="+id;script.async=true;script.referrerPolicy="no-referrer";document.head.appendChild(script);
    return()=>{script.remove();};
  },[id]);return null;
}
export function PrivacyPreference() {
  const [allowed,setAllowed]=useState(false);
  useEffect(()=>{try{setAllowed(localStorage.getItem("writing-room-analytics")==="yes");}catch{}},[]);
  return <label className="check"><input type="checkbox" checked={allowed} onChange={event=>{setAllowed(event.target.checked);try{localStorage.setItem("writing-room-analytics",event.target.checked?"yes":"no");}catch{}}}/>Allow optional Google Analytics on this browser</label>;
}
