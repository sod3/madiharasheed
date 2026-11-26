"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useId,useState} from "react";
import {ChevronDown,Upload} from "lucide-react";
import type {Row} from "@/db";
import type {Field} from "@/lib/cms";
type Values=Record<string,string|number|null|boolean|undefined>;
type Result={ok:boolean;message:string;id?:number;url?:string};
async function send(action:string,body:object|FormData):Promise<Result> {
  try {
    const upload=body instanceof FormData;
    const response=await fetch("/api/admin/"+action,{method:"POST",headers:upload?undefined:{"Content-Type":"application/json"},body:upload?body:JSON.stringify(body)});
    const data=await response.json() as Omit<Result,"ok">;
    return {ok:response.ok,...data};
  }catch{return {ok:false,message:"The request could not be completed. Try again."};}
}
function UploadField({field,value,restricted,onPending}:{field:Field;value:string;restricted:boolean;onPending:(delta:number)=>void}){
  const id=useId(),[url,setUrl]=useState(value),[status,setStatus]=useState<Result|null>(null),[busy,setBusy]=useState(false);
  async function upload(file:File){
    setBusy(true);onPending(1);
    const form=new FormData();
    form.set("file",file);form.set("restricted",restricted?"1":"0");
    try{const result=await send("upload",form);setStatus(result);if(result.url&&result.ok)setUrl(result.url);}
    finally{setBusy(false);onPending(-1);}
  }
  return <div className="edit-field"><label htmlFor={id}>{field.label}</label>
    <div className="upload-field"><input id={id} name={field.name} required={field.required} value={url} onChange={event=>setUrl(event.target.value)} placeholder="Paste a link or upload"/>
      <label className="button outline small upload"><Upload size={15}/>{busy?"Uploading…":"Upload"}<input type="file" className="sr" aria-label={"Upload "+field.label}
        accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,application/pdf" disabled={busy}
        onChange={event=>{const file=event.target.files?.[0];if(file)void upload(file);event.target.value="";}}/></label></div>
    {field.help&&<small>{field.help}</small>}{status&&<small className={status.ok?"status":"error"} role="status">{status.message}</small>}</div>;
}
export function Editor({module,fields,record={},choices={}}:{module:string;fields:Field[];record?:Values;choices?:Record<string,Row[]>}){
  const router=useRouter();
  const settings=module==="settings",path="/admin/"+module;
  const [status,setStatus]=useState<Result|null>(null),[busy,setBusy]=useState(false),[uploads,setUploads]=useState(0),[deleteOpen,setDeleteOpen]=useState(false);
  const [course,setCourse]=useState(String(record.course_id??"")),[slug,setSlug]=useState(String(record.slug??""));
  const [manualSlug,setManualSlug]=useState(!!record.slug),[restricted,setRestricted]=useState(String(record.gated)==="1");
  async function doAction(action:string,data:object){
    if(busy)return;
    setBusy(true);setStatus(null);
    try {
      const result=await send(action,data);
      setStatus(result);
      if(result.ok&&!settings){
        if(action==="delete")router.push(path);
        else if(result.id)router.push(path+"?edit="+result.id+"&saved=1");
        router.refresh();
      }
    }finally{setBusy(false);}
  }
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(uploads||busy)return;
    const values=Object.fromEntries(new FormData(event.currentTarget));
    for(const field of fields)if(field.kind==="checkbox"&&values[field.name]==null)values[field.name]="0";
    await doAction(settings?"settings":"save",{...values,module,id:record.id});
  }
  const canDelete=!!record.id&&!["reviews","comments","subscribers","settings"].includes(module);
  return <form className="form editor-form" action={settings?"/api/admin/settings":"/api/admin/save"} method="post" onSubmit={submit}>
    <div className="edit-fields">{fields.map(field=>{
      const value=String(record[field.name]??(field.name==="position"?0:""));
      if(field.kind==="file")return <UploadField key={field.name} field={field} value={value} restricted={field.name==="file"&&restricted} onPending={delta=>setUploads(count=>count+delta)}/>;
      if(field.kind==="checkbox")return <label key={field.name} className="check editor-check"><input type="checkbox" name={field.name} value="1" defaultChecked={value==="1"}
        onChange={field.name==="gated"?event=>setRestricted(event.target.checked):undefined}/><strong>{field.label}</strong></label>;
      if(field.kind==="select"){
        const options=field.table?(choices[field.table]??[]).filter(row=>field.name!=="batch_id"||String(row.course_id)===course)
          .map(row=>({value:String(row.id),label:String(row.title)})):(field.options??[]).map(value=>({value,label:value==="en"?"English":value==="ur"?"Urdu":value}));
        return <label className="edit-field" key={field.name}>{field.label}<span className="select"><select key={field.name==="batch_id"?course:field.name} name={field.name} defaultValue={value}
          required={field.required} onChange={field.name==="course_id"?event=>setCourse(event.target.value):undefined}><option value="">{field.required?"Choose an option":"None"}</option>
          {options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={15}/></span></label>;
      }
      const long=field.kind==="long";
      return <label className={"edit-field"+(long?" wide":"")} key={field.name}>{field.label}
        {long?<textarea name={field.name} rows={field.name==="body"?8:3} defaultValue={value} required={field.required} maxLength={50000}/>:
        field.name==="slug"?<input name={field.name} value={slug} maxLength={100} required pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={event=>{setSlug(event.target.value);setManualSlug(true);}}/>:
        <input name={field.name} type={field.kind==="url"?"text":field.kind} defaultValue={field.kind==="datetime-local"?value.slice(0,16):value}
          required={field.required} maxLength={field.kind==="url"?2048:240} onChange={field.name==="title"?event=>{
            if(!manualSlug)setSlug(event.target.value.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,100).replace(/-$/,""));
          }:undefined}/>}
        {field.help&&<small>{field.help}</small>}</label>;
    })}</div>
    <div className="actions"><button className="button" disabled={busy||uploads>0}>{busy?"Saving…":settings?"Save settings":"Save record"}</button>
      {module==="courses"&&!!record.id&&<button className="button outline" type="button" disabled={busy} onClick={()=>doAction("duplicate",{id:record.id})}>Duplicate as draft</button>}
      {canDelete&&!deleteOpen&&<button className="text-link error" type="button" onClick={()=>setDeleteOpen(true)}>Delete</button>}
      {canDelete&&deleteOpen&&<><button className="button danger" type="button" disabled={busy} onClick={()=>doAction("delete",{id:record.id,module})}>Confirm deletion</button>
        <button className="text-link" type="button" onClick={()=>setDeleteOpen(false)}>Cancel</button></>}
    </div>
    {status&&<p className={status.ok?"status":"error"} role={status.ok?"status":"alert"}>{status.message}</p>}
  </form>;
}
export function AdminAction({action,id,label}:{action:"invite"|"sync";id:number;label:string}){
  const [result,setResult]=useState<Result|null>(null),[busy,setBusy]=useState(false),[copied,setCopied]=useState(false);
  return <div className="admin-action"><button type="button" className="button outline" disabled={busy} onClick={async()=>{setBusy(true);setCopied(false);try{setResult(await send(action,{id}));}finally{setBusy(false);}}}>{busy?"Working…":label}</button>
    {result&&<p className={result.ok?"status":"error"} role="status">{result.message}</p>}
    {result?.url&&<div className="actions"><label className="invite-url">Review link<input readOnly value={result.url} onFocus={event=>event.target.select()}/></label>
      <button className="text-link" type="button" onClick={async()=>{try{await navigator.clipboard.writeText(result.url??"");setCopied(true);}catch{setCopied(false);}}}>{copied?"Copied":"Copy review link"}</button></div>}
  </div>;
}
export function AdminLogin({requiresEmail}:{requiresEmail:boolean}){
  const [busy,setBusy]=useState(false),[status,setStatus]=useState<Result|null>(null);
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;
    setBusy(true);setStatus(null);
    try{
      const result=await send("login",Object.fromEntries(new FormData(event.currentTarget)));
      setStatus(result);
      if(result.ok)location.reload();
    }finally{setBusy(false);}
  }
  return <form className="form" style={{width:"min(100%, 24rem)"}} onSubmit={submit}>
    {requiresEmail&&<label>Email address<input type="email" name="email" autoComplete="email" maxLength={254} required/></label>}
    <label>Password<input type="password" name="password" autoComplete="current-password" maxLength={400} required/></label>
    <div className="actions"><button className="button" disabled={busy}>{busy?"Signing in…":"Sign in"}</button><Link href="/" className="button outline">Back to website</Link></div>
    {status&&<p className={status.ok?"status":"status error"} role={status.ok?"status":"alert"}>{status.message}</p>}
  </form>;
}
export function AdminSignOut(){
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  return <button type="button" className="text-link" disabled={busy} onClick={async()=>{setBusy(true);try{const result=await send("logout",{});if(result.ok){router.replace("/admin");router.refresh();}}finally{setBusy(false);}}}>{busy?"Signing out…":"Sign out"}</button>;
}
