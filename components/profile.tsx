import Link from "next/link";
import { ChevronDown, Download, ExternalLink } from "lucide-react";
import type { Row } from "@/db";
import { collection } from "@/lib/content";
import { href, text, type Settings } from "@/lib/domain";
import { impactCases, impactFigures } from "@/lib/impact-data";
import { coreCompetencies } from "@/lib/profile-data";
import { Breadcrumb, Copy, Empty, Photo, SectionHead } from "./editorial";
import { LineArt } from "./line-art";

function OrganizationLogo({ image, title }: { image: unknown; title: string }) {
  const logo = href(image);
  const mark = title.replace(/\(.*?\)/g, "").trim().split(/\s+/).slice(0, 3).map((word) => word[0]?.toUpperCase()).join("");
  return (
    <span className="organization-mark" aria-hidden="true">
      {logo ? <Photo src={logo} /> : mark}
    </span>
  );
}

export function Organizations({ rows }: { rows: Row[] }) {
  return (
    <ul className="organization-roster">
      {rows.map((row) => (
        <li id={"organization-" + row.id} key={row.id}>
          <OrganizationLogo image={row.image} title={text(row, "title")} />
          <div>
            {href(row.url) ? (
              <a href={href(row.url)} rel="noreferrer" target="_blank">{row.title}<ExternalLink size={12} aria-hidden="true" /></a>
            ) : <strong>{row.title}</strong>}
            {(row.role || row.period) && <p>{[row.role, row.period].filter(Boolean).join(" · ")}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

const roleLabels: Record<string, string> = {
  experience: "Professional experience",
  fellowship: "Fellowship & training",
  volunteering: "Community & volunteering",
};

export function WorkEntry({ row, heading, compact = false }: { row: Row; heading?: string; compact?: boolean }) {
  const title = text(row, "title");
  const organization = text(row, "organization");
  const skills = text(row, "skills").split(/\r?\n/).filter(Boolean);
  return (
    <article className={compact ? "work-entry compact" : "work-entry"} id={"role-" + row.id} data-reveal="">
      <div className="work-entry-head">
        <OrganizationLogo image={row.logo} title={organization || title} />
        <div>
          <p className="eyebrow">{organization || roleLabels[text(row, "kind")] || "Experience"}</p>
          <h3>{heading || title}</h3>
          {heading && <p className="work-role">{title}</p>}
          {row.date_label && <p className="meta">{row.date_label}</p>}
        </div>
      </div>
      {row.impact && <p className="work-result">{row.impact}</p>}
      {(row.body || row.image || skills.length > 0 || href(row.url)) && (
        <details className="disclosure">
          <summary>
            {compact ? "Project details" : "Role details"}
            <span className="sr"> for {heading || title}</span>
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <div className="disclosure-body">
            <Copy source={row.body} />
            {!!skills.length && (
              <ul className="skill-list" aria-label="Skills developed">
                {skills.map((skill) => <li key={skill}>{skill}</li>)}
              </ul>
            )}
            {row.image && <div className="record-photo"><Photo src={row.image} alt={text(row, "alt")} /></div>}
            {href(row.url) && <a className="text-link" href={href(row.url)} target="_blank" rel="noreferrer">Organization website</a>}
          </div>
        </details>
      )}
    </article>
  );
}

export function Timeline({ rows }: { rows: Row[] }) {
  return (
    <ol className="journey-timeline">
      {rows.map((row) => (
        <li key={row.id} data-reveal="">
          <p className="eyebrow">{row.date_label || row.category}</p>
          <h3>{row.title}</h3>
          {row.issuer && <p className="meta">{row.issuer}</p>}
          {(row.body || row.signatory || href(row.url)) && (
            <details className="disclosure">
              <summary>Details<span className="sr"> for {row.title}</span><ChevronDown size={18} aria-hidden="true" /></summary>
              <div className="disclosure-body">
                <Copy source={row.body} />
                {row.signatory && <p className="meta">{row.signatory}</p>}
                {href(row.url) && <a className="text-link" href={href(row.url)} target="_blank" rel="noreferrer">View source</a>}
              </div>
            </details>
          )}
        </li>
      ))}
    </ol>
  );
}

export function StoryVisual({ portrait, alt }: { portrait: string; alt: string }) {
  return portrait ? (
    <figure className="story-visual photo"><Photo src={portrait} alt={alt} /></figure>
  ) : (
    <div className="story-visual geometry" aria-hidden="true">
      <LineArt motif="orbits" />
    </div>
  );
}

export function BioLinks({ site }: { site: Settings }) {
  return (
    <div className="actions downloads">
      {href(site.professional_bio) && <a className="button outline" href={href(site.professional_bio)}><Download size={16} aria-hidden="true" /> Professional biography</a>}
      {href(site.media_kit) && <a className="button outline" href={href(site.media_kit)}><Download size={16} aria-hidden="true" /> Media kit</a>}
    </div>
  );
}

export async function About({ site }: { site: Settings }) {
  const [education, experience, awards, timeline, media] = await Promise.all([
    collection("qualifications"),
    collection("professional_experiences"),
    collection("achievements"),
    collection("milestones"),
    collection("media_mentions"),
  ]);
  const work = experience.filter((row) => !row.kind || row.kind === "experience");
  const community = experience.filter((row) => row.kind === "volunteering" || row.kind === "fellowship");
  const honors = awards.filter((row) => !href(row.image));
  const name = site.author_name || site.site_title;
  return (
    <>
      <section className="story-head">
        <div className="shell">
          <Breadcrumb title="About" />
          <div className="story-grid">
            <div>
              <p className="eyebrow section-kicker">About · Karachi, Pakistan</p>
              <h1>Meet {name}.</h1>
              <Copy source={site.intro_body} />
              <div className="actions">
                <a className="button" href={timeline.length ? "#timeline" : "#background"}>Explore my journey</a>
                {href(site.linkedin) && <a className="text-link" href={href(site.linkedin)} target="_blank" rel="noreferrer">LinkedIn</a>}
              </div>
            </div>
            <StoryVisual portrait={href(site.about_image) || href(site.hero_image)} alt={site.about_image_alt || site.hero_alt || name} />
          </div>
        </div>
      </section>
      <div className="shell section story-layout">
        <nav className="story-nav" aria-label="About sections">
          <a href="#background">Background &amp; vision</a>
          {!!timeline.length && <a href="#timeline">Milestones</a>}
          {!!education.length && <a href="#education">Education</a>}
          {!!work.length && <a href="#experience">Professional experience</a>}
          {!!community.length && <a href="#fellowships">Volunteering &amp; fellowships</a>}
          <Link prefetch={false} href="/experience#organizations">Organizations</Link>
          <a href="#competencies">Skills &amp; interests</a>
          {(honors.length > 0 || site.show_gallery === "1") && <a href="#certificates">Credentials</a>}
          {!!media.length && <a href="#media">Media &amp; speaking</a>}
        </nav>
        <div className="story-chapters">
          <section id="background">
            <p className="eyebrow section-kicker">Background &amp; vision</p>
            <h2>From education to strategy.</h2>
            <Copy source={site.background} />
            {site.intro_quote && <blockquote>{site.intro_quote}</blockquote>}
            {site.philosophy && <div id="philosophy"><Copy source={site.philosophy} /></div>}
            {site.beyond && <Copy source={site.beyond} />}
            <BioLinks site={site} />
          </section>
          {!!timeline.length && (
            <section id="timeline">
              <SectionHead title="Milestones along the way" />
              <Timeline rows={timeline} />
            </section>
          )}
          {!!education.length && (
            <section id="education">
              <SectionHead title="Education" />
              <Timeline rows={education} />
            </section>
          )}
          {!!work.length && (
            <section id="experience">
              <SectionHead title="Professional experience" link={{ label: "Explore all roles", href: "/experience" }} />
              {work.slice(0, 3).map((row) => <WorkEntry row={row} key={row.id} />)}
            </section>
          )}
          {!!community.length && (
            <section id="fellowships">
              <SectionHead title="Volunteering & fellowships" link={{ label: "Explore all programs", href: "/experience#community" }} />
              {community.slice(0, 3).map((row) => <WorkEntry row={row} key={row.id} />)}
            </section>
          )}
          <section id="competencies">
            <SectionHead title="Skills & interests" />
            <div className="competency-grid">
              {coreCompetencies.map(({ group, items }) => (
                <div className="competency-box" key={group}>
                  <h3>{group}</h3>
                  <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              ))}
            </div>
          </section>
          {(honors.length > 0 || site.show_gallery === "1") && (
            <section id="certificates">
              <SectionHead title="Credentials & recognition" link={site.show_gallery === "1" ? { label: "Open certificate gallery", href: "/gallery" } : undefined} />
              {!!honors.length && <Timeline rows={honors} />}
            </section>
          )}
          {!!media.length && <section id="media"><SectionHead title="Media & speaking" /><Timeline rows={media} /></section>}
        </div>
      </div>
    </>
  );
}

export async function Experience() {
  const [rows, organizations] = await Promise.all([collection("professional_experiences"), collection("organizations")]);
  const work = rows.filter((row) => !row.kind || row.kind === "experience");
  const community = rows.filter((row) => row.kind === "volunteering");
  const programs = rows.filter((row) => row.kind === "fellowship");
  const sections = [
    { id: "work", title: "Professional roles", rows: work },
    { id: "community", title: "Community & volunteering", rows: community },
    { id: "programs", title: "Fellowships & training", rows: programs },
  ];

  return (
    <>
      <section className="story-head">
        <div className="shell">
          <Breadcrumb title="Experience" />
          <div className="story-grid">
            <div>
              <p className="eyebrow section-kicker">Experience</p>
              <h1>Learning through <em>the work.</em></h1>
              <p className="lead">Research, facilitation, operations, and career guidance, built through roles in businesses and community programs across Karachi.</p>
            <div className="actions"><a className="button" href={"#" + (sections.find((section) => section.rows.length)?.id || "organizations")}>Explore roles</a><Link prefetch={false} className="text-link" href="/social-impact">See social impact</Link></div>
            </div>
            <div className="story-visual geometry experience-visual" aria-hidden="true"><LineArt motif="routes" /></div>
          </div>
        </div>
      </section>
      <div className="shell section story-layout">
        <nav className="story-nav" aria-label="Experience sections">
          {sections.filter((section) => section.rows.length).map(({ id, title }) => <a key={id} href={"#" + id}>{title}</a>)}
          <a href="#organizations">Organizations</a>
        </nav>
        <div className="story-chapters">
          {sections.filter((section) => section.rows.length).map(({ id, title, rows }) => (
            <section key={id} id={id}>
              <SectionHead title={title} />
              {rows.map((row) => <WorkEntry row={row} key={row.id} />)}
            </section>
          ))}
          {!rows.length && <Empty title="Experience records are in preparation">Published roles will appear here.</Empty>}
        </div>
      </div>
      <section className="section wash" id="organizations">
        <div className="shell">
          <SectionHead title="Organizations & programs" description="Work, volunteer roles, and programs I’ve taken part in." />
          <Organizations rows={organizations} />
        </div>
      </section>
    </>
  );
}

export function ImpactNumbers({ values, linkCases = false }: { values: { value: string; label: string; id?: string }[]; linkCases?: boolean }) {
  return (
    <ul className="impact-numbers">
      {values.map(({ value, label, id }) => (
        <li key={label} data-reveal="">
          <span className="sr">{value}</span>
          <strong aria-hidden="true" data-count={value}>{value}</strong>
          {id ? <a href={(linkCases ? "" : "/social-impact") + "#" + id}>{label}</a> : <span>{label}</span>}
        </li>
      ))}
    </ul>
  );
}

export function SocialImpact() {
  return (
    <>
      <section className="story-head impact-page-head">
        <div className="shell">
          <Breadcrumb title="Social Impact" />
          <div className="story-grid">
            <div>
              <p className="eyebrow section-kicker">Social impact</p>
              <h1>Learning, access, <em>and opportunity.</em></h1>
              <p className="lead">What I’ve contributed to through civic education, digital inclusion, research, and practical support for students.</p>
              <div className="actions"><a className="button" href="#impact-projects">Explore the initiatives</a></div>
            </div>
            <div className="story-visual geometry impact-visual" aria-hidden="true"><LineArt motif="contours" /></div>
          </div>
        </div>
      </section>
      <section className="impact-band section" aria-label="Documented reach">
        <div className="shell impact-layout">
          <div><p className="eyebrow section-kicker">Documented reach</p><h2>Impact in numbers.</h2></div>
          <ImpactNumbers values={[...impactFigures]} linkCases />
        </div>
      </section>
      <section className="shell section" id="impact-projects">
        <SectionHead title="Community initiatives" />
        <div className="case-studies">
          {impactCases.map((entry) => (
            <article className="case-study" id={entry.id} key={entry.id} data-reveal="">
              <div className="case-identity">
                <p className="eyebrow">{entry.theme}</p>
                <h3>{entry.title}</h3>
                {entry.title !== entry.organization && <p>{entry.organization}</p>}
                {entry.period && <p className="meta">{entry.period}</p>}
              </div>
              <dl className="case-details">
                <div><dt>Objective</dt><dd>{entry.objective}</dd></div>
                <div><dt>My contribution</dt><dd>{entry.contribution}</dd></div>
                {entry.outcome && <div><dt>Documented outcome</dt><dd>{entry.outcome}</dd></div>}
              </dl>
            </article>
          ))}
        </div>
      </section>
      <section className="wash section">
        <div className="shell section-head">
          <h2>Work with me on a community initiative.</h2>
          <Link prefetch={false} className="button" href="/contact">Let’s connect</Link>
        </div>
      </section>
    </>
  );
}
