import { cookies } from "next/headers";
import { col, isDuplicateError } from "@/db";
import { origin } from "./content";

export class InputError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

export type AdminUser = {
  userId: string;
  email: string;
  displayName: string;
};

const ADMIN_COOKIE = "writing_room_admin";
const ADMIN_SESSION_SECONDS = 7 * 86400;

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function adminEmailRequired(): boolean {
  return adminEmails().length > 0;
}

export function adminConfigured(): boolean {
  return !!(process.env.ADMIN_PASSWORD && process.env.RATE_SECRET && process.env.RATE_SECRET.length >= 32);
}

function cookieSecure(): string {
  return origin().startsWith("https://") ? "; Secure" : "";
}

export async function admin(): Promise<AdminUser | null> {
  if (!process.env.RATE_SECRET || process.env.RATE_SECRET.length < 32) return null;
  const store = await cookies();
  const raw = store.get(ADMIN_COOKIE)?.value ?? "";
  const parts = /^([A-Za-z0-9_-]+)\.(\d+)\.([a-f0-9]{64})$/.exec(raw);
  if (!parts || Number(parts[2]) < Date.now() / 1000) return null;
  let userEmail = "";
  try {
    userEmail = Buffer.from(parts[1], "base64url").toString("utf8");
  } catch {
    return null;
  }
  if (!userEmail) return null;
  const expected = await sign("admin|" + userEmail + "|" + parts[2]);
  if (!matches(parts[3], expected)) return null;
  const allowed = adminEmails();
  if (allowed.length && !allowed.includes(userEmail.toLowerCase())) return null;
  return { userId: "admin:" + userEmail.toLowerCase(), email: userEmail, displayName: userEmail };
}

export async function createAdminCookie(emailInput: string, passwordInput: string): Promise<string> {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) throw new InputError("Admin login is not configured. Set ADMIN_PASSWORD.", 503);
  if (!process.env.RATE_SECRET || process.env.RATE_SECRET.length < 32) {
    throw new InputError("Server security is being configured. Set RATE_SECRET (32+ characters).", 503);
  }
  const allowed = adminEmails();
  const normalizedEmail = emailInput.trim().toLowerCase();
  const validPassword = matches(await hash(passwordInput), await hash(configuredPassword));
  const validEmail = !allowed.length || (!!normalizedEmail && allowed.includes(normalizedEmail));
  if (!validPassword || !validEmail) throw new InputError("Invalid credentials.", 401);
  const userEmail = normalizedEmail || "admin";
  const expires = Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS;
  const signature = await sign("admin|" + userEmail + "|" + expires);
  const value = Buffer.from(userEmail, "utf8").toString("base64url") + "." + expires + "." + signature;
  return `${ADMIN_COOKIE}=${value}; Path=/; Max-Age=${ADMIN_SESSION_SECONDS}; HttpOnly; SameSite=Lax${cookieSecure()}`;
}

export function clearAdminCookie(): string {
  return `${ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${cookieSecure()}`;
}

export const json = (message: string, status = 200) => Response.json({ message }, { status });

export function error(error: unknown) {
  if (error instanceof InputError) return json(error.message, error.status);
  if (isDuplicateError(error)) return json("A record with these details already exists.", 409);
  const message = error instanceof Error ? error.message : "";
  if (/UNIQUE constraint failed/i.test(message)) return json("A record with these details already exists.", 409);
  if (/FOREIGN KEY constraint failed/i.test(message)) return json("Please choose an existing related record.", 400);
  console.error("Request failed", error instanceof Error ? error.name : "Unknown");
  return json("The request could not be completed. Please try again.", 500);
}

export function sameOrigin(request: Request) {
  const source = request.headers.get("origin");
  if (!source || ![new URL(request.url).origin, origin()].includes(source)) {
    throw new InputError("Submit this form from the website.", 403);
  }
}

export async function read(request: Request) {
  sameOrigin(request);
  if (!request.headers.get("content-type")?.includes("application/json")) throw new InputError("This form requires JavaScript.");
  if (Number(request.headers.get("content-length") ?? 0) > 150_000) throw new InputError("This form is too large.", 413);
  const source = await request.text();
  if (source.length > 150_000) throw new InputError("This form is too large.", 413);
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch {
    throw new InputError("This form could not be read.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new InputError("This form could not be read.");
  return value as Record<string, unknown>;
}

export function input(data: Record<string, unknown>, key: string, max = 400, required = false, label = key) {
  const value = data[key];
  if (value != null && typeof value !== "string") throw new InputError("Enter a valid " + label + ".");
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (required && !trimmed) throw new InputError("Enter " + label + ".");
  if (trimmed.length > max) throw new InputError(label + " is too long.");
  return trimmed;
}

export function email(value: string) {
  const clean = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(clean) || clean.length > 254) throw new InputError("Enter a valid email address.");
  return clean;
}

export function integer(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") return 0;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}

const hex = (bytes: Uint8Array) => Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
export function token() {
  return hex(crypto.getRandomValues(new Uint8Array(32)));
}
export async function hash(value: string) {
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}
export async function sign(value: string) {
  const secret = process.env.RATE_SECRET;
  if (!secret || secret.length < 32) throw new InputError("Server security is being configured.", 503);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(value))));
}
export function matches(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
export function visitor(request: Request, scope: string) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "local";
  return sign(scope + "|" + ip + "|" + (request.headers.get("user-agent") ?? "").slice(0, 180));
}
export async function limit(request: Request, action: string, max = 8) {
  const nowSec = Math.floor(Date.now() / 1000);
  const bucket = Math.floor(nowSec / 900);
  const key = await visitor(request, action + "|" + bucket);
  const limitsCol = await col<{ key: string; hits: number; expires_at: number }>("request_limits");
  const row = await limitsCol.findOneAndUpdate(
    { key },
    { $inc: { hits: 1 }, $setOnInsert: { key, expires_at: (bucket + 1) * 900 } },
    { upsert: true, returnDocument: "after" },
  );
  if (row && Number(row.hits) > max) throw new InputError("Too many requests. Try again in a few minutes.", 429);
  if (Math.random() < 0.025) await limitsCol.deleteMany({ expires_at: { $lt: nowSec } });
}
export async function track(request: Request, event: string, path: string) {
  if (!/^\/(?:|[a-z-]{1,35}(?:\/[a-z0-9-]{1,100})?)$/.test(path) || /^\/(admin|api|newsletter)(\/|$)/.test(path)) return;
  const day = new Date().toISOString().slice(0, 10);
  const v = await visitor(request, "metrics|" + day);
  const eventsCol = await col("analytics_events");
  await eventsCol.updateOne(
    { event, path, visitor: v, bucket: day },
    { $setOnInsert: { event, path, visitor: v, bucket: day, created_at: new Date().toISOString() } },
    { upsert: true },
  );
}
