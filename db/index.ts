import { env } from "cloudflare:workers";

export function db() {
  if (!env.DB) throw new Error("Database binding unavailable");
  return env.DB;
}
export function stmt(query:string,...values:unknown[]) {
  const result=db().prepare(query);
  return values.length ? result.bind(...values) : result;
}
export async function all<T=Row>(query:string,...values:unknown[]) {
  return (await stmt(query,...values).all<T>()).results;
}
export function one<T=Row>(query:string,...values:unknown[]) {return stmt(query,...values).first<T>();}
export function run(query:string,...values:unknown[]) {return stmt(query,...values).run();}
export type Row = Record<string,string|number|null|boolean|undefined> & {id:number};
