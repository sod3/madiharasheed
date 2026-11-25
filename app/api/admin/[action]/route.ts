import { all, run } from "@/db";
import { duplicate, invite, remove, save, saveSettings } from "@/lib/admin";
import { mediaMax, upload } from "@/lib/media";
import { sync } from "@/lib/newsletter";
import { admin, clearAdminCookie, createAdminCookie, error, input, InputError, integer, json, limit, read, sameOrigin } from "@/lib/security";

type Route = { params: Promise<{ action: string }> };
const csv = (value: unknown) => {
  const text = String(value ?? "");
  return '"' + (/^\s*[=+@-]/.test(text) ? "'" : "") + text.replace(/"/g, '""') + '"';
};

export async function GET(_request: Request, { params }: Route) {
  if (!(await admin())) return json("Editor access required.", 403);
  if ((await params).action !== "export") return json("Page not found.", 404);
  const keys = ["name", "email", "status", "consent_source", "consent_at", "confirmed_at", "unsubscribed_at"];
  const encoder = new TextEncoder();
  let cursor = 0;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(keys.map(csv).join(",") + "\r\n"));
    },
    async pull(controller) {
      const rows = await all("SELECT id," + keys.join(",") + " FROM newsletter_subscribers WHERE id>? ORDER BY id LIMIT 500", cursor);
      if (rows.length) {
        cursor = rows.at(-1)!.id;
        controller.enqueue(encoder.encode(rows.map((row) => keys.map((key) => csv(row[key])).join(",")).join("\r\n") + "\r\n"));
      }
      if (rows.length < 500) controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="newsletter-subscribers.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}

export async function POST(request: Request, { params }: Route) {
  try {
    const { action } = await params;
    if (action === "login") {
      sameOrigin(request);
      await limit(request, "admin_login", 8);
      const data = await read(request);
      const userEmail = input(data, "email", 254, false, "email");
      const password = input(data, "password", 400, true, "password");
      const cookie = await createAdminCookie(userEmail, password);
      return Response.json(
        { message: "Signed in." },
        { headers: { "Set-Cookie": cookie, "Cache-Control": "no-store" } },
      );
    }
    if (action === "logout") {
      sameOrigin(request);
      return Response.json(
        { message: "Signed out." },
        { headers: { "Set-Cookie": clearAdminCookie(), "Cache-Control": "no-store" } },
      );
    }

    const user = await admin();
    if (!user) return json("Editor access required.", 403);
    sameOrigin(request);
    if (action === "upload") {
      if (Number(request.headers.get("content-length") ?? 0) > mediaMax + 50_000) {
        throw new InputError("Choose a file under 15 MB.", 413);
      }
      const data = await request.formData(),
        file = data.get("file");
      if (!(file instanceof File)) throw new InputError("Choose a file to upload.");
      return Response.json({ message: "File uploaded.", url: await upload(file, data.get("restricted") === "1") }, { status: 201 });
    }
    const data = await read(request),
      id = integer(data.id);
    await run(
      "INSERT INTO admin_users(user_id,email,last_seen_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET email=excluded.email,last_seen_at=excluded.last_seen_at",
      user.userId,
      user.email,
      new Date().toISOString(),
    );
    switch (action) {
      case "settings":
        await saveSettings(data);
        return json("Settings saved.");
      case "save":
        return Response.json({ message: "Saved.", id: await save(input(data, "module", 50, true), id, data) });
      case "delete":
        await remove(input(data, "module", 50, true), id);
        return json("Deleted.");
      case "duplicate":
        return Response.json({ message: "A draft copy has been created.", id: await duplicate(id) });
      case "invite":
        return Response.json({ message: "Invitation created. It expires in 30 days.", url: await invite(id) });
      case "sync":
        if (!process.env.RESEND_SEGMENT_ID || !process.env.RESEND_API_KEY) {
          return json("Campaign delivery is not configured yet.", 503);
        }
        return (await sync(id)) ? json("Subscriber synchronized.") : json("The provider could not be synchronized.", 502);
      default:
        return json("Page not found.", 404);
    }
  } catch (err) {
    return error(err);
  }
}
