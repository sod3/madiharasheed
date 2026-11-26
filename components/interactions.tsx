"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Menu,
  MessageCircle,
  Minimize2,
  ThumbsUp,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { Row } from "@/db";
import { categories, date, href, stars, text } from "@/lib/domain";

export function Brand({ title }: { title: string }) {
  return (
    <Link href="/" className="brand">
      <span className="brand-mark" aria-hidden="true">MR</span>
      {title}
    </Link>
  );
}

export function Header({
  title,
  links,
  current,
}: {
  title: string;
  links: { label: string; href: string }[];
  current: string;
}) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth > 880) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const navigation = links.map((link) => (
    <a
      key={link.href}
      href={link.href}
      aria-current={link.href === current ? "page" : undefined}
      onClick={() => setOpen(false)}
    >
      {link.label}
    </a>
  ));

  return (
    <header className="header">
      <div className="shell header-row">
        <Brand title={title} />
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation}
        </nav>
        <Link href="/contact" className="button small header-contact">
          Get in Touch
        </Link>
        <button
          ref={button}
          type="button"
          className="icon menu"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <div className="mobile-nav" id="mobile-navigation" hidden={!open} ref={menu}>
        <nav aria-label="Mobile navigation">{navigation}</nav>
        <Link href="/contact" className="button" onClick={() => setOpen(false)}>
          Get in Touch
        </Link>
      </div>
    </header>
  );
}

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
      const body = (await result.json()) as { message: string };
      setStatus({ message: body.message, ok: result.ok });
      if (result.ok && reset) form.reset();
    } catch {
      setStatus({ message: "The request could not be sent. Try again.", ok: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form" method="post" action={endpoint} onSubmit={submit}>
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

export function Gallery({
  items,
  filterable = false,
}: {
  items: Row[];
  filterable?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const [activeCategory, setActiveCategory] = useState("");
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const cats = filterable ? categories(items) : [];
  const filtered = activeCategory ? items.filter((item) => text(item, "category") === activeCategory) : items;

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  if (!items.length) return null;

  const safeIndex = filtered.length ? Math.min(index, filtered.length - 1) : 0;
  const current = filtered[safeIndex];

  const step = (direction: number) => {
    if (!filtered.length) return;
    setZoomed(false);
    setIndex((i) => (i + direction + filtered.length) % filtered.length);
  };

  async function toggleFullscreen() {
    const el = dialog.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setFullscreen(false);
      } else if (el.requestFullscreen) {
        await el.requestFullscreen();
        setFullscreen(true);
      } else {
        setFullscreen((prev) => !prev);
      }
    } catch {
      setFullscreen((prev) => !prev);
    }
  }

  function closeModal() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    }
    setZoomed(false);
    setFullscreen(false);
    dialog.current?.close();
  }

  return (
    <>
      {filterable && cats.length > 1 && (
        <div className="categories" role="group" aria-label="Filter certificates by category">
          {["", ...cats].map((cat) => (
            <button
              key={cat || "all"}
              type="button"
              aria-pressed={activeCategory === cat}
              onClick={() => {
                setActiveCategory(cat);
                setIndex(0);
              }}
            >
              {cat || "All"}
            </button>
          ))}
        </div>
      )}

      <div className="cert-grid">
        {filtered.map((item, idx) => (
          <figure className="cert-card" key={item.id}>
            <button
              className="cert-thumb"
              aria-label={`View ${text(item, "title")} full screen`}
              type="button"
              onClick={(event) => {
                trigger.current = event.currentTarget;
                setIndex(idx);
                setZoomed(false);
                dialog.current?.showModal();
              }}
            >
              {href(item.image) ? (
                <img src={href(item.image)} alt={text(item, "alt") || text(item, "title")} loading="lazy" decoding="async" />
              ) : (
                <span className="placeholder">Play video</span>
              )}
              <span className="cert-zoom-chip" aria-hidden="true">
                <Maximize2 size={12} /> Full screen
              </span>
            </button>
            <figcaption className="cert-caption">
              <p className="eyebrow">
                {[text(item, "category"), text(item, "date_label")].filter(Boolean).join(" · ") || "Verified Record"}
              </p>
              <h3>{item.title}</h3>
              {item.issuer && <p className="meta">{item.issuer}</p>}
              {item.body && <p>{item.body}</p>}
            </figcaption>
          </figure>
        ))}
      </div>

      {current && (
        <dialog
          ref={dialog}
          className="lightbox-dialog"
          data-fullscreen={fullscreen ? "true" : "false"}
          data-zoom={zoomed ? "true" : "false"}
          aria-label={text(current, "title")}
          onClose={() => {
            setZoomed(false);
            setFullscreen(false);
            trigger.current?.focus();
          }}
          onClick={(event) => {
            if (event.target === dialog.current) closeModal();
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") step(-1);
            if (event.key === "ArrowRight") step(1);
          }}
        >
          <div className="lightbox-toolbar">
            {!current.video && (
              <button
                className="icon"
                type="button"
                aria-label={zoomed ? "Reset zoom" : "Zoom in"}
                onClick={() => setZoomed((z) => !z)}
              >
                {zoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
              </button>
            )}
            <button
              className="icon"
              type="button"
              aria-label={fullscreen ? "Exit full screen" : "Enter full screen"}
              onClick={toggleFullscreen}
            >
              {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button className="icon" aria-label="Close viewer" type="button" onClick={closeModal}>
              <X size={18} />
            </button>
          </div>

          <div className="lightbox-stage">
            {current.video ? (
              <video
                key={text(current, "video")}
                controls
                playsInline
                preload="metadata"
                src={href(current.video)}
                poster={href(current.image)}
              />
            ) : (
              <img src={href(current.image)} alt={text(current, "alt") || text(current, "title")} />
            )}
          </div>

          <div className="lightbox-caption">
            <div>
              <strong>{current.title}</strong>
              <p>
                {[text(current, "issuer"), text(current, "date_label"), text(current, "body")]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            {filtered.length > 1 && (
              <div className="actions">
                <button type="button" className="text-link" onClick={() => step(-1)}>
                  <ChevronLeft size={16} /> Previous
                </button>
                <span className="meta" style={{ color: "#d8c8ec" }}>
                  {safeIndex + 1} / {filtered.length}
                </span>
                <button type="button" className="text-link" onClick={() => step(1)}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </dialog>
      )}
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
  const [position, setPosition] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const update = () => {
      const node = document.getElementById("reading-body");
      if (!node) return;
      const rect = node.getBoundingClientRect();
      setPosition(Math.min(1, Math.max(0, (innerHeight / 3 - rect.top) / Math.max(1, rect.height - innerHeight / 3))));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <>
      <div className="progress" aria-hidden="true">
        <span style={{ transform: "scaleX(" + position + ")" }} />
      </div>
      <div className="actions share">
        <button
          type="button"
          className="text-link"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Link copied" : "Copy link"}
        </button>
        <a className="text-link" target="_blank" rel="noreferrer" href={"https://wa.me/?text=" + encodeURIComponent(title + " " + url)}>
          Share on WhatsApp
        </a>
      </div>
    </>
  );
}

export function Metrics({ id }: { id: string }) {
  useEffect(() => {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location.pathname }),
      keepalive: true,
    }).catch(() => undefined);
    const params = new URLSearchParams(location.search);
    if (!/^G-[A-Z0-9]+$/.test(id) || ["invite", "preview", "t"].some((key) => params.has(key))) return;
    try {
      if (localStorage.getItem("writing-room-analytics") !== "yes") return;
    } catch {
      return;
    }
    const global = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
    global.dataLayer ??= [];
    global.gtag = function (...args: unknown[]) {
      global.dataLayer?.push(args);
    };
    global.gtag("js", new Date());
    global.gtag("config", id, { page_location: location.origin + location.pathname, allow_google_signals: false });
    const script = document.createElement("script");
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
    script.async = true;
    script.referrerPolicy = "no-referrer";
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [id]);
  return null;
}

const analyticsListeners = new Set<() => void>();
function subscribeAnalytics(callback: () => void) {
  analyticsListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    analyticsListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}
function readAnalyticsSnapshot() {
  try {
    return localStorage.getItem("writing-room-analytics") === "yes";
  } catch {
    return false;
  }
}

export function PrivacyPreference() {
  const allowed = useSyncExternalStore(subscribeAnalytics, readAnalyticsSnapshot, () => false);
  return (
    <label className="check">
      <input
        type="checkbox"
        checked={allowed}
        onChange={(event) => {
          try {
            localStorage.setItem("writing-room-analytics", event.target.checked ? "yes" : "no");
          } catch {
            // ignore storage restrictions
          }
          analyticsListeners.forEach((cb) => cb());
        }}
      />
      Allow optional Google Analytics on this browser
    </label>
  );
}
