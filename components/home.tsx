import Link from "next/link";
import type { Row } from "@/db";
import { absolute, collection, list } from "@/lib/content";
import { href, stars, text, type Settings } from "@/lib/domain";
import { impactFigures } from "@/lib/impact-data";
import { Copy, CourseCard, JournalCard, Newsletter, Photo, Schema, SectionHead, Social } from "./editorial";
import { LineArt } from "./line-art";
import { ImpactNumbers, Organizations, StoryVisual, WorkEntry } from "./profile";

const featuredSubjects = [
  { organization: "Delhi Punjabi Saudagran", heading: "Evaluating entrepreneurship training" },
  { organization: "CIRCLE Women", heading: "Making digital learning accessible" },
  { organization: "Mk Volunteers", heading: "Helping students find a direction" },
];

function featuredWork(rows: Row[]) {
  const selected = featuredSubjects.flatMap(({ organization, heading }) => {
    const row = rows.find((item) => text(item, "organization").toLowerCase().includes(organization.toLowerCase()));
    return row ? [{ row, heading }] : [];
  });
  return [
    ...selected,
    ...rows.filter((row) => !selected.some((item) => item.row.id === row.id)).map((row) => ({ row, heading: undefined })),
  ].slice(0, 3);
}

export async function Home({ site }: { site: Settings }) {
  const [courses, articles, organizations, experience, credentials, testimonials] = await Promise.all([
    list("courses"),
    list("articles"),
    collection("organizations"),
    collection("professional_experiences"),
    site.show_gallery === "1" ? collection("gallery_items") : [],
    site.show_testimonials === "1" ? collection("testimonials") : [],
  ]);
  const portrait = href(site.hero_image);
  const name = site.author_name || site.site_title;
  const nameParts = name.trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts.pop() : undefined;
  const stats = site.statistics.split(/\r?\n/).flatMap((line) => {
    const [value, label] = line.split("|").map((part) => part.trim());
    return value && label ? [{ value, label, id: impactFigures.find((figure) => figure.label === label)?.id }] : [];
  });
  const projects = featuredWork(experience);
  const journal = [...articles].sort((a, b) => Number(b.featured ?? 0) - Number(a.featured ?? 0)).slice(0, 3);
  const certificates = credentials.filter((row) => href(row.image)).slice(0, 3);

  return (
    <>
      <Schema value={{
        "@context": "https://schema.org",
        "@type": "Person",
        name,
        jobTitle: "Aspiring capability building consultant and growth strategist",
        url: absolute("/"),
        image: portrait ? absolute(portrait) : undefined,
        address: { "@type": "PostalAddress", addressLocality: "Karachi", addressCountry: "PK" },
        sameAs: [site.linkedin, site.instagram, site.facebook, site.youtube].map(href).filter((url) => url.startsWith("https://")),
      }} />

      <section className="home-hero" aria-labelledby="home-title">
        <div className="shell home-hero-copy">
          <p className="eyebrow">{site.hero_label}</p>
          <h1 id="home-title">
            <span>{nameParts.join(" ")}</span>
            {lastName && <> <em>{lastName}</em></>}
          </h1>
          <p className="home-positioning">
            {site.hero_line_1} {site.hero_line_2}
            {" "}<em>{site.hero_line_3}</em>
          </p>
          <p className="hero-description">{site.hero_description}</p>
          <div className="actions hero-actions">
            <Link className="button" href="/about" prefetch={false} data-magnetic="">Explore my journey</Link>
            <Link className="button outline" href="/contact" prefetch={false}>Let’s connect</Link>
          </div>
        </div>
        <div className="shell hero-meta">
          <span className="hero-location">Karachi, Pakistan</span>
          <Social site={site} />
          <a className="scroll-link" href="#impact">Explore the work</a>
        </div>
      </section>

      {!!stats.length && (
        <section className="impact-band section" id="impact">
          <div className="shell impact-layout">
            <div data-reveal="">
              <p className="eyebrow section-kicker">Social impact</p>
              <h2>Impact in <em>numbers.</em></h2>
              <Link prefetch={false} className="text-link" href="/social-impact">See the work behind the numbers</Link>
            </div>
            <ImpactNumbers values={stats} />
          </div>
        </section>
      )}

      <section className="shell section home-story" id={stats.length ? undefined : "impact"}>
        <StoryVisual portrait={href(site.about_image)} alt={site.about_image_alt || name} />
        <div data-reveal="">
          <p className="eyebrow section-kicker">About me</p>
          <h2>{site.intro_title}</h2>
          <Copy source={site.intro_body} />
          <Link prefetch={false} className="text-link" href="/about">Read my story</Link>
        </div>
      </section>

      {!!projects.length && (
        <section className="section wash selected-work">
          <div className="shell">
            <p className="eyebrow section-kicker">Selected experience</p>
            <SectionHead title="What the work looks like." link={{ label: "View all experience", href: "/experience" }} />
            <div className="selected-work-layout">
              <div className="selected-work-art" aria-hidden="true" data-reveal=""><LineArt motif="routes" /></div>
              <div className="work-stack">{projects.map(({ row, heading }) => <WorkEntry key={row.id} row={row} heading={heading} compact />)}</div>
            </div>
          </div>
        </section>
      )}

      {!!organizations.length && (
        <section className="shell section">
          <SectionHead title="Organizations & programs" description="Teams I’ve worked with, organizations I’ve volunteered for, and programs I’ve taken part in." />
          <Organizations rows={organizations} />
        </section>
      )}

      <section className="focus-section section">
        <div className="shell focus-layout">
          <div data-reveal="">
            <p className="eyebrow section-kicker">Areas of focus</p>
            <h2>What I’m <em>building toward.</em></h2>
            <p className="lead">How people develop skills, how organizations grow, and how learning reaches more communities.</p>
          </div>
          <div className="focus-list">
            <article data-reveal="">
              <h3>Developing people</h3>
              <p>Capability building, leadership development, and career development.</p>
            </article>
            <article data-reveal="">
              <h3>Understanding growth</h3>
              <p>Entrepreneurship, market research, and growth strategy.</p>
            </article>
            <article data-reveal="">
              <h3>Expanding access</h3>
              <p>Social impact and youth empowerment through education and inclusion.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="shell section home-insights">
        <p className="eyebrow section-kicker">Insights &amp; reflections</p>
        <SectionHead title="Notes from the field." link={{ label: "Explore insights", href: "/reflections" }} />
        {journal.length ? (
          <div className="cards">
            {journal.map((row) => <JournalCard row={row} key={row.id} />)}
          </div>
        ) : (
          <div className="editorial-teaser">
            <div className="teaser-art insights-art" aria-hidden="true"><LineArt motif="pages" /></div>
            <div>
              <h3>Essays and research reflections are in preparation.</h3>
              <p>Join the newsletter for new writing on capability building, leadership, and lessons from community work.</p>
              <a className="text-link" href="#newsletter">Get new insights by email</a>
            </div>
          </div>
        )}
      </section>

      <section className="section wash home-learning">
        <div className="shell">
          <p className="eyebrow section-kicker">Courses &amp; workshops</p>
          <SectionHead title="Skills put into practice." link={{ label: "Explore learning", href: "/courses" }} />
          {courses.length ? (
            <div className="cards">
              {courses.slice(0, 3).map((row) => <CourseCard key={row.id} row={row} />)}
            </div>
          ) : (
            <div className="editorial-teaser learning-teaser">
              <div>
                <h3>Public courses are in preparation.</h3>
                <p>Get launch updates or inquire about a tailored workshop on career readiness or digital inclusion.</p>
                <div className="actions">
                  <Link prefetch={false} className="button" href="/contact?category=Course%20or%20workshop%20registration">Ask about a workshop</Link>
                  <a className="text-link" href="#newsletter">Get launch updates</a>
                </div>
              </div>
              <div className="teaser-art learning-art" aria-hidden="true"><LineArt motif="contours" /></div>
            </div>
          )}
        </div>
      </section>

      {!!certificates.length && (
        <section className="shell section home-credentials">
          <SectionHead title="Credentials" link={{ label: "View all certificates", href: "/gallery" }} />
          <div className="credential-preview">
            {certificates.map((row) => (
              <figure key={row.id}>
                <div><Photo src={href(row.thumbnail) || row.image} alt={text(row, "alt")} /></div>
                <figcaption>{row.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {!!testimonials.length && (
        <section className="shell section">
          <SectionHead title="From collaborators & mentees" />
          <div className="cards">
            {testimonials.map((row) => (
              <figure className="panel" key={row.id}>
                {row.rating && <p className="stars" aria-label={row.rating + " out of 5 stars"}>{stars(Number(row.rating))}</p>}
                <blockquote>{row.body}</blockquote>
                <figcaption className="testimonial-byline">
                  {row.image && <Photo src={row.image} alt={text(row, "alt")} />}
                  <span><strong>{row.name}</strong><small>{[row.role, row.relationship].filter(Boolean).join(" · ")}</small></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
      <Newsletter site={site} />
    </>
  );
}
