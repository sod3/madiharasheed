import Link from "next/link";
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  Clock,
  Download,
  ExternalLink,
  Feather,
  GraduationCap,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Mic,
  MonitorPlay,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { col, databaseConfigured, findMany, type Row } from "@/db";
import { absolute, collection, list, type Catalogue } from "@/lib/content";
import {
  categories,
  courseStates,
  date,
  href,
  openCourse,
  phone,
  q,
  readings,
  stars,
  text,
  whatsapp,
  type Query,
  type Settings,
} from "@/lib/domain";
import { coreCompetencies, focusPillars } from "@/lib/profile-data";
import {
  Breadcrumb,
  CategoryLinks,
  ContactForm,
  Copy,
  CourseCard,
  Empty,
  Filters,
  Heading,
  JournalCard,
  Lines,
  Newsletter,
  Photo,
  Schema,
  SectionHead,
  Social,
} from "./editorial";
import { AsyncForm, Gallery, PrivacyPreference, ReadTools, Registration, Reviews, SubscribeFields } from "./interactions";

function initials(title: string) {
  return title
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function OrganizationTile({ row }: { row: Row }) {
  const logo = href(row.image);
  const title = text(row, "title");
  const role = text(row, "role");
  const period = text(row, "period");
  const link = href(row.url);

  const inner = (
    <>
      <div className="org-logo-wrap">
        {logo ? (
          <img src={logo} alt={text(row, "alt") || title} loading="lazy" decoding="async" />
        ) : (
          <span className="org-monogram" aria-hidden="true">
            {initials(title)}
          </span>
        )}
      </div>
      <div className="org-tile-body">
        <strong>{title}</strong>
        {(role || period) && <small>{[role, period].filter(Boolean).join(" · ")}</small>}
      </div>
    </>
  );

  return link ? (
    <a className="org-tile" href={link} target="_blank" rel="noreferrer">
      {inner}
    </a>
  ) : (
    <a className="org-tile" href={"/about#organization-" + row.id}>
      {inner}
    </a>
  );
}

function HeroDossier({ site }: { site: Settings }) {
  return (
    <aside className="hero-dossier" aria-label="Executive profile summary">
      <div className="dossier-head">
        <span className="dossier-crest" aria-hidden="true">
          MR
        </span>
        <div className="dossier-meta">
          <strong>{site.author_name || "Madiha Rasheed"}</strong>
          <span>
            <MapPin size={13} aria-hidden="true" /> Karachi Division, Sindh, Pakistan
          </span>
        </div>
        <span className="dossier-pill">BBA · Strategy</span>
      </div>
      <div className="dossier-body">
        <p className="dossier-role">
          Aspiring <strong>Capability Building Consultant</strong> &amp; <strong>Growth Strategist</strong> focused on entrepreneurship, leadership, education, and socioeconomic development.
        </p>
        <div className="dossier-tags">
          <span>Capability Building</span>
          <span>Growth Strategy</span>
          <span>Impact Evaluation</span>
          <span>Career Counseling</span>
        </div>
      </div>
      <div className="dossier-highlights">
        <div>
          <strong>Top 9% Selection</strong>
          <small>Enterprise Challenge Pakistan (220+ applicants)</small>
        </div>
        <div>
          <strong>~13% Acceptance</strong>
          <small>The Capstone Program Fellow (Cohort 1)</small>
        </div>
        <div>
          <strong>150+ National Cohort</strong>
          <small>Young Leaders Conference · Rights Baithak</small>
        </div>
        <div>
          <strong>CIRCLE Ambassador</strong>
          <small>WRP Karachi &amp; Digital Inclusion</small>
        </div>
      </div>
    </aside>
  );
}

export async function Home({ site }: { site: Settings }) {
  const [courses, articles, organizations, achievements, testimonials] = await Promise.all([
    list("courses"),
    list("articles"),
    collection("organizations"),
    collection("achievements"),
    collection("testimonials"),
  ]);

  const photo = href(site.hero_image);
  const author = site.author_name || "Madiha Rasheed";
  const stats = site.statistics
    .split(/\r?\n/)
    .map((line) => line.split("|").map((value) => value.trim()))
    .filter(([number, label]) => number && label);
  const featured = courses.filter((row) => row.featured);
  const journal = [...articles].sort((a, b) => Number(b.featured ?? 0) - Number(a.featured ?? 0)).slice(0, 3);
  const certificateItems = achievements.filter((row) => !!href(row.image)).slice(0, 6);
  const honors = achievements.filter((row) => row.featured && !href(row.image)).slice(0, 2);
  const whats = whatsapp(site.whatsapp, "Assalamualaikum Madiha, I would like to connect regarding a collaboration.");

  const topics = [
    { label: "About & Journey", path: "/about", summary: "Education, timelines & leadership.", Icon: GraduationCap },
    { label: "Courses & Workshops", path: "/courses", summary: "Capability & career readiness.", Icon: BookOpen },
    { label: "Insights & Reflections", path: "/reflections", summary: "Articles, essays & newsletters.", Icon: Feather },
    { label: "Speaking & Collaboration", path: site.show_speaking === "1" ? "/speaking" : "/contact", summary: "Workshops, talks & research.", Icon: MessagesSquare },
  ];

  const pillarIcons = [Layers, TrendingUp, Users, Sparkles];

  return (
    <>
      <Schema
        value={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: author,
          jobTitle: "Aspiring Capability Building Consultant & Growth Strategist",
          url: absolute("/"),
          email: site.email || undefined,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Karachi",
            addressRegion: "Sindh",
            addressCountry: "PK",
          },
          ...(photo ? { image: absolute(photo) } : {}),
          sameAs: [site.linkedin, site.instagram, site.facebook, site.youtube]
            .map(href)
            .filter((url) => url.startsWith("https://")),
        }}
      />

      <section className="hero">
        <div className="shell hero-grid">
          <div>
            <p className="eyebrow hero-label">{site.hero_label}</p>
            <h1>
              <span>{site.hero_line_1}</span>
              <span>{site.hero_line_2}</span>
              <em>{site.hero_line_3}</em>
            </h1>
            <p className="hero-description">{site.hero_description}</p>
            <div className="actions">
              <Link className="button" href="/about">
                Explore My Journey
              </Link>
              <Link className="button outline" href="/contact">
                Collaborate &amp; Connect
              </Link>
              {href(site.linkedin) && (
                <a className="text-link" href={href(site.linkedin)} target="_blank" rel="noreferrer">
                  LinkedIn Profile <ExternalLink size={14} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {photo ? (
            <figure className="hero-photo">
              <div className="frame">
                <Photo src={photo} alt={site.hero_alt || `${author} portrait`} hero />
              </div>
            </figure>
          ) : (
            <HeroDossier site={site} />
          )}
        </div>
      </section>

      {stats.length > 0 && (
        <section className="stats-band" aria-label="Documented social and research impact">
          <div className="shell stats">
            {stats.map(([number, label], index) => (
              <div key={index}>
                <strong>{number}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="discovery">
        <div className="shell discovery-grid">
          {topics.map(({ label, path, summary, Icon }) => (
            <a href={path} key={path}>
              <span className="discovery-icon">
                <Icon size={20} strokeWidth={1.65} />
              </span>
              <span>
                <strong>{label}</strong>
                <small>{summary}</small>
              </span>
            </a>
          ))}
        </div>
      </div>

      <section className="shell section intro">
        <div>
          <p className="eyebrow">Mission &amp; Positioning</p>
          <h2>{site.intro_title}</h2>
          <Copy source={site.intro_body} />
          {site.intro_quote && <blockquote>{site.intro_quote}</blockquote>}
          <div className="actions">
            <Link href="/about" className="text-link">
              Read Full Story &amp; Timelines
            </Link>
          </div>
        </div>
        <div className="pillars-grid" aria-label="Core areas of focus">
          {focusPillars.map((pillar, idx) => {
            const Icon = pillarIcons[idx % pillarIcons.length];
            return (
              <article className="pillar-card" key={pillar.title}>
                <span className="pillar-icon" aria-hidden="true">
                  <Icon size={18} strokeWidth={1.7} />
                </span>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {!!organizations.length && (
        <section className="section wash" aria-labelledby="orgs-heading">
          <div className="shell">
            <SectionHead
              title="Organizations & Programs"
              description="Institutions, fellowships, corporate teams, and social impact initiatives Madiha has contributed to across Pakistan."
              link={{ label: "View Full Experience", href: "/about#experience" }}
            />
            <div className="logos">
              {organizations.map((row) => (
                <OrganizationTile key={row.id} row={row} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="shell section" aria-labelledby="courses-heading">
        <SectionHead
          title="Courses & Workshops"
          description="Practical learning programs in capability building, work readiness, entrepreneurship, and structured career growth."
          link={{ label: "Explore Courses", href: "/courses" }}
        />
        {courses.length > 0 ? (
          <div className="cards">
            {(featured.length ? featured : courses).slice(0, 3).map((row) => (
              <CourseCard key={row.id} row={row} />
            ))}
          </div>
        ) : (
          <div className="editorial-notice">
            <div>
              <p className="eyebrow">Upcoming Learning Experiences</p>
              <h3>Curriculum &amp; cohorts in preparation</h3>
              <p className="lead" style={{ marginTop: ".6rem" }}>
                Public courses are currently being structured and will be published here once finalized. In the meantime, institutions and student communities can request tailored workshops rooted in Madiha’s facilitation experience.
              </p>
              <div className="actions" style={{ marginTop: "1.25rem" }}>
                <Link className="button" href="/contact?category=Course%20or%20workshop%20registration">
                  Request a Workshop
                </Link>
                <a className="button outline" href="#newsletter">
                  Get Launch Updates
                </a>
              </div>
            </div>
            <div className="editorial-tracks">
              <div className="track-item">
                <strong>Work Readiness &amp; Career Pathways</strong>
                <small>Guided career clarity drawing on RIASEC &amp; MBTI frameworks, CV preparation, and scholarship interview readiness.</small>
              </div>
              <div className="track-item">
                <strong>Digital Literacy &amp; Community Inclusion</strong>
                <small>Practical digital fluency and entrepreneurship fundamentals informed by CIRCLE Women Association cohorts.</small>
              </div>
              <div className="track-item">
                <strong>Entrepreneurship &amp; Social Action Design</strong>
                <small>SDG-aligned problem framing, design thinking, and structured initiative planning for emerging leaders.</small>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="section wash" aria-labelledby="insights-heading">
        <div className="shell">
          <SectionHead
            title="Insights, Articles & Reflections"
            description="Professional insights, long-form articles, personal reflections, and curated newsletters on leadership, strategy, and socioeconomic growth."
            link={{ label: "Visit Insights Hub", href: "/reflections" }}
          />
          {journal.length > 0 ? (
            <div className="journal-layout">
              <JournalCard row={journal[0]} />
              <div className="journal-side">
                {journal.slice(1).map((row) => (
                  <JournalCard key={row.id} row={row} compact />
                ))}
              </div>
            </div>
          ) : (
            <div className="editorial-notice">
              <div>
                <p className="eyebrow">Editorial Dispatches · Coming Soon</p>
                <h3>Thought leadership &amp; field reflections</h3>
                <p className="lead" style={{ marginTop: ".6rem" }}>
                  Essays, research takeaways, and bilingual English &amp; Urdu reflections are being curated for publication. Follow along on LinkedIn or join the newsletter to receive the first issue.
                </p>
                <div className="actions" style={{ marginTop: "1.25rem" }}>
                  <a className="button" href="#newsletter">
                    Subscribe to Newsletter
                  </a>
                  {href(site.linkedin) && (
                    <a className="button outline" href={href(site.linkedin)} target="_blank" rel="noreferrer">
                      Follow on LinkedIn
                    </a>
                  )}
                </div>
              </div>
              <div className="editorial-tracks">
                <div className="track-item">
                  <strong>Professional Insights</strong>
                  <small>Field observations on capacity building, impact evaluation, and growth strategy in emerging ecosystems.</small>
                </div>
                <div className="track-item">
                  <strong>Articles &amp; Research Notes</strong>
                  <small>Structured analysis bridging organizational behavior, entrepreneurship, and AI-assisted learning.</small>
                </div>
                <div className="track-item">
                  <strong>Personal Reflections &amp; Newsletters</strong>
                  <small>Candid reflections from mentoring students, leading social action projects, and navigating growth.</small>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {!!certificateItems.length && (
        <section className="shell section" id="certificates">
          <SectionHead
            title="Verified Certificates & Credentials"
            description="Original certificates from fellowships, leadership cohorts, mentorship programs, and community outreach initiatives. Click any certificate for full-screen viewing."
            link={{ label: "Open Full Gallery", href: "/gallery" }}
          />
          <Gallery items={certificateItems} />
          {!!honors.length && (
            <div className="inner-section">
              <Timeline rows={honors} />
            </div>
          )}
        </section>
      )}

      {site.show_testimonials === "1" && !!testimonials.length && (
        <section className="shell section">
          <SectionHead title="Voices from Collaborators & Mentees" />
          <div className="cards">
            {testimonials.map((row) => (
              <figure className="panel" key={row.id}>
                {row.rating && (
                  <p className="stars" aria-label={row.rating + " out of 5 stars"}>
                    {stars(Number(row.rating))}
                  </p>
                )}
                <blockquote>{row.body}</blockquote>
                <figcaption className="testimonial-byline">
                  {row.image && <Photo src={row.image} alt={text(row, "alt")} />}
                  <span>
                    <strong>{row.name}</strong>
                    <small>{[row.role, row.relationship].filter(Boolean).join(" · ")}</small>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <Newsletter site={site} />

      <section className="closing shell section">
        <p className="eyebrow">Collaboration &amp; Inquiries</p>
        <h2>Meaningful growth begins with a purposeful conversation.</h2>
        <p className="lead">
          Open to capability building projects, market research collaborations, youth workshops, speaking engagements, and strategic roles.
        </p>
        <div className="actions">
          <Link className="button" href="/contact">
            Start a Conversation
          </Link>
          <Link className="button outline" href="/about">
            View Complete Profile
          </Link>
          {whats && (
            <a className="text-link" href={whats} target="_blank" rel="noreferrer">
              Connect on WhatsApp
            </a>
          )}
        </div>
      </section>
    </>
  );
}

function Timeline({ rows }: { rows: Row[] }) {
  return (
    <div className="timeline-rich">
      {rows.map((row) => (
        <article className="timeline-card" key={row.id}>
          <div className="timeline-inner">
            <div className="timeline-top">
              <div>
                <p className="eyebrow">{[row.date_label, row.category].filter(Boolean).join(" · ")}</p>
                <h3>{row.title}</h3>
                {row.issuer && <p className="meta">{row.issuer}</p>}
              </div>
              {row.signatory && <span className="badge">{row.signatory}</span>}
            </div>
            {row.body && <Copy source={row.body} />}
            {href(row.url) && (
              <a className="text-link" href={href(row.url)} rel="noreferrer" target="_blank">
                View details
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function ExperienceTimeline({ rows }: { rows: Row[] }) {
  return (
    <div className="timeline-rich">
      {rows.map((row) => (
        <article className="timeline-card" key={row.id}>
          <div className="timeline-inner">
            <div className="timeline-top">
              <div>
                <p className="eyebrow">{[row.date_label, row.location].filter(Boolean).join(" · ")}</p>
                <h3>{row.title}</h3>
                {row.organization && (
                  <div className="timeline-org">
                    {href(row.logo) && <img src={href(row.logo)} alt={text(row, "organization")} loading="lazy" />}
                    <span>{row.organization}</span>
                  </div>
                )}
              </div>
              {row.kind && <span className="badge" style={{ textTransform: "capitalize" }}>{row.kind}</span>}
            </div>
            {row.body && <Copy source={row.body} />}
            {row.impact && (
              <p className="timeline-impact">
                <strong>Documented Impact:</strong> {row.impact}
              </p>
            )}
            {row.image && (
              <div className="record-photo">
                <Photo src={row.image} alt={text(row, "alt")} />
              </div>
            )}
            {href(row.url) && (
              <div style={{ marginTop: ".75rem" }}>
                <a className="text-link" href={href(row.url)} rel="noreferrer" target="_blank">
                  Organization link <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function BioLinks({ site }: { site: Settings }) {
  return (
    <div className="actions downloads">
      {href(site.professional_bio) && (
        <a className="button outline" href={href(site.professional_bio)}>
          <Download size={17} /> Professional biography
        </a>
      )}
      {href(site.media_kit) && (
        <a className="button outline" href={href(site.media_kit)}>
          <Download size={17} /> Media kit
        </a>
      )}
    </div>
  );
}

export async function About({ site }: { site: Settings }) {
  const [education, organizations, experience, awards, timeline, media] = await Promise.all([
    collection("qualifications"),
    collection("organizations"),
    collection("professional_experiences"),
    collection("achievements"),
    collection("milestones"),
    collection("media_mentions"),
  ]);

  const portrait = href(site.about_image) || href(site.hero_image);
  const workRoles = experience.filter((row) => !row.kind || row.kind === "experience");
  const leadershipRoles = experience.filter((row) => row.kind === "fellowship" || row.kind === "volunteering");
  const certificateRows = awards.filter((row) => !!href(row.image));
  const honorRows = awards.filter((row) => !href(row.image));

  const links = [
    ["background", "Personal background"],
    ["education", "Education timeline"],
    ["experience", "Professional experience"],
    ...(leadershipRoles.length ? [["fellowships", "Volunteering & fellowships"]] : []),
    ...(organizations.length ? [["organizations", "Organizations"]] : []),
    ["certificates", "Certificate gallery"],
    ["competencies", "Core competencies"],
    ...(site.philosophy ? [["philosophy", "Philosophy & vision"]] : []),
    ...(timeline.length ? [["timeline", "Key milestones"]] : []),
    ...(media.length ? [["media", "Media & speaking"]] : []),
  ];

  return (
    <>
      <section className="page-heading">
        <div className="shell">
          <Breadcrumb title="About" />
          <div className="detail-grid">
            <div>
              <p className="eyebrow">About Madiha Rasheed · Karachi, Pakistan</p>
              <h1>{site.author_name || "Madiha Rasheed"}</h1>
              <Copy source={site.intro_body} />
              {site.intro_quote && <blockquote>{site.intro_quote}</blockquote>}
              <div className="actions downloads">
                <Link className="button" href="/contact">
                  Invite to Collaborate
                </Link>
                {href(site.linkedin) && (
                  <a className="button outline" href={href(site.linkedin)} target="_blank" rel="noreferrer">
                    LinkedIn Profile <ExternalLink size={15} aria-hidden="true" />
                  </a>
                )}
              </div>
              <BioLinks site={site} />
            </div>

            {portrait ? (
              <figure className="about-photo">
                <Photo src={portrait} alt={site.about_image_alt || site.hero_alt || "Madiha Rasheed"} hero />
              </figure>
            ) : (
              <HeroDossier site={site} />
            )}
          </div>
        </div>
      </section>

      <div className="shell section split about">
        <nav className="about-nav panel" aria-label="About sections">
          {links.map(([id, label]) => (
            <a href={"#" + id} key={id}>
              {label}
            </a>
          ))}
        </nav>

        <div className="stack">
          <section id="background">
            <p className="eyebrow">Biography</p>
            <h2>Personal background</h2>
            {site.background ? (
              <Copy source={site.background} />
            ) : (
              <p className="muted">Biography details will appear here.</p>
            )}
          </section>

          <section id="education">
            <p className="eyebrow">Academic Foundation</p>
            <h2>Educational journey</h2>
            {education.length ? (
              <Timeline rows={education} />
            ) : (
              <p className="muted">Verified education details will appear here.</p>
            )}
          </section>

          <section id="experience">
            <p className="eyebrow">Consulting, Research &amp; Operations</p>
            <h2>Professional experience</h2>
            {workRoles.length ? (
              <ExperienceTimeline rows={workRoles} />
            ) : (
              <p className="muted">Confirmed professional roles will appear here.</p>
            )}
          </section>

          {!!leadershipRoles.length && (
            <section id="fellowships">
              <p className="eyebrow">Community &amp; Leadership</p>
              <h2>Volunteering, fellowships &amp; social action</h2>
              <ExperienceTimeline rows={leadershipRoles} />
            </section>
          )}

          {!!organizations.length && (
            <section id="organizations">
              <p className="eyebrow">Affiliations</p>
              <h2>Organizations &amp; programs</h2>
              <div className="logos">
                {organizations.map((row) => (
                  <div key={row.id} id={"organization-" + row.id}>
                    <OrganizationTile row={row} />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section id="certificates">
            <p className="eyebrow">Verified Credentials</p>
            <h2>Certificate gallery &amp; honors</h2>
            <p className="lead" style={{ marginBottom: "1.25rem" }}>
              Select any original certificate below to inspect it in full-screen mode with zoom and keyboard navigation.
            </p>
            {certificateRows.length ? (
              <Gallery items={certificateRows} filterable />
            ) : (
              <Empty title="Certificates pending">Verified certificates will appear here.</Empty>
            )}
            {!!honorRows.length && (
              <div className="award-group">
                <h3>Program &amp; Social Impact Recognition</h3>
                <Timeline rows={honorRows} />
              </div>
            )}
          </section>

          <section id="competencies">
            <p className="eyebrow">Capabilities</p>
            <h2>Core competencies</h2>
            <div className="competency-grid">
              {coreCompetencies.map((group) => (
                <div className="competency-box" key={group.group}>
                  <h3>{group.group}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {site.philosophy && (
            <section id="philosophy">
              <p className="eyebrow">Perspective</p>
              <h2>Philosophy &amp; beyond</h2>
              <Copy source={site.philosophy} />
              {site.beyond && (
                <div style={{ marginTop: "1.25rem" }}>
                  <Copy source={site.beyond} />
                </div>
              )}
            </section>
          )}

          {!!timeline.length && (
            <section id="timeline">
              <p className="eyebrow">Progression</p>
              <h2>Career &amp; leadership milestones</h2>
              <Timeline rows={timeline} />
            </section>
          )}

          {!!media.length && (
            <section id="media">
              <p className="eyebrow">Appearances</p>
              <h2>Media and speaking</h2>
              <Timeline rows={media} />
            </section>
          )}
        </div>
      </div>
    </>
  );
}

export async function CataloguePage({ type, site, query }: { type: Catalogue; site: Settings; query: Query }) {
  const allItems = await list(type);
  const filter = q(query, "category");
  const availability = q(query, "availability");
  const keyword = q(query, "q").toLowerCase();

  const filtered = allItems.filter(
    (row) =>
      (!filter || row.category === filter) &&
      (!availability || row.availability === availability) &&
      (!keyword ||
        [row.title, row.summary, row.category, row.instructor, row.body].join(" ").toLowerCase().includes(keyword)),
  );

  const articles = type === "articles";
  const courses = type === "courses";
  const route = articles ? "/reflections" : "/" + type;
  const featured = articles && !filter && !keyword ? allItems.find((row) => row.featured) ?? allItems[0] : undefined;
  const popular =
    articles && !filter && !keyword
      ? allItems
          .filter((row) => Number(row.views) > 0)
          .sort((a, b) => Number(b.views) - Number(a.views))
          .slice(0, 3)
      : [];

  const heading = articles ? "Insights, Articles & Reflections" : courses ? "Courses & Workshops" : "Publications";
  const description = articles
    ? "Professional insights, articles, personal reflections, and newsletters on capability building, entrepreneurship, leadership, and socioeconomic development."
    : courses
      ? "Guided courses and interactive workshops on career readiness, leadership development, entrepreneurship, and capability building."
      : "Published reports, research briefs, articles, and authorized resources.";

  return (
    <>
      <Heading title={heading} description={description} />
      <section className="shell section archive">
        {!!allItems.length &&
          (type === "publications" ? (
            <CategoryLinks path={route} active={filter} values={categories(allItems)} />
          ) : (
            <Filters
              path={route}
              query={keyword}
              category={filter}
              options={categories(allItems)}
              availability={availability}
              states={courses ? courseStates : []}
            />
          ))}

        {courses && !!allItems.length && (
          <p className="meta results">
            {filtered.length} {filtered.length === 1 ? "course" : "courses"}
          </p>
        )}

        {featured && (
          <div className="journal-feature">
            <JournalCard row={featured} />
          </div>
        )}

        {articles && filtered.some((row) => row.id !== featured?.id) && (
          <SectionHead title={filter || keyword ? "Search results" : "Latest insights & reflections"} />
        )}

        {filtered.length ? (
          <div className="cards">
            {filtered
              .filter((row) => row.id !== featured?.id)
              .map((row) =>
                articles ? (
                  <JournalCard key={row.id} row={row} />
                ) : courses ? (
                  <CourseCard key={row.id} row={row} />
                ) : (
                  <article className="publication-card" key={row.id}>
                    <a className="cover" href={"/publications/" + row.slug}>
                      <Photo src={row.image} alt={text(row, "alt")} />
                    </a>
                    <p className="eyebrow">{row.category || "Publication"}</p>
                    <h3>
                      <a href={"/publications/" + row.slug}>{row.title}</a>
                    </h3>
                    <p className="meta">{[row.publisher, date(row.issue_date)].filter(Boolean).join(" · ")}</p>
                    <p>{row.summary}</p>
                    <a className="text-link" href={"/publications/" + row.slug}>
                      View publication
                    </a>
                  </article>
                ),
              )}
          </div>
        ) : allItems.length ? (
          <Empty title={`No ${courses ? "courses" : "results"} match your filters`}>
            Try another keyword or clear the active filters.
          </Empty>
        ) : courses ? (
          <div className="editorial-notice">
            <div>
              <p className="eyebrow">Courses &amp; Workshops · In Preparation</p>
              <h2>Upcoming cohorts &amp; training tracks</h2>
              <p className="lead" style={{ marginTop: ".6rem" }}>
                Courses are kept unpublished until cohort schedules and curricula are finalized. Reach out to collaborate on an institutional workshop or join the newsletter for early access.
              </p>
              <div className="actions" style={{ marginTop: "1.25rem" }}>
                <Link className="button" href="/contact?category=Course%20or%20workshop%20registration">
                  Inquire About a Workshop
                </Link>
                <a className="button outline" href="#newsletter">
                  Notify Me at Launch
                </a>
              </div>
            </div>
            <div className="editorial-tracks">
              <div className="track-item">
                <strong>Capability Building &amp; Growth Foundations</strong>
                <small>Structured skill mapping, personal strategy, and goal execution for students and early-career professionals.</small>
              </div>
              <div className="track-item">
                <strong>Career Readiness &amp; Scholarship Preparation</strong>
                <small>Practical guidance inspired by RIASEC &amp; MBTI frameworks, CV/LinkedIn refinement, and interview coaching.</small>
              </div>
              <div className="track-item">
                <strong>Digital Inclusion &amp; Work Readiness Workshops</strong>
                <small>Interactive sessions built on real facilitation experience with CIRCLE Women Association and university cohorts.</small>
              </div>
            </div>
          </div>
        ) : articles ? (
          <div className="editorial-notice">
            <div>
              <p className="eyebrow">Publishing Hub · Coming Soon</p>
              <h2>Insights, articles, reflections &amp; newsletters</h2>
              <p className="lead" style={{ marginTop: ".6rem" }}>
                New articles, research perspectives, and bilingual personal reflections will be published here soon. Subscribe below or connect on LinkedIn to follow upcoming dispatches.
              </p>
              <div className="actions" style={{ marginTop: "1.25rem" }}>
                <a className="button" href="#newsletter">
                  Subscribe to Newsletter
                </a>
                {href(site.linkedin) && (
                  <a className="button outline" href={href(site.linkedin)} target="_blank" rel="noreferrer">
                    Connect on LinkedIn
                  </a>
                )}
              </div>
            </div>
            <div className="editorial-tracks">
              <div className="track-item">
                <strong>Professional Insights</strong>
                <small>Reflections on capability building, consulting frameworks, and youth economic empowerment.</small>
              </div>
              <div className="track-item">
                <strong>Articles &amp; Research Takeaways</strong>
                <small>Lessons from conducting quantitative impact assessments and designing social action initiatives.</small>
              </div>
              <div className="track-item">
                <strong>Personal Reflections &amp; Newsletters</strong>
                <small>Thoughtful essays in English and Urdu on leadership, purpose, and continuous learning.</small>
              </div>
            </div>
          </div>
        ) : (
          <Empty title="Publications coming soon">
            Research reports, articles, and published resources will appear here once published.
          </Empty>
        )}

        {!!popular.length && (
          <div className="inner-section">
            <SectionHead title="Most read reflections" />
            <div className="cards">
              {popular.map((row) => (
                <JournalCard key={row.id} row={row} />
              ))}
            </div>
          </div>
        )}
      </section>
      {(articles || courses) && <Newsletter site={site} />}
    </>
  );
}

export async function CourseDetail({
  row,
  site,
  preview,
  query,
}: {
  row: Row;
  site: Settings;
  preview: boolean;
  query: Query;
}) {
  const dbReady = databaseConfigured();
  const [modules, batchesRaw, reviews, distribution] = !dbReady
    ? [[], [], [], []]
    : await Promise.all([
        findMany<{ title: string; body: string }>(
          "course_modules",
          { course_id: row.id },
          { sort: { position: 1, id: 1 }, projection: { _id: 0, title: 1, body: 1 } },
        ),
        findMany("course_batches", { course_id: row.id }, { sort: { starts_on: 1, id: 1 } }),
        (async () => {
          const reviewsCol = await col("reviews");
          return reviewsCol
            .aggregate<Row>([
              { $match: { course_id: row.id, status: "published" } },
              { $lookup: { from: "review_votes", localField: "id", foreignField: "review_id", as: "_votes" } },
              { $addFields: { helpful: { $size: "$_votes" } } },
              { $sort: { created_at: -1, id: -1 } },
              { $limit: 9 },
              { $project: { _id: 0, id: 1, name: 1, rating: 1, title: 1, body: 1, reply: 1, created_at: 1, helpful: 1 } },
            ])
            .toArray();
        })(),
        (async () => {
          const reviewsCol = await col("reviews");
          const dist = await reviewsCol
            .aggregate<{ _id: number; count: number }>([
              { $match: { course_id: row.id, status: "published" } },
              { $group: { _id: "$rating", count: { $sum: 1 } } },
            ])
            .toArray();
          return dist.map((d) => ({ id: d._id, rating: d._id, count: d.count }));
        })(),
      ]);

  const batches = [...batchesRaw].sort(
    (a, b) =>
      (!a.starts_on ? 1 : 0) - (!b.starts_on ? 1 : 0) ||
      String(a.starts_on ?? "").localeCompare(String(b.starts_on ?? "")) ||
      a.id - b.id,
  );
  const start = batches.find((batch) => batch.availability === "Open");
  const instructor = row.instructor || site.author_name || "Madiha Rasheed";
  const faq = text(row, "faq")
    .split(/\r?\n/)
    .map((line) => line.split("|"))
    .filter((parts) => parts.length >= 2);
  const invite = q(query, "invite");

  return (
    <>
      {!preview && instructor && (
        <Schema
          value={{
            "@context": "https://schema.org",
            "@type": "Course",
            name: row.title,
            description: row.summary,
            url: absolute("/courses/" + row.slug),
            provider: { "@type": "Person", name: instructor },
            ...(row.review_count
              ? { aggregateRating: { "@type": "AggregateRating", ratingValue: row.average, reviewCount: row.review_count } }
              : {}),
          }}
        />
      )}
      <section className="page-heading">
        <div className="shell">
          <Breadcrumb title={text(row, "title")} parent={{ label: "Courses", path: "/courses" }} />
          <div className="detail-grid">
            <div>
              <p className="eyebrow">
                {row.category || "Course & Workshop"}
                {preview && <span className="badge">Editor preview</span>}
              </p>
              <h1>{row.title}</h1>
              <p className="lead">{row.summary}</p>
              {instructor && (
                <p>
                  Facilitated by <strong>{instructor}</strong>
                </p>
              )}
              <div className="course-meta">
                {row.duration && (
                  <span>
                    <Clock size={17} />
                    {row.duration}
                  </span>
                )}
                {row.format && (
                  <span>
                    <MonitorPlay size={17} />
                    {row.format}
                  </span>
                )}
                {start?.starts_on && (
                  <span>
                    <CalendarDays size={17} />
                    {date(start.starts_on)}
                  </span>
                )}
              </div>
              {!!row.review_count && (
                <a href="#reviews" className="stars" aria-label={Number(row.average).toFixed(1) + " out of 5 stars"}>
                  {stars(Number(row.average))} {Number(row.average).toFixed(1)} ({row.review_count})
                </a>
              )}
            </div>
            <div className="detail-photo">
              {row.video ? (
                <video src={href(row.video)} poster={href(row.image)} controls playsInline preload="metadata" />
              ) : (
                <Photo src={row.image} alt={text(row, "alt")} hero />
              )}
            </div>
          </div>
        </div>
      </section>
      <div className="shell section split">
        <div className="stack course-main">
          {row.body && (
            <section>
              <h2>Course overview</h2>
              <Copy source={row.body} />
            </section>
          )}
          {row.audience && (
            <section>
              <h2>Who this course is for</h2>
              <Lines source={row.audience} />
            </section>
          )}
          {row.outcomes && (
            <section>
              <h2>Learning outcomes</h2>
              <Lines source={row.outcomes} />
            </section>
          )}
          {!!modules.length && (
            <section>
              <h2>Curriculum</h2>
              <div className="accordion">
                {modules.map((module, index) => (
                  <details key={index}>
                    <summary>{module.title}</summary>
                    <div>
                      <Copy source={module.body} />
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}
          {!!batches.length && (
            <section>
              <h2>Batches and schedule</h2>
              <div className="accordion">
                {batches.map((batch) => (
                  <details key={batch.id}>
                    <summary>{[batch.title, date(batch.starts_on), batch.availability].filter(Boolean).join(" · ")}</summary>
                    <div>
                      <Copy source={batch.schedule || "Contact the instructor for schedule details."} />
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}
          {[
            ["Requirements", row.requirements],
            ["Benefits", row.benefits],
            ["About the instructor", row.instructor_bio || site.intro_body],
            ["Certificate", row.certificate],
          ]
            .filter(([, body]) => body)
            .map(([label, body]) => (
              <section key={String(label)}>
                <h2>{label}</h2>
                <Copy source={body} />
              </section>
            ))}
          {!!faq.length && (
            <section>
              <h2>Frequently asked questions</h2>
              <div className="accordion">
                {faq.map(([question, ...answers], index) => (
                  <details key={index}>
                    <summary>{question.trim()}</summary>
                    <div>
                      <Copy source={answers.join("|").trim()} />
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}
          <Reviews
            course={row}
            items={reviews}
            distribution={distribution}
            allow={!preview}
            invite={/^[0-9a-f]{64}$/.test(invite) ? invite : ""}
          />
        </div>
        <Registration course={row} batches={batches} ready={!!phone(site.whatsapp)} open={openCourse(row) && !preview} />
      </div>
    </>
  );
}

export async function ArticleDetail({ row, site, preview }: { row: Row; site: Settings; preview: boolean }) {
  const author = row.author || site.author_name || "Madiha Rasheed";
  const url = absolute("/reflections/" + row.slug);
  const [articles, comments] = await Promise.all([
    list("articles"),
    row.comments_enabled && !preview && databaseConfigured()
      ? findMany(
          "comments",
          { article_id: row.id, status: "published" },
          { sort: { id: -1 }, limit: 50, projection: { _id: 0, id: 1, name: 1, body: 1, created_at: 1 } },
        )
      : Promise.resolve([]),
  ]);
  const related = articles
    .filter((article) => article.id !== row.id)
    .sort((a, b) => Number(b.category === row.category) - Number(a.category === row.category))
    .slice(0, 3);
  const lang = row.language === "ur" ? "ur" : "en";
  const direction = lang === "ur" ? "rtl" : "ltr";

  return (
    <>
      {!preview && author && (
        <Schema
          value={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: row.title,
            description: row.summary,
            author: { "@type": "Person", name: author },
            datePublished: row.published_at || row.created_at,
            inLanguage: lang,
            mainEntityOfPage: url,
            ...(href(row.image) ? { image: absolute(href(row.image)) } : {}),
          }}
        />
      )}
      <section className="article-head">
        <div className="shell">
          <Breadcrumb title={text(row, "title")} parent={{ label: "Insights & Reflections", path: "/reflections" }} />
          <div className="reading">
            <p className="eyebrow">
              {row.category || "Reflection"}
              {preview && <span className="badge">Editor preview</span>}
            </p>
            <div lang={lang} dir={direction}>
              <h1>{row.title}</h1>
              <p className="lead">{row.summary}</p>
            </div>
            <p className="meta">{[author, date(row.published_at || row.created_at), readings(row.body)].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
      </section>
      {row.image && (
        <div className="shell article-image">
          <Photo src={row.image} alt={text(row, "alt")} hero />
        </div>
      )}
      <article className="reading section">
        <div id="reading-body" lang={lang} dir={direction}>
          <Copy source={row.body} />
        </div>
        {!preview && <ReadTools url={url} title={text(row, "title")} />}
        {author && (
          <div className="byline">
            <strong>{author}</strong>
            {author === site.author_name && (
              <Link className="text-link" href="/about">
                About the author
              </Link>
            )}
          </div>
        )}
        {!!row.comments_enabled && !preview && (
          <section className="inner-section">
            <h2>Join the conversation</h2>
            {comments.map((comment) => (
              <article className="panel comment" key={comment.id}>
                <strong>{comment.name}</strong> <time className="meta">{date(comment.created_at)}</time>
                <p>{comment.body}</p>
              </article>
            ))}
            <AsyncForm endpoint="/api/comment" label="Submit comment">
              <input type="hidden" name="article" value={text(row, "slug")} />
              <div className="pair">
                <label>
                  Name
                  <input name="name" required maxLength={120} />
                </label>
                <label>
                  Email
                  <input type="email" name="email" required />
                </label>
              </div>
              <label>
                Comment
                <textarea name="body" rows={4} required maxLength={2500} />
              </label>
              <p className="muted">Comments are moderated before publication. Your email stays private.</p>
            </AsyncForm>
          </section>
        )}
      </article>
      {!!related.length && (
        <section className="section shell related">
          <SectionHead title="Related insights & reflections" />
          <div className="cards">
            {related.map((article) => (
              <JournalCard key={article.id} row={article} />
            ))}
          </div>
        </section>
      )}
      <Newsletter site={site} />
    </>
  );
}

export function Publication({ row, site, preview }: { row: Row; site: Settings; preview: boolean }) {
  return (
    <>
      {!preview && /^books?$/i.test(text(row, "category")) && site.author_name && (
        <Schema
          value={{
            "@context": "https://schema.org",
            "@type": "Book",
            name: row.title,
            description: row.summary,
            author: { "@type": "Person", name: site.author_name },
            datePublished: row.issue_date,
            url: absolute("/publications/" + row.slug),
          }}
        />
      )}
      <section className="page-heading">
        <div className="shell">
          <Breadcrumb title={text(row, "title")} parent={{ label: "Publications", path: "/publications" }} />
          <div className="detail-grid">
            <div>
              <p className="eyebrow">
                {row.category || "Publication"}
                {preview && <span className="badge">Editor preview</span>}
              </p>
              <h1>{row.title}</h1>
              <p className="lead">{row.summary}</p>
              <p className="meta">{[row.publisher, date(row.issue_date)].filter(Boolean).join(" · ")}</p>
              <div className="actions downloads">
                {href(row.purchase_url) && (
                  <a className="button" href={href(row.purchase_url)} target="_blank" rel="noreferrer">
                    Find a copy
                  </a>
                )}
                {href(row.download_url) && (
                  <a className="button outline" href={href(row.download_url)}>
                    Download publication
                  </a>
                )}
                {href(row.reference_url) && (
                  <a className="text-link" href={href(row.reference_url)} target="_blank" rel="noreferrer">
                    View reference
                  </a>
                )}
              </div>
            </div>
            <div className="cover">
              <Photo src={row.image} alt={text(row, "alt")} hero />
            </div>
          </div>
        </div>
      </section>
      {row.body && (
        <article className="reading section">
          <h2>About this publication</h2>
          <Copy source={row.body} />
        </article>
      )}
    </>
  );
}

export async function Connect({
  site,
  query,
  speaking = false,
}: {
  site: Settings;
  query: Query;
  speaking?: boolean;
}) {
  const title = speaking ? "Speaking & collaboration" : "Get in touch";
  const whats = whatsapp(
    site.whatsapp,
    speaking
      ? "Assalamualaikum Madiha, I would like to discuss a speaking or workshop collaboration."
      : "Assalamualaikum Madiha, I would like to get in touch.",
  );
  const [appearances, photos] = speaking
    ? await Promise.all([collection("media_mentions"), collection("gallery_items")])
    : [[], []];
  const events = appearances.filter((row) => /speak|interview|event|workshop/i.test(text(row, "category")));
  const gallery = photos.filter((row) => /speak|event|workshop|media/i.test(text(row, "category"))).slice(0, 6);

  return (
    <>
      <Heading
        title={title}
        description={
          speaking
            ? "Invite Madiha Rasheed to facilitate a workshop, speak on youth leadership and capability building, or collaborate on research and strategy."
            : "Reach out for capability building collaborations, workshops, research partnerships, speaking invitations, or career mentorship inquiries."
        }
      />
      <section className="shell section contact-grid">
        <div>
          {speaking ? (
            <>
              <Copy source={site.speaking_intro} />
              <h2 style={{ marginTop: "1.5rem" }}>Engagement formats</h2>
              <Lines source={site.speaking_types} />
              {site.speaking_topics && (
                <>
                  <h3 style={{ marginTop: "1.5rem" }}>Focus &amp; speaking topics</h3>
                  <Lines source={site.speaking_topics} />
                </>
              )}
              {!!events.length && (
                <>
                  <h3 style={{ marginTop: "1.5rem" }}>Previous engagements</h3>
                  <Timeline rows={events} />
                </>
              )}
              <BioLinks site={site} />
            </>
          ) : (
            <>
              <p className="eyebrow">Direct Channels</p>
              <h2>Start a conversation</h2>
              <p className="muted" style={{ marginBottom: "1rem" }}>
                Based in Karachi, Pakistan · Available for remote and in-person collaborations.
              </p>
            </>
          )}
          {site.email && (
            <a className="contact-option" href={"mailto:" + site.email}>
              <Mail size={20} />
              <span>
                <strong>Email</strong>
                <small>{site.email}</small>
              </span>
            </a>
          )}
          {href(site.linkedin) && (
            <a className="contact-option" href={href(site.linkedin)} target="_blank" rel="noreferrer">
              <Briefcase size={20} />
              <span>
                <strong>LinkedIn</strong>
                <small>linkedin.com/in/madiha-rasheed-39660b290</small>
              </span>
            </a>
          )}
          {whats && (
            <a className="contact-option" href={whats} target="_blank" rel="noreferrer">
              <MessageCircle size={20} />
              <span>
                <strong>WhatsApp</strong>
                <small>Open a direct chat</small>
              </span>
            </a>
          )}
          {!speaking && site.show_speaking === "1" && (
            <Link className="contact-option" href="/speaking">
              <Mic size={20} />
              <span>
                <strong>Speaking &amp; collaboration</strong>
                <small>Explore workshop &amp; panel options</small>
              </span>
            </Link>
          )}
          <Social site={site} />
        </div>
        <div className="panel contact-panel">
          <h2>{speaking ? "Invite Madiha" : "Send a message"}</h2>
          <ContactForm type={speaking ? "Speaking invitation" : q(query, "category")} subject={q(query, "subject")} />
        </div>
      </section>
      {!!gallery.length && (
        <section className="shell section">
          <SectionHead title="From previous engagements" />
          <Gallery items={gallery} />
        </section>
      )}
    </>
  );
}

export async function GalleryPage({ query }: { query: Query }) {
  const rows = await collection("gallery_items");
  const category = q(query, "category");
  const visible = rows.filter((row) => !category || row.category === category);
  return (
    <>
      <Heading
        title="Certificates & Gallery"
        description="Original verified certificates, credentials, and visual milestones from leadership fellowships, mentorships, and community impact programs. Click any item to view full screen."
      />
      <section className="shell section">
        <CategoryLinks path="/gallery" active={category} values={categories(rows)} />
        {visible.length ? (
          <Gallery items={visible} key={category} />
        ) : (
          <Empty title="No gallery items here yet">Certificates and photographs will appear here when published.</Empty>
        )}
      </section>
    </>
  );
}

export async function Resources({ query }: { query: Query }) {
  const rows = await collection("resources");
  const category = q(query, "category");
  const slug = q(query, "resource");
  const resource = rows.find((row) => row.gated && row.slug === slug);
  const visible = rows.filter((row) => !category || row.category === category);

  return (
    <>
      <Heading
        title="Free Resources"
        description="Practical toolkits, career frameworks, and learning guides designed to support personal and organizational capability building."
      />
      <section className="shell section">
        {resource && (
          <div id="resource-form" className="panel resource-signup">
            <h2>Get {resource.title}</h2>
            <p>Enter your email and confirm your subscription to access the download.</p>
            <AsyncForm endpoint="/api/subscribe" label="Send me the link">
              <SubscribeFields resource={slug} />
            </AsyncForm>
          </div>
        )}
        <CategoryLinks path="/resources" active={category} values={categories(rows)} />
        {visible.length ? (
          <div className="cards">
            {visible.map((row) => (
              <article className="panel resource" key={row.id}>
                {row.image && <Photo src={row.image} alt={text(row, "alt")} />}
                <p className="eyebrow">{row.category || "Resource"}</p>
                <h3>{row.title}</h3>
                <p>{row.summary}</p>
                <a className="button outline" href={"/api/download/" + row.slug}>
                  {row.gated ? "Access resource" : "Download"}
                </a>
              </article>
            ))}
          </div>
        ) : (
          <Empty title="Resources are in preparation">
            Guides, worksheets, and strategy templates will appear here once published.
          </Empty>
        )}
      </section>
    </>
  );
}

export function NewsletterPage({ site, query }: { site: Settings; query: Query }) {
  const mode = q(query, "action");
  const token = q(query, "t");
  const slug = q(query, "resource");
  if (!["confirm", "unsubscribe", "access"].includes(mode) || !/^\d{1,12}\.[a-f0-9]{64}$/.test(token)) {
    return (
      <>
        <Heading
          title="Newsletter"
          description={
            mode
              ? "This link is incomplete. Submit the form below for a fresh link."
              : "Insights, reflections, workshop updates, and curated learning resources in your inbox."
          }
        />
        <Newsletter site={site} />
      </>
    );
  }
  return (
    <>
      <Heading
        title={
          mode === "unsubscribe"
            ? "Unsubscribe from the newsletter"
            : mode === "access"
              ? "Access your resource"
              : "Confirm your subscription"
        }
        description={
          mode === "unsubscribe"
            ? "Confirm below to stop receiving newsletter emails."
            : "Continue below to verify your email address."
        }
      />
      <section className="shell section">
        <AsyncForm
          endpoint="/api/newsletter"
          label={mode === "unsubscribe" ? "Unsubscribe" : "Confirm email"}
          reset={false}
          download={mode !== "unsubscribe" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? "/api/download/" + slug : ""}
        >
          <input type="hidden" name="mode" value={mode} />
          <input type="hidden" name="token" value={token} />
        </AsyncForm>
      </section>
    </>
  );
}

export function Privacy() {
  return (
    <>
      <Heading title="Privacy" description="How the site handles inquiries, reviews, subscriptions, and usage data." />
      <div className="reading section stack">
        <section>
          <h2>Messages and reviews</h2>
          <p>
            The site uses contact details solely to respond to inquiries and verify eligibility to review a course. Approved reviews display your name, rating, and feedback; your email address stays private.
          </p>
        </section>
        <section>
          <h2>Newsletter</h2>
          <p>
            The site records explicit consent and sends an email confirmation when delivery is configured. You can withdraw consent at any time using the unsubscribe link in any newsletter email.
          </p>
        </section>
        <section>
          <h2>Site usage</h2>
          <p>
            The site measures anonymized page visits and registration clicks and uses short-lived rate limits to prevent abuse.
          </p>
          {process.env.GA_ID && <PrivacyPreference />}
        </section>
        <section>
          <h2>Questions</h2>
          <p>
            Use the{" "}
            <Link className="text-link" href="/contact">
              contact form
            </Link>{" "}
            to ask about your information.
          </p>
        </section>
      </div>
    </>
  );
}
