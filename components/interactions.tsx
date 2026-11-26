"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";
import type { Row } from "@/db";
import { date, stars, text } from "@/lib/domain";

export function AsyncForm({
  endpoint,
  label,
  children,
  download = "",
  reset = true,
}: {
  endpoint: string;
  label: string;
  children: React.ReactNode;
  download?: string;
  reset?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ message: string; ok: boolean } | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    setBusy(true);
    setStatus(null);
    try {
      const result = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const body = (await result.json()) as { message?: string };
      setStatus({ message: body.message || "The request could not be completed. Try again.", ok: result.ok && !!body.message });
      if (result.ok && reset) form.reset();
    } catch {
      setStatus({ message: "The request could not be sent. Try again.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form" method="post" action={endpoint} onSubmit={submit} aria-busy={busy}>
      {children}
      <label className="sr" aria-hidden="true">
        Leave empty
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {status?.ok && download ? (
        <a className="button" href={download}>
          Download resource
        </a>
      ) : (
        <button className="button" disabled={busy}>
          {busy ? "Submitting…" : label}
        </button>
      )}
      {status && (
        <p className={status.ok ? "status" : "status error"} role={status.ok ? "status" : "alert"}>
          {status.message}
        </p>
      )}
    </form>
  );
}

export function SubscribeFields({ resource = "" }: { resource?: string }) {
  return (
    <>
      {resource && <input name="resource" type="hidden" value={resource} />}
      <div className="pair">
        <label>
          First name
          <input name="name" placeholder="Your first name" autoComplete="given-name" maxLength={80} required />
        </label>
        <label>
          Email address
          <input type="email" name="email" placeholder="you@example.com" autoComplete="email" maxLength={254} required />
        </label>
      </div>
      <label className="check">
        <input name="consent" type="checkbox" value="yes" required />
        <span>
          I agree to receive updates and newsletters. I can unsubscribe at any time. <Link href="/privacy">Privacy policy</Link>
        </span>
      </label>
    </>
  );
}

export function Registration({
  course,
  batches,
  ready,
  open,
}: {
  course: Row;
  batches: Row[];
  ready: boolean;
  open: boolean;
}) {
  const available = batches.filter((row) => row.availability === "Open");
  const [id, setId] = useState(available[0]?.id ?? 0);
  const batch = available.find((row) => row.id === id);
  const canRegister = open && (!batches.length || !!batch);
  const link = "/api/register?course=" + course.slug + (batch ? "&batch=" + batch.id : "");
  const ask = "/contact?category=Course%20or%20workshop%20registration&subject=" + encodeURIComponent(text(course, "title"));

  return (
    <>
      <aside id="registration" className="registration">
        <p className="eyebrow">{course.availability}</p>
        <h2>{batch?.price || course.price || "Price on request"}</h2>
        <p className="muted">
          {[course.duration, course.format, batch?.starts_on ? "Starts " + date(batch.starts_on) : ""]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {canRegister && available.length > 0 && (
          <label>
            Choose a batch
            <span className="select">
              <select value={id} onChange={(event) => setId(Number(event.target.value))}>
                {available.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.title}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} />
            </span>
          </label>
        )}
        {canRegister && ready ? (
          <a className="button" href={link} target="_blank" rel="noreferrer nofollow">
            <MessageCircle size={18} /> Register via WhatsApp
          </a>
        ) : (
          <a className="button outline" href={ask}>
            {canRegister ? "Request registration details" : "Inquire about upcoming cohort"}
          </a>
        )}
      </aside>
      {canRegister && (
        <div className="mobile-register">
          <a
            className="button"
            href={ready ? (available.length > 1 ? "#registration" : link) : ask}
            target={ready && available.length < 2 ? "_blank" : undefined}
            rel={ready ? "noreferrer nofollow" : undefined}
          >
            {ready
              ? available.length > 1
                ? "Choose a registration batch"
                : "Register via WhatsApp"
              : "Request registration details"}
          </a>
        </div>
      )}
    </>
  );
}

function ReviewCard({ row }: { row: Row }) {
  const [votes, setVotes] = useState(Number(row.helpful ?? 0));
  const [voted, setVoted] = useState(false);
  const [status, setStatus] = useState("");

  async function vote() {
    setVoted(true);
    try {
      const response = await fetch("/api/useful", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
      });
      const result = (await response.json()) as { added?: boolean; message: string };
      setStatus(result.message);
      if (result.added) setVotes((v) => v + 1);
      if (!response.ok) setVoted(false);
    } catch {
      setVoted(false);
      setStatus("The vote could not be saved.");
    }
  }

  return (
    <article className="review">
      <div className="review-person">
        <span className="initials" aria-hidden="true">
          {text(row, "name")
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toUpperCase()}
        </span>
        <div>
          <strong>{row.name}</strong>
          <small>
            <BadgeCheck size={15} /> Verified participant
          </small>
        </div>
        <time dateTime={text(row, "created_at")}>{date(row.created_at)}</time>
      </div>
      <p className="stars" aria-label={row.rating + " out of 5 stars"}>
        {stars(Number(row.rating))}
      </p>
      <h3>{row.title}</h3>
      <p>{row.body}</p>
      {row.reply && (
        <blockquote>
          <strong>Instructor’s reply</strong>
          <p>{row.reply}</p>
        </blockquote>
      )}
      <button type="button" className="text-link" onClick={vote} disabled={voted}>
        <ThumbsUp size={15} /> Helpful ({votes})
      </button>
      <span className="status" role="status">
        {status}
      </span>
    </article>
  );
}

export function Reviews({
  course,
  items,
  distribution,
  invite,
  allow,
}: {
  course: Row;
  items: Row[];
  distribution: Row[];
  invite: string;
  allow: boolean;
}) {
  const count = Number(course.review_count ?? 0);
  const average = Number(course.average ?? 0);
  const [rows, setRows] = useState(items);
  const [sort, setSort] = useState("newest");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(!!invite);
  const [status, setStatus] = useState("");

  async function load(order: string, append = false) {
    if (busy) return;
    setBusy(true);
    setStatus("");
    try {
      const query = new URLSearchParams({
        course: text(course, "slug"),
        sort: order,
        offset: String(append ? rows.length : 0),
      });
      const response = await fetch("/api/reviews?" + query.toString());
      if (!response.ok) throw new Error("Request failed");
      const data = (await response.json()) as { items: Row[] };
      setRows(append ? [...rows, ...data.items] : data.items);
      setSort(order);
    } catch {
      setStatus("Reviews could not be loaded. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="reviews" className="reviews">
      <div className="section-head">
        <div>
          <h2>Participant reviews</h2>
          <p>Authentic feedback from verified course participants.</p>
        </div>
        {allow && (
          <button
            type="button"
            className="button outline"
            aria-expanded={show}
            aria-controls="write-review"
            onClick={() => setShow(!show)}
          >
            Write a Review
          </button>
        )}
      </div>
      {count ? (
        <>
          <div className="ratings">
            <div>
              <strong>{average.toFixed(1)}</strong>
              <div className="stars" aria-label={average.toFixed(1) + " out of 5 stars"}>
                {stars(average)}
              </div>
              <p>
                {count} verified {count === 1 ? "review" : "reviews"}
              </p>
            </div>
            <div className="rating-bars">
              {[5, 4, 3, 2, 1].map((rating) => {
                const n = Number(distribution.find((row) => row.rating === rating)?.count ?? 0);
                return (
                  <label key={rating}>
                    <span>{rating} star</span>
                    <meter aria-label={rating + " star reviews"} min={0} max={count} value={n} />
                    <span>{n}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <label className="sort">
            Sort reviews
            <select value={sort} onChange={(event) => load(event.target.value)} disabled={busy}>
              <option value="newest">Newest</option>
              <option value="highest">Highest rated</option>
              <option value="helpful">Most helpful</option>
            </select>
          </label>
          {rows.map((row) => (
            <ReviewCard key={row.id} row={row} />
          ))}
          {rows.length < count && (
            <button type="button" className="button outline" disabled={busy} onClick={() => load(sort, true)}>
              {busy ? "Loading…" : "Load more reviews"}
            </button>
          )}
          <p className="status" role="status">
            {status}
          </p>
        </>
      ) : (
        <div className="empty">
          <h3>No verified reviews yet</h3>
          <p>
            {allow
              ? "Completed this course? Use your personal review invitation to share verified feedback."
              : "Verified reviews will appear once a cohort concludes and participants share feedback."}
          </p>
        </div>
      )}
      {allow && (
        <div id="write-review" className="panel" hidden={!show}>
          <h3>Share your experience</h3>
          <p>Use your enrollment email and review invitation.</p>
          <AsyncForm endpoint="/api/review" label="Submit review">
            <input name="course" type="hidden" value={text(course, "slug")} />
            {invite ? (
              <input name="invite" type="hidden" value={invite} />
            ) : (
              <label>
                Invitation code
                <input name="invite" required maxLength={64} autoComplete="off" />
              </label>
            )}
            <div className="pair">
              <label>
                Name
                <input name="name" autoComplete="name" required />
              </label>
              <label>
                Email
                <input type="email" name="email" autoComplete="email" required />
              </label>
            </div>
            <fieldset className="rating-input">
              <legend>Your rating</legend>
              {[1, 2, 3, 4, 5].map((number) => (
                <label key={number}>
                  <input type="radio" name="rating" required value={number} />
                  {number} {number === 1 ? "star" : "stars"}
                </label>
              ))}
            </fieldset>
            <label>
              Review title
              <input name="title" maxLength={140} required />
            </label>
            <label>
              Feedback
              <textarea name="body" rows={5} maxLength={4000} required />
            </label>
          </AsyncForm>
        </div>
      )}
    </section>
  );
}

export function ReadTools({ url, title }: { url: string; title: string }) {
  const progress = useRef<HTMLSpanElement>(null);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    const article = document.getElementById("reading-body");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!article || !progress.current) return;
      const { top, height } = article.getBoundingClientRect();
      const viewport = window.innerHeight;
      const position = Math.min(1, Math.max(0, (viewport * .35 - top) / Math.max(1, height - viewport * .25)));
      progress.current.style.transform = "scaleX(" + position + ")";
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [url]);

  return (
    <>
      <div className="progress" aria-hidden="true">
        <span ref={progress} style={{ transform: "scaleX(0)" }} />
      </div>
      <div className="actions share">
        <button
          type="button"
          className="text-link"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopyStatus("Link copied.");
            } catch {
              setCopyStatus("The link could not be copied.");
            }
          }}
        >
          Copy link
        </button>
        <a className="text-link" target="_blank" rel="noreferrer" href={"https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url)}>Share on LinkedIn</a>
        <a className="text-link" target="_blank" rel="noreferrer" href={"https://wa.me/?text=" + encodeURIComponent(title + " " + url)}>
          Share on WhatsApp
        </a>
        {copyStatus && <span role="status" className="meta">{copyStatus}</span>}
      </div>
    </>
  );
}
