import { BlobAccessError, get, put } from "@vercel/blob";
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

function blobConfigured() {
  return !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_OIDC_TOKEN);
}

function preferredAccess(): "public" | "private" {
  return process.env.BLOB_ACCESS === "private" ? "private" : "public";
}

function oppositeAccess(access: "public" | "private"): "public" | "private" {
  return access === "private" ? "public" : "private";
}

async function putBlob(key: string, file: File) {
  const access = preferredAccess();
  try {
    await put(key, file, { access, addRandomSuffix: false, contentType: file.type });
  } catch (err) {
    if (err instanceof BlobAccessError || (err instanceof Error && /access|public|private/i.test(err.message))) {
      await put(key, file, { access: oppositeAccess(access), addRandomSuffix: false, contentType: file.type });
      return;
    }
    throw err;
  }
}

async function getBlob(key: string, range: string | null) {
  const access = preferredAccess();
  const headers = range ? { Range: range } : undefined;
  try {
    return await get(key, { access, headers });
  } catch (err) {
    if (err instanceof BlobAccessError || (err instanceof Error && /access|public|private/i.test(err.message))) {
      return await get(key, { access: oppositeAccess(access), headers });
    }
    throw err;
  }
}

export async function upload(file:File,restricted:boolean) {
  if (!blobConfigured()) throw new InputError("Media storage is unavailable. Configure BLOB_READ_WRITE_TOKEN.",503);
  if (!file.size || file.size>mediaMax) throw new InputError("Choose a file under 15 MB.",413);
  const type=Object.hasOwn(mediaTypes,file.type)?mediaTypes[file.type]:undefined;
  if (!type?.test(new Uint8Array(await file.slice(0,32).arrayBuffer()))) throw new InputError("Choose a valid JPEG, PNG, WebP, AVIF, MP4, WebM, or PDF file.");
  const key=(restricted?"resource-":"asset-")+crypto.randomUUID()+"."+type.ext;
  await putBlob(key, file);
  return "/api/media/"+key;
}
export async function media(request:Request,key:string,restricted=false,download=false) {
  if (!/^(?:asset|resource)-[a-f0-9-]{36}\.(jpg|png|webp|avif|mp4|webm|pdf)$/.test(key) || (!restricted && key.startsWith("resource-")) || !blobConfigured()) return new Response("File not found",{status:404});
  const range=request.headers.get("range");
  const result=await getBlob(key, range);
  if (!result) return new Response("File not found",{status:404});
  const headers=new Headers({
    "X-Content-Type-Options":"nosniff",
    "ETag":result.blob.etag,
    "Accept-Ranges":"bytes",
    "Cache-Control":restricted?"private, no-store":"public, max-age=31536000, immutable",
  });
  if (result.blob.contentType) headers.set("Content-Type",result.blob.contentType);
  if (result.statusCode===304) return new Response(null,{status:304,headers});
  const contentRange=result.headers.get("content-range");
  const contentLength=result.headers.get("content-length")??String(result.blob.size);
  if (contentRange) headers.set("Content-Range",contentRange);
  headers.set("Content-Length",contentLength);
  if (download || key.endsWith(".pdf")) headers.set("Content-Disposition",'attachment; filename="'+key+'"');
  return new Response(result.stream,{status:contentRange?206:200,headers});
}
