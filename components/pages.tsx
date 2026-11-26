import Link from "next/link";
import { Briefcase, CalendarDays, Clock, Mail, MessageCircle, Mic, MonitorPlay } from "lucide-react";
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
import { publicFormsConfigured } from "@/lib/security";
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
  ReadingContents,
  Schema,
  SectionHead,
} from "./editorial";
import { Gallery } from "./gallery";
import { LineArt } from "./line-art";
import { BioLinks, Timeline } from "./profile";
import { AsyncForm, ReadTools, Registration, Reviews, SubscribeFields } from "./interactions";
import { PrivacyPreference } from "./site-metrics";

export async function CataloguePage({ type, site, query }: { type: Catalogue; site: Settings; query: Query }) {
  const allItems = await list(type);
  const filter = q(query, "category");
  const availability = q(query, "availability");
  const keyword = q(query, "q");

  const filtered = allItems.filter(
    (row) =>
      (!filter || row.category === filter) &&
      (!availability || row.availability === availability) &&
      (!keyword ||
        [row.title, row.summary, row.category, row.instructor, row.body].join(" ").toLowerCase().includes(keyword.toLowerCase())),
  );

  const articles = type === "articles";
  const courses = type === "courses";
  const route = articles ? "/reflections" : "/" + type;
  const featured = articles && !filter && !keyword ? allItems.find((row) => row.featured) ?? allItems[0] : undefined;
  const featuredCourses = courses && !filter && !keyword && !availability ? filtered.filter((row) => row.featured).slice(0, 3) : [];
  const popular =
    articles && !filter && !keyword
      ? allItems
          .filter((row) => Number(row.views) > 0)
          .sort((a, b) => Number(b.views) - Number(a.views))
          .slice(0, 3)
      : [];

  const heading = articles ? "Insights & reflections" : courses ? "Courses & workshops" : "Publications";
  const description = articles
    ? "Professional insights, articles, personal reflections, and newsletters on capability building, entrepreneurship, leadership, and socioeconomic development."
    : courses
      ? "Guided courses and interactive workshops on career readiness, leadership development, entrepreneurship, and capability building."
      : "Published reports, research briefs, articles, and authorized resources.";

  return (
    <>
      <Heading title={heading} description={description} motif={articles ? "pages" : courses ? "contours" : undefined} />
      <section className="shell section archive">
        {!!allItems.length && <h2 className="sr">{articles ? "Articles" : courses ? "Course catalogue" : "Published work"}</h2>}
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

        {(courses || articles) && !!allItems.length && (
          <p className="meta results">
            {filtered.length} {courses ? (filtered.length === 1 ? "course" : "courses") : (filtered.length === 1 ? "article" : "articles")}
          </p>
        )}

        {featured && (
          <div className="journal-feature">
            <JournalCard row={featured} />
          </div>
        )}
        {!!featuredCourses.length && (
          <section className="featured-courses">
            <SectionHead title="Featured courses" />
            <div className="cards">{featuredCourses.map((row) => <CourseCard row={row} key={row.id} />)}</div>
          </section>
        )}

        {articles && filtered.some((row) => row.id !== featured?.id) && (
          <SectionHead title={filter || keyword ? "Search results" : "Latest insights & reflections"} />
        )}

        {filtered.length ? (
          <div className="cards">
            {filtered
              .filter((row) => row.id !== featured?.id && !featuredCourses.some((course) => course.id === row.id))
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
              <h2>Courses are in preparation.</h2>
              <p className="lead" style={{ marginTop: ".6rem" }}>
                Public courses will appear here when schedules and curricula are ready. Inquire about a workshop for your institution or student community.
              </p>
              <div className="actions" style={{ marginTop: "1.25rem" }}>
                <Link prefetch={false} className="button" href="/contact?category=Course%20or%20workshop%20registration">
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
              <h2>New writing is in preparation.</h2>
              <p className="lead" style={{ marginTop: ".6rem" }}>
                Essays and reflections will appear here when they’re published. Explore the community projects that inform the writing.
              </p>
              <div className="actions" style={{ marginTop: "1.25rem" }}>
                <Link prefetch={false} className="button" href="/social-impact">Explore the projects</Link>
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
              ) : href(row.image) ? (
                <Photo src={row.image} alt={text(row, "alt")} hero />
              ) : (
                <div className="cover-art"><LineArt motif="contours" /></div>
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
          <ReadingContents source={row.body} />
          <Copy source={row.body} article />
        </div>
        {!preview && <ReadTools url={url} title={text(row, "title")} />}
        {author && (
          <div className="byline">
            <strong>{author}</strong>
            {author === site.author_name && (
              <Link prefetch={false} className="text-link" href="/about">
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
        motif={speaking ? "pages" : "orbits"}
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
                <small>View profile</small>
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
            <Link prefetch={false} className="contact-option" href="/speaking">
              <Mic size={20} />
              <span>
                <strong>Speaking &amp; collaboration</strong>
                <small>Explore workshop &amp; panel options</small>
              </span>
            </Link>
          )}
        </div>
        <div className="panel contact-panel">
          {publicFormsConfigured() ? (
            <>
              <h2>{speaking ? "Invite Madiha" : "Send a message"}</h2>
              <ContactForm type={speaking ? "Speaking invitation" : q(query, "category")} subject={q(query, "subject")} />
            </>
          ) : (
            <>
              <h2>Reach out directly</h2>
              <p>Send a note about the people you’re working with and what you’d like to accomplish together.</p>
              <div className="actions downloads">
                {site.email && <a className="button" href={"mailto:" + site.email}>Send an email</a>}
                {!site.email && href(site.linkedin) && <a className="button" href={href(site.linkedin)} target="_blank" rel="noreferrer">Connect on LinkedIn</a>}
              </div>
            </>
          )}
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
        title="Certificates & recognition"
        description="Original credentials from leadership programs, mentorships, and community outreach. Select a certificate to read it in the full-screen viewer."
        motif="pages"
      />
      <section className="shell section gallery-section">
        <h2 className="sr">Credential gallery</h2>
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
            <Link prefetch={false} className="text-link" href="/contact">
              contact page
            </Link>{" "}
            to ask about your information.
          </p>
        </section>
      </div>
    </>
  );
}
