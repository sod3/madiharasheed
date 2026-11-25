import { env } from "cloudflare:workers";
import { InputError } from "./security";

const read=(bytes:Uint8Array,start:number,end:number)=>new TextDecoder().decode(bytes.slice(start,end));
const mediaTypes:Record<string,{ext:string;test:(bytes:Uint8Array)=>boolean}>={
  "image/jpeg":{ext:"jpg",test:b=>b[0]===255&&b[1]===216&&b[2]===255},
  "image/png":{ext:"png",test:b=>b[0]===137&&read(b,1,4)==="PNG"},
  "image/webp":{ext:"webp",test:b=>read(b,0,4)==="RIFF"&&read(b,8,12)==="WEBP"},
  "image/avif":{ext:"avif",test:b=>["ftypavif","ftypavis"].includes(read(b,4,12))},
  "video/mp4":{ext:"mp4",test:b=>read(b,4,8)==="ftyp"},
  "video/webm":{ext:"webm",test:b=>b[0]===26&&b[1]===69&&b[2]===223&&b[3]===163},
  "application/pdf":{ext:"pdf",test:b=>read(b,0,5)==="%PDF-"},
};
export const mediaMax=15*1024*1024;
export async function upload(file:File,restricted:boolean) {
  if (!env.BUCKET) throw new InputError("Media storage is unavailable.",503);
  if (!file.size || file.size>mediaMax) throw new InputError("Choose a file under 15 MB.",413);
  const type=Object.hasOwn(mediaTypes,file.type)?mediaTypes[file.type]:undefined;
  if (!type?.test(new Uint8Array(await file.slice(0,32).arrayBuffer()))) throw new InputError("Choose a valid JPEG, PNG, WebP, AVIF, MP4, WebM, or PDF file.");
  const key=(restricted?"resource-":"asset-")+crypto.randomUUID()+"."+type.ext;
  await env.BUCKET.put(key,file.stream(),{httpMetadata:{contentType:file.type}});
  return "/api/media/"+key;
}
export async function media(request:Request,key:string,restricted=false,download=false) {
  if (!/^(?:asset|resource)-[a-f0-9-]{36}\.(jpg|png|webp|avif|mp4|webm|pdf)$/.test(key) || (!restricted && key.startsWith("resource-")) || !env.BUCKET) return new Response("File not found",{status:404});
  const range=request.headers.get("range");
  const object=await env.BUCKET.get(key,range ? {range:request.headers}:{});
  if (!object) return new Response("File not found",{status:404});
  const headers=new Headers({"X-Content-Type-Options":"nosniff","ETag":object.httpEtag,"Accept-Ranges":"bytes","Cache-Control":restricted?"private, no-store":"public, max-age=31536000, immutable"});
  object.writeHttpMetadata(headers);
  const segment=object.range;
  const length=segment && "length" in segment ? segment.length:undefined;
  const offset=segment && "offset" in segment ? segment.offset:undefined;
  if (range && length!==undefined && offset!==undefined) headers.set("Content-Range","bytes "+offset+"-"+(offset+length-1)+"/"+object.size);
  headers.set("Content-Length",String(length??object.size));
  if (download || key.endsWith(".pdf")) headers.set("Content-Disposition",'attachment; filename="'+key+'"');
  return new Response(object.body,{status:headers.has("Content-Range")?206:200,headers});
}
