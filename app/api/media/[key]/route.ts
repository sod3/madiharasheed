import {media} from "@/lib/media";
export async function GET(request:Request,{params}:{params:Promise<{key:string}>}) {return media(request,(await params).key);}
