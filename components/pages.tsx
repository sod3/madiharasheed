import {BookOpen,Feather,MessagesSquare,Mail,MessageCircle,Mic,CalendarDays,Clock,MonitorPlay,Download} from "lucide-react";
import {all,type Row} from "@/db";
import {absolute,collection,list,type Catalogue} from "@/lib/content";
import {categories,courseStates,date,href,images,openCourse,phone,q,readings,stars,text,whatsapp,type Query,type Settings} from "@/lib/domain";
import {exampleModules} from "@/lib/sample";
import {Breadcrumb,CategoryLinks,ContactForm,Copy,CourseCard,Empty,Filters,Heading,JournalCard,Lines,Newsletter,Photo,Schema,SectionHead,Social} from "./editorial";
import {AsyncForm,Gallery,PrivacyPreference,ReadTools,Registration,Reviews,SubscribeFields} from "./interactions";

export async function Home({site}:{site:Settings}) {
  const [courses,articles,organizations,achievements,testimonials]=await Promise.all([list("courses"),list("articles"),collection("organizations"),collection("achievements"),collection("testimonials")]);
  const photo=href(site.hero_image),author=site.author_name;
  const stats=site.statistics.split(/\r?\n/).map(line=>line.split("|").map(value=>value.trim())).filter(([number,label])=>number&&label);
  const featured=courses.filter(row=>row.featured);
  const journal=[...articles].sort((a,b)=>Number(b.featured??0)-Number(a.featured??0)).slice(0,3);
  const topics=[
    {label:"Courses & workshops",path:"/courses",summary:"Practice the craft of writing.",Icon:BookOpen},
    {label:"Reflections",path:"/reflections",summary:"Read essays and observations.",Icon:Feather},
    {label:"Speaking & collaboration",path:site.show_speaking==="1"?"/speaking":"/contact",summary:"Start a conversation.",Icon:MessagesSquare},
  ];
  const honors=achievements.filter(row=>row.featured).slice(0,3);
  const whats=whatsapp(site.whatsapp,"Assalamualaikum, I would like to get in touch.");
  return <>
    {author && <Schema value={{"@context":"https://schema.org","@type":"Person",name:author,jobTitle:"Writer and educator",url:absolute("/"),
      ...(photo?{image:absolute(photo)}:{}),sameAs:[site.linkedin,site.instagram,site.facebook,site.youtube].map(href).filter(url=>url.startsWith("https://"))}}/>}
    <section className="hero"><div className="shell hero-grid">
      <div><p className="eyebrow hero-label">{author?author+" · ":""}{site.hero_label}</p>
        <h1><span>{site.hero_line_1}</span><span>{site.hero_line_2}</span><em>{site.hero_line_3}</em></h1><p className="hero-description">{site.hero_description}</p>
        <div className="actions"><a className="button" href="/courses">Explore My Courses</a><a className="button outline" href="/about">Discover My Story</a></div>
      </div><figure className="hero-photo"><div className="frame"><Photo src={photo||images.hero} alt={site.hero_alt||(photo?"Author portrait":"Hands turning an ivory notebook page beside a sunlit window")} hero/></div>
        {!photo&&<figcaption>Editorial image · Author portrait pending</figcaption>}</figure>
    </div></section>
    {stats.length>0&&<div className="shell stats">{stats.map(([number,label],index)=><div key={index}><strong>{number}</strong><span>{label}</span></div>)}</div>}
    <div className="discovery"><div className="shell discovery-grid">{topics.map(({label,path,summary,Icon})=><a href={path} key={path}>
      <span className="discovery-icon"><Icon size={21} strokeWidth={1.65}/></span><span><strong>{label}</strong><small>{summary}</small></span></a>)}</div></div>
    {!!organizations.length&&<section className="shell section"><SectionHead title="Organizations I’ve worked with"/>
      <div className="logos">{organizations.map(row=><a href={"/about#organization-"+row.id} key={row.id}>{row.image?<Photo src={row.image} alt={text(row,"alt")||text(row,"title")}/>:row.title}</a>)}</div></section>}
    <section className="shell section intro"><div><Photo src={site.about_image||images.craft} alt={site.about_image_alt||(site.about_image?"Author portrait":"An open book, notebook, and cup on a writing table")}/></div>
      <div><p className="eyebrow">About the author</p><h2>{site.intro_title}</h2>
        {site.intro_body?<Copy source={site.intro_body}/>:<p className="lead">Explore the ideas and practices behind the writing, from paying closer attention to everyday life to sharing what we learn with others.</p>}
        {site.intro_quote&&<blockquote>{site.intro_quote}</blockquote>}<a href="/about" className="text-link">Read My Full Story</a></div>
    </section>
    {courses.length>0&&<section className="section wash"><div className="shell">
      <SectionHead title="Explore learning opportunities" description="Writing courses and workshops for curious learners." link={{label:"View All Courses",href:"/courses"}}/>
      <div className="cards">{(featured.length?featured:courses).slice(0,3).map(row=><CourseCard key={row.id} row={row}/>)}</div>
    </div></section>}
    {journal.length>0&&<section className="shell section"><SectionHead title="Reflections and perspectives" description="Essays on writing, learning, and things worth noticing." link={{label:"Visit Reflections",href:"/reflections"}}/>
      <div className="journal-layout"><JournalCard row={journal[0]}/><div className="journal-side">{journal.slice(1).map(row=><JournalCard key={row.id} row={row} compact/>)}</div></div></section>}
    {!!honors.length&&<section className="shell section"><SectionHead title="Awards and achievements" link={{label:"Explore My Achievements",href:"/about#achievements"}}/><Timeline rows={honors}/></section>}
    {site.show_testimonials==="1"&&!!testimonials.length&&<section className="shell section"><SectionHead title="Voices from the community"/>
      <div className="cards">{testimonials.map(row=><figure className="panel" key={row.id}>
        {row.rating&&<p className="stars" aria-label={row.rating+" out of 5 stars"}>{stars(Number(row.rating))}</p>}<blockquote>{row.body}</blockquote>
        <figcaption className="testimonial-byline">{row.image&&<Photo src={row.image} alt={text(row,"alt")}/>}<span><strong>{row.name}</strong><small>{[row.role,row.relationship].filter(Boolean).join(" · ")}</small></span></figcaption>
      </figure>)}</div></section>}
    <Newsletter site={site}/><section className="closing shell section"><h2>Meaningful conversations begin with a connection.</h2>
      <div className="actions"><a className="button" href="/contact">Get in Touch</a><a className="button outline" href="/courses">Explore Courses</a>
        {whats&&<a className="text-link" href={whats} target="_blank" rel="noreferrer">Connect on WhatsApp</a>}</div></section>
  </>;
}
function Timeline({rows}:{rows:Row[]}){
  return <div className="timeline">{rows.map(row=><article key={row.id}><p className="eyebrow">{row.date_label||row.category}</p><h3>{row.title}</h3>
    {row.issuer&&<p className="muted">{row.issuer}</p>}{row.body&&<Copy source={row.body}/>}
    {href(row.url)&&<a className="text-link" href={href(row.url)} rel="noreferrer" target="_blank">View details</a>}
  </article>)}</div>;
}
function BioLinks({site}:{site:Settings}){
  return <div className="actions downloads">
    {href(site.professional_bio)&&<a className="button outline" href={href(site.professional_bio)}><Download size={17}/> Professional biography</a>}
    {href(site.media_kit)&&<a className="button outline" href={href(site.media_kit)}><Download size={17}/> Media kit</a>}
  </div>;
}
export async function About({site}:{site:Settings}){
  const [education,organizations,experience,awards,timeline,media]=await Promise.all([collection("qualifications"),collection("organizations"),collection("professional_experiences"),collection("achievements"),collection("milestones"),collection("media_mentions")]);
  const portrait=site.about_image||site.hero_image;
  const links=[["background","Personal background"],["education","Education"],["experience","Experience"],["achievements","Awards and honors"],
    ...(site.philosophy?[["philosophy","My philosophy"]]:[]),...(site.beyond?[["beyond","Beyond the profession"]]:[]),
    ...(timeline.length?[["timeline","Career timeline"]]:[]),...(media.length?[["media","Media recognition"]]:[])];
  return <>
    <section className="page-heading"><div className="shell"><Breadcrumb title="About"/>
      <div className="detail-grid"><div><p className="eyebrow">About the author</p><h1>{site.author_name||"The personal journey"}</h1>
        {site.intro_body?<Copy source={site.intro_body}/>:<p className="lead">A home for writing, teaching, and the ideas that come from a lifetime of learning.</p>}
        {site.intro_quote&&<blockquote>{site.intro_quote}</blockquote>}<BioLinks site={site}/></div>
        <figure className="about-photo"><Photo src={portrait||images.hero} alt={site.about_image_alt||site.hero_alt||"A notebook at a writing desk"} hero/>
          {!portrait&&<figcaption>Editorial image · Author portrait pending</figcaption>}</figure></div></div></section>
    <div className="shell section split about"><nav className="about-nav panel" aria-label="About sections">{links.map(([id,label])=><a href={"#"+id} key={id}>{label}</a>)}</nav>
      <div className="stack">
        <section id="background"><h2>Personal background</h2>{site.background?<Copy source={site.background}/>:<p className="muted">The author’s biography and personal background will appear here once shared.</p>}</section>
        <section id="education"><h2>Educational journey</h2>{education.length?<Timeline rows={education}/>:<p className="muted">Verified education and training details will appear here.</p>}</section>
        <section id="experience"><h2>Professional experience</h2>
          {experience.length ? <div className="accordion">{experience.map(row=><details key={row.id}><summary>{[row.title,row.organization,row.date_label].filter(Boolean).join(" · ")}</summary>
            <div>{row.logo&&<div className="org-logo"><Photo src={row.logo} alt={text(row,"organization")}/></div>}<Copy source={row.body}/>
              {row.impact&&<><h3>Professional impact</h3><Copy source={row.impact}/></>}{row.image&&<div className="record-photo"><Photo src={row.image} alt={text(row,"alt")}/></div>}
              {href(row.url)&&<a className="text-link" href={href(row.url)} rel="noreferrer" target="_blank">Related information</a>}</div></details>)}</div>:
            <p className="muted">Confirmed roles, contributions, and organizations will appear here.</p>}
          {!!organizations.length&&<div className="logos">{organizations.map(row=><article className="panel" key={row.id} id={"organization-"+row.id}>
            {row.image&&<Photo src={row.image} alt={text(row,"alt")}/>}<h3>{row.title}</h3>{href(row.url)&&<a className="text-link" href={href(row.url)} target="_blank" rel="noreferrer">Organization website</a>}</article>)}</div>}
        </section>
        <section id="achievements"><h2>Awards and honors</h2>
          {awards.length?categories(awards).map(category=>{
            const rows=awards.filter(row=>row.category===category),certificates=rows.filter(row=>row.image);
            return <div className="award-group" key={category}><h3>{category}</h3><Timeline rows={rows}/>{!!certificates.length&&<Gallery items={certificates}/>}</div>;
          }):<Empty title="Achievements pending">Verified honors, recognition, and certificates will appear here.</Empty>}
        </section>
        {site.philosophy&&<section id="philosophy"><h2>My philosophy</h2><Copy source={site.philosophy}/></section>}
        {site.beyond&&<section id="beyond"><h2>Beyond the profession</h2><Copy source={site.beyond}/></section>}
        {!!timeline.length&&<section id="timeline"><h2>Professional timeline</h2><Timeline rows={timeline}/></section>}
        {!!media.length&&<section id="media"><h2>Media and recognition</h2><Timeline rows={media}/></section>}
      </div>
    </div>
  </>;
}

export async function CataloguePage({type,site,query}:{type:Catalogue;site:Settings;query:Query}){
  const allItems=await list(type),filter=q(query,"category"),availability=q(query,"availability"),keyword=q(query,"q").toLowerCase();
  const filtered=allItems.filter(row=>(!filter||row.category===filter) && (!availability||row.availability===availability) &&
    (!keyword||[row.title,row.summary,row.category,row.instructor,row.body].join(" ").toLowerCase().includes(keyword)));
  const articles=type==="articles",courses=type==="courses",route=articles?"/reflections":"/"+type;
  const featured=articles&&!filter&&!keyword ? allItems.find(row=>row.featured)??allItems[0] : undefined;
  const popular=articles&&!filter&&!keyword ? allItems.filter(row=>Number(row.views)>0).sort((a,b)=>Number(b.views)-Number(a.views)).slice(0,3):[];
  const heading=articles?"Reflections":courses?"Courses":"Publications";
  const description=articles?"Essays and observations on writing, learning, and the details of everyday life.":
    courses?"Guided courses and workshops to help you write with more confidence, clarity, and care.":"Books, essays, articles, and other work available to read or explore.";
  return <><Heading title={heading} description={description}/><section className="shell section archive">
    {type==="publications"?<CategoryLinks path={route} active={filter} values={categories(allItems)}/>:<Filters path={route} query={keyword} category={filter} options={categories(allItems)} availability={availability} states={courses?courseStates:[]}/>}
    {courses&&!!allItems.length&&<p className="meta results">{filtered.length} {filtered.length===1?"course":"courses"}{allItems.every(row=>row.demo)?" in preview":""}</p>}
    {featured&&<div className="journal-feature"><JournalCard row={featured}/></div>}
    {articles&&filtered.some(row=>row.id!==featured?.id)&&<SectionHead title={filter||keyword?"Search results":"Latest reflections"}/>}
    {filtered.length?<div className="cards">{filtered.filter(row=>row.id!==featured?.id).map(row=>articles?<JournalCard key={row.id} row={row}/>:courses?<CourseCard key={row.id} row={row}/>:
      <article className="publication-card" key={row.id}><a className="cover" href={"/publications/"+row.slug}><Photo src={row.image} alt={text(row,"alt")}/></a><p className="eyebrow">{row.category||"Publication"}</p>
        <h3><a href={"/publications/"+row.slug}>{row.title}</a></h3><p className="meta">{[row.publisher,date(row.issue_date)].filter(Boolean).join(" · ")}</p>
        <p>{row.summary}</p><a className="text-link" href={"/publications/"+row.slug}>View publication</a></article>)}</div>:
      <Empty title={courses&&allItems.length?"No courses match your filters":filter||keyword?"No matching results":heading+" are coming soon"}>{filter||keyword||availability?"Try another keyword or clear the filters.":"New work will appear here when published."}</Empty>}
    {!!popular.length&&<div className="inner-section"><SectionHead title="Popular reflections"/><div className="cards">{popular.map(row=><JournalCard key={row.id} row={row}/>)}</div></div>}
  </section>{articles&&<Newsletter site={site}/>}</>;
}
export async function CourseDetail({row,site,preview,query}:{row:Row;site:Settings;preview:boolean;query:Query}){
  const [modules,batches,reviews,distribution]=row.demo?[exampleModules[row.id]??[],[],[],[]]:await Promise.all([
    all<{title:string;body:string}>("SELECT title,body FROM course_modules WHERE course_id=? ORDER BY position,id",row.id),
    all("SELECT * FROM course_batches WHERE course_id=? ORDER BY starts_on IS NULL,starts_on,id",row.id),
    all("SELECT r.id,r.name,r.rating,r.title,r.body,r.reply,r.created_at,(SELECT COUNT(*) FROM review_votes v WHERE v.review_id=r.id) AS helpful FROM reviews r WHERE r.course_id=? AND r.status='published' ORDER BY r.created_at DESC,r.id DESC LIMIT 9",row.id),
    all("SELECT rating,COUNT(*) AS count FROM reviews WHERE course_id=? AND status='published' GROUP BY rating",row.id),
  ]);
  const start=batches.find(batch=>batch.availability==="Open"),instructor=row.instructor||site.author_name;
  const faq=text(row,"faq").split(/\r?\n/).map(line=>line.split("|")).filter(parts=>parts.length>=2);
  const invite=q(query,"invite");
  return <>
    {!row.demo&&!preview&&instructor&&<Schema value={{"@context":"https://schema.org","@type":"Course",name:row.title,description:row.summary,url:absolute("/courses/"+row.slug),provider:{"@type":"Person",name:instructor},
      ...(row.review_count?{aggregateRating:{"@type":"AggregateRating",ratingValue:row.average,reviewCount:row.review_count}}:{})}}/>}
    <section className="page-heading"><div className="shell"><Breadcrumb title={text(row,"title")} parent={{label:"Courses",path:"/courses"}}/>
      <div className="detail-grid"><div><p className="eyebrow">{row.category||"Course"}{row.demo&&<span className="badge">Sample course</span>}{preview&&<span className="badge">Editor preview</span>}</p>
        <h1>{row.title}</h1><p className="lead">{row.summary}</p>{instructor&&<p>With <strong>{instructor}</strong></p>}
        <div className="course-meta">{row.duration&&<span><Clock size={17}/>{row.duration}</span>}{row.format&&<span><MonitorPlay size={17}/>{row.format}</span>}
          {start?.starts_on&&<span><CalendarDays size={17}/>{date(start.starts_on)}</span>}</div>
        {!!row.review_count&&<a href="#reviews" className="stars" aria-label={Number(row.average).toFixed(1)+" out of 5 stars"}>{stars(Number(row.average))} {Number(row.average).toFixed(1)} ({row.review_count})</a>}</div>
      <div className="detail-photo">{row.video?<video src={href(row.video)} poster={href(row.image)} controls playsInline preload="metadata"/>:<Photo src={row.image} alt={text(row,"alt")} hero/>}</div></div>
    </div></section>
    <div className="shell section split">
      <div className="stack course-main">
        {row.body&&<section><h2>Course overview</h2><Copy source={row.body}/></section>}
        {row.audience&&<section><h2>Who this course is for</h2><Lines source={row.audience}/></section>}
        {row.outcomes&&<section><h2>What you’ll learn</h2><Lines source={row.outcomes}/></section>}
        {!!modules.length&&<section><h2>Curriculum</h2><div className="accordion">{modules.map((module,index)=><details key={index}><summary>{module.title}</summary><div><Copy source={module.body}/></div></details>)}</div></section>}
        {!!batches.length&&<section><h2>Batches and schedule</h2><div className="accordion">{batches.map(batch=><details key={batch.id}><summary>{[batch.title,date(batch.starts_on),batch.availability].filter(Boolean).join(" · ")}</summary><div><Copy source={batch.schedule||"Contact the instructor for schedule details."}/></div></details>)}</div></section>}
        {[["Requirements",row.requirements],["Benefits",row.benefits],["About the instructor",row.instructor_bio],["Certificate",row.certificate]].filter(([,body])=>body).map(([label,body])=><section key={String(label)}><h2>{label}</h2><Copy source={body}/></section>)}
        {!!faq.length&&<section><h2>Frequently asked questions</h2><div className="accordion">{faq.map(([question,...answers],index)=><details key={index}><summary>{question.trim()}</summary><div><Copy source={answers.join("|").trim()}/></div></details>)}</div></section>}
        <Reviews course={row} items={reviews} distribution={distribution} allow={!row.demo&&!preview} invite={/^[0-9a-f]{64}$/.test(invite)?invite:""}/>
      </div>
      <Registration course={row} batches={batches} ready={!!phone(site.whatsapp)} open={openCourse(row)&&!preview}/>
    </div>
  </>;
}
export async function ArticleDetail({row,site,preview}:{row:Row;site:Settings;preview:boolean}){
  const author=row.author||(!row.demo?site.author_name:""),url=absolute("/reflections/"+row.slug);
  const [articles,comments]=await Promise.all([list("articles"),row.comments_enabled&&!preview?all("SELECT id,name,body,created_at FROM comments WHERE article_id=? AND status='published' ORDER BY id DESC LIMIT 50",row.id):Promise.resolve([])]);
  const related=articles.filter(article=>article.id!==row.id).sort((a,b)=>Number(b.category===row.category)-Number(a.category===row.category)).slice(0,3);
  const lang=row.language==="ur"?"ur":"en",direction=lang==="ur"?"rtl":"ltr";
  return <>
    {!row.demo&&!preview&&author&&<Schema value={{"@context":"https://schema.org","@type":"Article",headline:row.title,description:row.summary,author:{"@type":"Person",name:author},
      datePublished:row.published_at||row.created_at,inLanguage:lang,mainEntityOfPage:url,...(href(row.image)?{image:absolute(href(row.image))}:{})}}/>}
    <section className="article-head"><div className="shell"><Breadcrumb title={text(row,"title")} parent={{label:"Reflections",path:"/reflections"}}/>
      <div className="reading"><p className="eyebrow">{row.category||"Reflection"}{row.demo&&<span className="badge">Sample reflection</span>}{preview&&<span className="badge">Editor preview</span>}</p>
        <div lang={lang} dir={direction}><h1>{row.title}</h1><p className="lead">{row.summary}</p></div>
        <p className="meta">{[author,date(row.published_at||row.created_at),readings(row.body)].filter(Boolean).join(" · ")}</p>
      </div></div></section>
    {row.image&&<div className="shell article-image"><Photo src={row.image} alt={text(row,"alt")} hero/></div>}
    <article className="reading section"><div id="reading-body" lang={lang} dir={direction}><Copy source={row.body}/></div>
      {!preview&&<ReadTools url={url} title={text(row,"title")}/>}
      {author&&<div className="byline"><strong>{author}</strong>{author===site.author_name&&<a className="text-link" href="/about">About the author</a>}</div>}
      {!!row.comments_enabled&&!preview&&<section className="inner-section"><h2>Join the conversation</h2>
        {comments.map(comment=><article className="panel comment" key={comment.id}><strong>{comment.name}</strong> <time className="meta">{date(comment.created_at)}</time><p>{comment.body}</p></article>)}
        <AsyncForm endpoint="/api/comment" label="Submit comment"><input type="hidden" name="article" value={text(row,"slug")}/>
          <div className="pair"><label>Name<input name="name" required maxLength={120}/></label><label>Email<input type="email" name="email" required/></label></div>
          <label>Comment<textarea name="body" rows={4} required maxLength={2500}/></label><p className="muted">Comments are moderated before publication. Your email stays private.</p>
        </AsyncForm></section>}
    </article>
    {!!related.length&&<section className="section shell related"><SectionHead title="Related reflections"/><div className="cards">{related.map(article=><JournalCard key={article.id} row={article}/>)}</div></section>}
    <Newsletter site={site}/>
  </>;
}
export function Publication({row,site,preview}:{row:Row;site:Settings;preview:boolean}){
  return <>
    {!preview&&/^books?$/i.test(text(row,"category"))&&site.author_name&&<Schema value={{"@context":"https://schema.org","@type":"Book",name:row.title,
      description:row.summary,author:{"@type":"Person",name:site.author_name},datePublished:row.issue_date,url:absolute("/publications/"+row.slug)}}/>}
    <section className="page-heading"><div className="shell"><Breadcrumb title={text(row,"title")} parent={{label:"Publications",path:"/publications"}}/>
      <div className="detail-grid"><div><p className="eyebrow">{row.category||"Publication"}{preview&&<span className="badge">Editor preview</span>}</p>
        <h1>{row.title}</h1><p className="lead">{row.summary}</p><p className="meta">{[row.publisher,date(row.issue_date)].filter(Boolean).join(" · ")}</p>
        <div className="actions downloads">{href(row.purchase_url)&&<a className="button" href={href(row.purchase_url)} target="_blank" rel="noreferrer">Find a copy</a>}
        {href(row.download_url)&&<a className="button outline" href={href(row.download_url)}>Download publication</a>}
        {href(row.reference_url)&&<a className="text-link" href={href(row.reference_url)} target="_blank" rel="noreferrer">View reference</a>}</div>
      </div><div className="cover"><Photo src={row.image} alt={text(row,"alt")} hero/></div></div>
    </div></section>{row.body&&<article className="reading section"><h2>About this publication</h2><Copy source={row.body}/></article>}
  </>;
}

export async function Connect({site,query,speaking=false}:{site:Settings;query:Query;speaking?:boolean}){
  const title=speaking?"Speaking & collaboration":"Get in touch";
  const whats=whatsapp(site.whatsapp,speaking?"Assalamualaikum, I would like to discuss a speaking or collaboration opportunity.":"Assalamualaikum, I would like to get in touch.");
  const [appearances,photos]=speaking?await Promise.all([collection("media_mentions"),collection("gallery_items")]):[[],[]];
  const events=appearances.filter(row=>/speak|interview|event|workshop/i.test(text(row,"category")));
  const gallery=photos.filter(row=>!row.demo&&/speak|event|workshop|media/i.test(text(row,"category"))).slice(0,6);
  return <><Heading title={title} description={speaking?"Invite the author to speak, lead a workshop, write, or work with your organization.":"For course questions, speaking invitations, writing opportunities, or a conversation about working together."}/>
    <section className="shell section contact-grid"><div>
      {speaking?<><Copy source={site.speaking_intro}/><h2>Engagements</h2><Lines source={site.speaking_types||"Talks and panel conversations\nInstitutional workshops\nWriting projects and interviews"}/>
        {site.speaking_topics&&<><h3>Speaking topics</h3><Lines source={site.speaking_topics}/></>}
        {!!events.length&&<><h3>Previous engagements</h3><Timeline rows={events}/></>}<BioLinks site={site}/></>:<h2>Start a conversation</h2>}
      {site.email&&<a className="contact-option" href={"mailto:"+site.email}><Mail size={20}/><span><strong>Email</strong><small>{site.email}</small></span></a>}
      {whats&&<a className="contact-option" href={whats} target="_blank" rel="noreferrer"><MessageCircle size={20}/><span><strong>WhatsApp</strong><small>Open a chat</small></span></a>}
      {!speaking&&site.show_speaking==="1"&&<a className="contact-option" href="/speaking"><Mic size={20}/><span><strong>Speaking & collaboration</strong><small>Explore engagement options</small></span></a>}
      <Social site={site}/></div>
    <div className="panel contact-panel"><h2>{speaking?"Invite the author":"Send a message"}</h2><ContactForm type={speaking?"Speaking invitation":q(query,"category")} subject={q(query,"subject")}/></div></section>
    {!!gallery.length&&<section className="shell section"><SectionHead title="From previous engagements"/><Gallery items={gallery}/></section>}
    </>;
}
export async function GalleryPage({query}:{query:Query}){
  const rows=await collection("gallery_items"),category=q(query,"category");
  const visible=rows.filter(row=>!category||row.category===category);
  return <><Heading title="Moments and milestones" description="Photographs and videos from workshops, events, and the work behind the writing."/>
    <section className="shell section"><CategoryLinks path="/gallery" active={category} values={categories(rows)}/>
      {visible.length?<Gallery items={visible} key={category}/>:<Empty title="No gallery items here yet">Photographs and videos will appear here when published.</Empty>}</section></>;
}
export async function Resources({query}:{query:Query}){
  const rows=await collection("resources"),category=q(query,"category"),slug=q(query,"resource");
  const resource=rows.find(row=>row.gated&&row.slug===slug),visible=rows.filter(row=>!category||row.category===category);
  return <><Heading title="Free resources" description="Guides, worksheets, and practical materials for your next writing session."/><section className="shell section">
    {resource&&<div id="resource-form" className="panel resource-signup"><h2>Get {resource.title}</h2><p>Enter your email and confirm your subscription to access the download.</p>
      <AsyncForm endpoint="/api/subscribe" label="Send me the link"><SubscribeFields resource={slug}/></AsyncForm></div>}
    <CategoryLinks path="/resources" active={category} values={categories(rows)}/>
    {visible.length?<div className="cards">{visible.map(row=><article className="panel resource" key={row.id}>{row.image&&<Photo src={row.image} alt={text(row,"alt")}/>}
      <p className="eyebrow">{row.category||"Resource"}</p><h3>{row.title}</h3><p>{row.summary}</p><a className="button outline" href={"/api/download/"+row.slug}>{row.gated?"Access resource":"Download"}</a></article>)}</div>:
      <Empty title="Resources are coming soon">Writing guides and practice materials will appear here.</Empty>}</section></>;
}
export function NewsletterPage({site,query}:{site:Settings;query:Query}) {
  const mode=q(query,"action"),token=q(query,"t"),slug=q(query,"resource");
  if (!["confirm","unsubscribe","access"].includes(mode)||!/^\d{1,12}\.[a-f0-9]{64}$/.test(token)) return <>
    <Heading title="Newsletter" description={mode?"This link is incomplete. Submit the form for a fresh link.":"Reflections, writing resources, and course updates in your inbox."}/><Newsletter site={site}/></>;
  return <><Heading title={mode==="unsubscribe"?"Unsubscribe from the newsletter":mode==="access"?"Access your resource":"Confirm your subscription"}
    description={mode==="unsubscribe"?"Confirm below to stop receiving the newsletter.":"Continue below to verify your email address."}/>
    <section className="shell section"><AsyncForm endpoint="/api/newsletter" label={mode==="unsubscribe"?"Unsubscribe":"Confirm email"} reset={false}
      download={mode!=="unsubscribe"&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)?"/api/download/"+slug:""}>
      <input type="hidden" name="mode" value={mode}/><input type="hidden" name="token" value={token}/>
    </AsyncForm></section></>;
}
export function Privacy(){
  return <><Heading title="Privacy" description="How the site handles inquiries, reviews, subscriptions, and usage data."/>
    <div className="reading section stack"><section><h2>Messages and reviews</h2><p>The site uses contact details to respond to inquiries and verify eligibility to review a course. Approved reviews show your name, rating, and feedback. Your email address stays private.</p></section>
      <section><h2>Newsletter</h2><p>The site records consent and sends an email confirmation when delivery is configured. Use the unsubscribe link in a newsletter email to withdraw consent.</p></section>
      <section><h2>Site usage</h2><p>The site measures visits and registration clicks and uses short-lived request limits to prevent spam. WhatsApp opens separately when you use a WhatsApp link.</p>
        {process.env.GA_ID&&<PrivacyPreference/>}</section><section><h2>Questions</h2><p>Use the <a className="text-link" href="/contact">contact form</a> to ask about your information.</p></section></div></>;
}
