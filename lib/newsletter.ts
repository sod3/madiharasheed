import { col, findOne, isDuplicateError, nextId, type Row } from "@/db";
import { absolute, now, origin } from "./content";
import { InputError, matches, sign, token } from "./security";

type Mode = "confirm" | "unsubscribe" | "access";
const threeDays = 3 * 86400_000;
const week = 7 * 86400_000;
const cookie = "writing_room_reader";
const secureCookie = () => (origin().startsWith("https://") ? "; Secure" : "");

export const deliveryConfigured = () => !!process.env.RESEND_API_KEY && !!process.env.NEWSLETTER_FROM;

async function resend(path: string, data: Record<string, unknown>, method = "POST", idempotency = "") {
  if (!process.env.RESEND_API_KEY) return false;
  try {
    const result = await fetch("https://api.resend.com" + path, {
      method,
      signal: AbortSignal.timeout(8000),
      headers: {
        Authorization: "Bearer " + process.env.RESEND_API_KEY,
        "Content-Type": "application/json",
        ...(idempotency ? { "Idempotency-Key": idempotency } : {}),
      },
      body: JSON.stringify(data),
    });
    return result.ok;
  } catch {
    return false;
  }
}

async function signed(row: Row, mode: Mode) {
  return row.id + "." + (await sign(mode + "|" + row.id + "|" + row.token_salt));
}

async function link(row: Row, mode: Mode, resource = "") {
  const params = new URLSearchParams({ action: mode, t: await signed(row, mode) });
  if (resource) params.set("resource", resource);
  return absolute("/newsletter?" + params.toString());
}

async function send(row: Row, subject: string, message: string, requestId: string) {
  return deliveryConfigured() && resend("/emails", { from: process.env.NEWSLETTER_FROM, to: [row.email], subject, text: message }, "POST", requestId);
}

export async function subscribe(name: string, email: string, resource: string) {
  if (!deliveryConfigured()) throw new InputError("Newsletter sign-ups are temporarily unavailable.", 503);
  const source = resource ? "resource:" + resource : "newsletter";
  const subsCol = await col<Row>("newsletter_subscribers");
  let row = await findOne("newsletter_subscribers", { email });
  if (!row) {
    const stamp = now();
    const doc: Row = {
      id: await nextId("newsletter_subscribers"),
      name,
      email,
      status: "pending",
      consent_source: source,
      consent_at: stamp,
      token_salt: token(),
      confirmed_at: null,
      unsubscribed_at: null,
      sent_at: null,
      sync_status: "none",
      created_at: stamp,
    };
    try {
      await subsCol.insertOne(doc);
      row = doc;
    } catch (err) {
      if (!isDuplicateError(err)) throw err;
      row = await findOne("newsletter_subscribers", { email });
    }
  }
  if (!row) throw new InputError("The request could not be stored. Try again.", 503);
  if (row.status === "confirmed" && !resource) return "If this address is eligible, you’ll receive a confirmation email.";
  if (row.status === "unsubscribed" || (row.status === "pending" && Date.now() - Date.parse(String(row.consent_at)) > threeDays)) {
    const renewed = await subsCol.findOneAndUpdate(
      { id: row.id, token_salt: row.token_salt },
      { $set: { status: "pending", name, consent_at: now(), consent_source: source, token_salt: token(), sent_at: null, sync_status: "none" } },
      { returnDocument: "after", projection: { _id: 0 } },
    );
    if (!renewed) return "Check your inbox for the link to continue.";
    row = renewed as Row;
  }
  const stamp = now();
  const cutoff = new Date(Date.now() - 60000).toISOString();
  const reserved = await subsCol.findOneAndUpdate(
    {
      id: row.id,
      token_salt: row.token_salt,
      $or: [{ sent_at: null }, { sent_at: { $exists: false } }, { sent_at: { $lt: cutoff } }],
    },
    { $set: { sent_at: stamp } },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  if (!reserved) return "Check your inbox for the link to continue.";
  const mode = row.status === "confirmed" ? "access" : "confirm";
  const sent = await send(
    row,
    mode === "confirm" ? "Confirm your newsletter subscription" : "Your reading resource",
    "Continue with this link:\n\n" + (await link(row, mode, resource)) + "\n\nIf you did not request this email, you can ignore it.",
    mode + "/" + row.id + "/" + stamp,
  );
  if (!sent) {
    await subsCol.updateOne({ id: row.id, sent_at: stamp }, { $set: { sent_at: null } });
    throw new InputError("Your request was saved. The confirmation email could not be sent. Try again shortly.", 503);
  }
  return "Check your inbox for the link to continue.";
}

export async function sync(id: number) {
  if (!process.env.RESEND_SEGMENT_ID || !process.env.RESEND_API_KEY) return false;
  const subsCol = await col("newsletter_subscribers");
  for (let attempt = 0; attempt < 3; attempt++) {
    const row = await findOne("newsletter_subscribers", { id });
    if (!row) return false;
    const path = "/contacts/" + encodeURIComponent(String(row.email));
    const sent =
      row.status !== "confirmed"
        ? await resend(path, { unsubscribed: true }, "PATCH")
        : (await resend("/contacts", { email: row.email, first_name: row.name, unsubscribed: false, segments: [{ id: process.env.RESEND_SEGMENT_ID }] })) ||
          ((await resend(path, { unsubscribed: false, first_name: row.name }, "PATCH")) &&
            (await resend(path + "/segments/" + process.env.RESEND_SEGMENT_ID, {})));
    const saved = await subsCol.updateOne(
      { id, status: row.status, token_salt: row.token_salt },
      { $set: { sync_status: sent ? "synced" : "retry" } },
    );
    if (saved.matchedCount) return sent;
  }
  await subsCol.updateOne({ id }, { $set: { sync_status: "retry" } });
  return false;
}

export async function subscriberAction(mode: Mode, code: string) {
  const parts = /^(\d{1,12})\.[a-f0-9]{64}$/.exec(code);
  if (!parts) throw new InputError("This subscription link is invalid.");
  const id = Number(parts[1]);
  const subsCol = await col<Row>("newsletter_subscribers");
  const row = await findOne("newsletter_subscribers", { id });
  if (!row || !matches(code, await signed(row, mode))) throw new InputError("This subscription link is invalid or has been replaced.");
  if (mode === "unsubscribe") {
    await subsCol.updateOne(
      { id, token_salt: row.token_salt },
      { $set: { status: "unsubscribed", unsubscribed_at: row.unsubscribed_at ?? now() } },
    );
    await sync(id);
    return {
      message: "You’ve been unsubscribed.",
      cookie: cookie + "=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax" + secureCookie(),
      confirmed: false,
    };
  }
  if (row.status === "unsubscribed" || (mode === "access" && (row.status !== "confirmed" || !row.sent_at || Date.now() - Date.parse(String(row.sent_at)) > week))) {
    throw new InputError("Request a fresh link from the newsletter or resource page.");
  }
  if (mode === "confirm" && row.status === "pending" && Date.now() - Date.parse(String(row.consent_at)) > threeDays) {
    throw new InputError("The link has expired. Submit the newsletter form again.");
  }
  const confirmed =
    mode === "confirm"
      ? ((await subsCol.findOneAndUpdate(
          { id, status: "pending", token_salt: row.token_salt },
          { $set: { status: "confirmed", confirmed_at: now(), unsubscribed_at: null } },
          { returnDocument: "after", projection: { _id: 0 } },
        )) as Row | null)
      : null;
  if (confirmed) {
    await sync(id);
    await send(
      confirmed,
      "Welcome to Madiha Rasheed",
      "You’re subscribed. Thank you for joining.\n\nUnsubscribe at any time:\n" + (await link(confirmed, "unsubscribe")),
      "welcome/" + id + "/" + confirmed.token_salt,
    );
  }
  const current = await findOne("newsletter_subscribers", { id, status: "confirmed", token_salt: row.token_salt });
  if (!current) throw new InputError("This link has been replaced. Request a fresh link.");
  const payload = id + "." + Math.floor((Date.now() + week) / 1000);
  const proof = payload + "." + (await sign("reader|" + payload + "|" + row.token_salt));
  return {
    message: mode === "access" ? "Your resource is ready." : "Your subscription is confirmed.",
    cookie: cookie + "=" + proof + "; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax" + secureCookie(),
    confirmed: !!confirmed,
  };
}

export async function hasSubscription(request: Request) {
  const value =
    request.headers
      .get("cookie")
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(cookie + "="))
      ?.slice(cookie.length + 1) ?? "";
  const parts = /^(\d{1,12})\.(\d+)\.([a-f0-9]{64})$/.exec(value);
  if (!parts || Number(parts[2]) < Date.now() / 1000) return false;
  const row = await findOne<{ token_salt: string }>("newsletter_subscribers", { id: Number(parts[1]), status: "confirmed" });
  return !!row && matches(parts[3], await sign("reader|" + parts[1] + "." + parts[2] + "|" + row.token_salt));
}

export async function webhook(request: Request) {
  if (!process.env.RESEND_WEBHOOK_SECRET) return new Response(null, { status: 404 });
  const id = request.headers.get("svix-id") ?? "";
  const time = request.headers.get("svix-timestamp") ?? "";
  const signatures = request.headers.get("svix-signature") ?? "";
  if (!id || !/^\d{10}$/.test(time) || Math.abs(Date.now() / 1000 - Number(time)) > 300) return new Response(null, { status: 401 });
  const raw = await request.text();
  if (raw.length > 100_000) return new Response(null, { status: 413 });
  const bytes = Uint8Array.from(atob(process.env.RESEND_WEBHOOK_SECRET.replace(/^whsec_/, "")), (char) => char.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", bytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = "v1," + btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(id + "." + time + "." + raw)))));
  if (!signatures.split(" ").some((value) => matches(value, signature))) return new Response(null, { status: 401 });
  const event = JSON.parse(raw);
  if (event.type === "contact.updated" && event.data?.unsubscribed === true && typeof event.data.email === "string") {
    const subsCol = await col("newsletter_subscribers");
    await subsCol.updateMany(
      { email: event.data.email.toLowerCase(), status: "confirmed", confirmed_at: { $lte: event.created_at ?? now() } },
      { $set: { status: "unsubscribed", unsubscribed_at: now(), sync_status: "synced" } },
    );
  }
  return new Response(null, { status: 204 });
}
