import Link from "next/link";
import { BookOpen, Clock, MonitorPlay, Mail, ChevronRight, ChevronDown, MessageCircle, Search } from "lucide-react";
import type { Row } from "@/db";
import { date, href, inquiryTypes, readings, text, whatsapp, type Settings } from "@/lib/domain";
import { AsyncForm, Brand, SubscribeFields } from "./interactions";

export function Photo({ src, alt = "", hero = false }: { src?: unknown; alt?: string; hero?: boolean }) {
  const url = href(src);
  return url ? (
    <img
      src={url}
      alt={alt}
      width={hero ? 1120 : 960}
      height={hero ? 1400 : 640}
      loading={hero ? "eager" : "lazy"}
      fetchPriority={hero ? "high" : "auto"}
      decoding="async"
    />
  ) : (
    <div className="placeholder" aria-hidden="true">
      <BookOpen size={34} strokeWidth={1.3} />
    </div>
  );
}

export function Breadcrumb({ title, parent }: { title: string; parent?: { label: string; path: string } }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      <ChevronRight size={14} aria-hidden="true" />
      {parent && (
        <>
          <Link href={parent.path}>{parent.label}</Link>
          <ChevronRight size={14} aria-hidden="true" />
        </>
      )}
      <span aria-current="page">{title}</span>
    </nav>
  );
}

export function Heading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="page-heading">
      <div className="shell">
        <Breadcrumb title={title} />
        <h1>{title}</h1>
        <p className="lead">{description}</p>
        {children}
      </div>
    </section>
  );
}

export function SectionHead({
  title,
  description,
  link,
}: {
  title: string;
  description?: string;
  link?: { label: string; href: string };
}) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {link && (
        <a className="text-link" href={link.href}>
          {link.label}
        </a>
      )}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="empty">
      <BookOpen size={25} strokeWidth={1.4} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

export function Copy({ source }: { source: unknown }) {
  return (
    <div className="prose">
      {String(source ?? "")
        .trim()
        .split(/\r?\n\s*\r?\n/)
        .filter(Boolean)
        .map((part, index) => {
          const lines = part.trim().split(/\r?\n/);
          if (lines[0].startsWith("## ")) {
            return (
              <div key={index}>
                <h3>{lines[0].slice(3)}</h3>
                {lines.length > 1 && <p>{lines.slice(1).join("\n")}</p>}
              </div>
            );
          }
          if (lines.every((line) => line.startsWith("- "))) {
            return (
              <ul key={index}>
                {lines.map((line, idx) => (
                  <li key={idx}>{line.slice(2)}</li>
                ))}
              </ul>
            );
          }
          return <p key={index}>{part}</p>;
        })}
    </div>
  );
}

export function Lines({ source }: { source: unknown }) {
  return (
    <ul>
      {String(source ?? "")
        .split(/\r?\n/)
        .map((line) => line.replace(/^[-•]\s*/, "").trim())
        .filter(Boolean)
        .map((line, index) => (
          <li key={index}>{line}</li>
        ))}
    </ul>
  );
}

export function Schema({ value }: { value: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, "\\u003c") }} />;
}

export function CourseCard({ row }: { row: Row }) {
  const path = "/courses/" + row.slug;
  return (
    <article className="course-card">
      <a href={path} className="card-image" tabIndex={-1} aria-hidden="true">
        <Photo src={row.image} alt={text(row, "alt")} />
      </a>
      <div className="card-body">
        <p className="eyebrow">{row.category || "Course & Workshop"}</p>
        <h3>
          <a href={path}>{row.title}</a>
        </h3>
        <p>{row.summary}</p>
        {row.instructor && <p className="muted">With {row.instructor}</p>}
        <div className="course-meta">
          {row.duration && (
            <span>
              <Clock size={15} />
              {row.duration}
            </span>
          )}
          {row.format && (
            <span>
              <MonitorPlay size={15} />
              {row.format}
            </span>
          )}
        </div>
        <div className="card-foot">
          <span>
            {row.price && <strong>{row.price} </strong>}
            {row.review_count ? (
              <span className="stars">
                ★ {Number(row.average).toFixed(1)} ({row.review_count})
              </span>
            ) : (
              <small>{row.availability}</small>
            )}
          </span>
          <a className="text-link" href={path} aria-label={"View course " + row.title}>
            View curriculum
          </a>
        </div>
      </div>
    </article>
  );
}

export function JournalCard({ row, compact = false }: { row: Row; compact?: boolean }) {
  const path = "/reflections/" + row.slug;
  return (
    <article className={"journal-card" + (compact ? " compact" : "")}>
      <a href={path} className="card-image" tabIndex={-1} aria-hidden="true">
        <Photo src={row.image} alt={text(row, "alt")} />
      </a>
      <div className="journal-copy">
        <p className="eyebrow">{row.category || "Insights & Reflections"}</p>
        <div lang={text(row, "language")} dir={row.language === "ur" ? "rtl" : "ltr"}>
          <h3>
            <a href={path}>{row.title}</a>
          </h3>
          {!compact && <p>{row.summary}</p>}
        </div>
        <p className="meta">{[row.author, date(row.published_at || row.created_at), readings(row.body)].filter(Boolean).join(" · ")}</p>
      </div>
    </article>
  );
}

export function Filters({
  path,
  query,
  category,
  options,
  availability = "",
  states = [],
}: {
  path: string;
  query: string;
  category: string;
  options: string[];
  availability?: string;
  states?: string[];
}) {
  return (
    <form action={path} className="filters" method="get">
      <div className="search">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          name="q"
          aria-label="Search by title"
          placeholder={path === "/courses" ? "Search courses & workshops" : "Search insights & reflections"}
          defaultValue={query}
        />
        <button className="button small">Search</button>
      </div>
      {!!options.length && (
        <label>
          Category
          <span className="select">
            <select name="category" defaultValue={category}>
              <option value="">All categories</option>
              {options.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <ChevronDown size={15} />
          </span>
        </label>
      )}
      {!!states.length && (
        <label>
          Availability
          <span className="select">
            <select name="availability" defaultValue={availability}>
              <option value="">Any availability</option>
              {states.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <ChevronDown size={15} />
          </span>
        </label>
      )}
      {(query || category || availability) && (
        <a href={path} className="text-link">
          Clear filters
        </a>
      )}
    </form>
  );
}

export function CategoryLinks({ path, active, values }: { path: string; active: string; values: string[] }) {
  return values.length ? (
    <nav className="categories" aria-label="Filter by category">
      {["", ...values].map((value) => (
        <a
          key={value}
          href={path + (value ? "?category=" + encodeURIComponent(value) : "")}
          aria-current={active === value ? "page" : undefined}
        >
          {value || "All"}
        </a>
      ))}
    </nav>
  ) : null;
}

export function Newsletter({ site }: { site: Settings }) {
  return (
    <section className="newsletter" id="newsletter">
      <div className="shell newsletter-grid">
        <div>
          <span className="mail">
            <Mail size={21} strokeWidth={1.5} />
          </span>
          <h2>{site.newsletter_title}</h2>
          <p>{site.newsletter_description}</p>
        </div>
        <AsyncForm endpoint="/api/subscribe" label="Subscribe">
          <SubscribeFields />
        </AsyncForm>
      </div>
    </section>
  );
}

export function ContactForm({ type, subject = "" }: { type: string; subject?: string }) {
  return (
    <AsyncForm endpoint="/api/contact" label="Send message">
      <div className="pair">
        <label>
          Full name
          <input name="name" required autoComplete="name" placeholder="Your name" maxLength={120} />
        </label>
        <label>
          Email address
          <input type="email" name="email" required autoComplete="email" placeholder="you@example.com" maxLength={254} />
        </label>
      </div>
      <label>
        Subject
        <input name="title" required maxLength={180} defaultValue={subject} />
      </label>
      <label>
        Inquiry category
        <span className="select">
          <select name="category" defaultValue={inquiryTypes.includes(type) ? type : "General inquiry"}>
            {inquiryTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <ChevronDown size={15} />
        </span>
      </label>
      <label>
        Your message
        <textarea
          name="body"
          rows={6}
          maxLength={6000}
          required
          placeholder="Share details about your program, workshop, event, or inquiry..."
        />
      </label>
    </AsyncForm>
  );
}

export function Social({ site }: { site: Settings }) {
  const socials = [
    ["LinkedIn", site.linkedin],
    ["Instagram", site.instagram],
    ["Facebook", site.facebook],
    ["YouTube", site.youtube],
    ["More links", site.other_social],
  ];
  return (
    <div className="actions socials">
      {socials
        .filter(([, url]) => href(url))
        .map(([label, url]) => (
          <a key={label} className="text-link" href={href(url)} target="_blank" rel="noreferrer">
            {label}
          </a>
        ))}
    </div>
  );
}

export function Footer({ site }: { site: Settings }) {
  const whats = whatsapp(site.whatsapp, "Assalamualaikum Madiha, I would like to connect regarding a collaboration.");
  return (
    <>
      <footer className="footer">
        <div className="shell">
          <div className="footer-grid">
            <div>
              <Brand title={site.site_title} />
              <p>
                {site.author_name || "Madiha Rasheed"} · Aspiring Capability Building Consultant & Growth Strategist · Karachi, Pakistan.
              </p>
              <Social site={site} />
            </div>
            <nav aria-label="Explore">
              <strong>Explore</strong>
              <Link href="/about">About &amp; Journey</Link>
              <Link href="/courses">Courses &amp; Workshops</Link>
              <Link href="/reflections">Insights &amp; Reflections</Link>
              <Link href="/publications">Publications</Link>
            </nav>
            <nav aria-label="Connect">
              <strong>Connect</strong>
              <Link href="/contact">Contact</Link>
              {site.show_speaking === "1" && <Link href="/speaking">Speaking &amp; Collaboration</Link>}
              {site.show_resources === "1" && <Link href="/resources">Resources</Link>}
              {site.show_gallery === "1" && <Link href="/gallery">Certificates &amp; Gallery</Link>}
            </nav>
          </div>
          <div className="footer-end">
            <span>
              © {new Date().getUTCFullYear()} {site.site_title}
            </span>
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/admin">Editor sign-in</Link>
          </div>
        </div>
      </footer>
      {whats && (
        <a className="float" href={whats} rel="noreferrer" target="_blank" aria-label="Connect on WhatsApp">
          <MessageCircle size={24} />
        </a>
      )}
    </>
  );
}
