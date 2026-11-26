import type { Metadata } from "next";
import { notFound, unstable_rethrow } from "next/navigation";
import { absolute, item, origin, settings, type Catalogue } from "@/lib/content";
import { defaults, href, q, text, type Query } from "@/lib/domain";
import { admin, publicFormsConfigured } from "@/lib/security";
import { Footer } from "@/components/editorial";
import { Metrics } from "@/components/site-metrics";
import { Header } from "@/components/navigation";
import { Home } from "@/components/home";
import { About, Experience, SocialImpact } from "@/components/profile";
import { PresentationEffects } from "@/components/presentation-effects";
import {
  ArticleDetail,
  CataloguePage,
  Connect,
  CourseDetail,
  GalleryPage,
  NewsletterPage,
  Privacy,
  Publication,
  Resources,
} from "@/components/pages";

export const dynamic = "force-dynamic";

const links = [
  ["Home", ""],
  ["About", "about"],
  ["Experience", "experience"],
  ["Social Impact", "social-impact"],
  ["Courses", "courses"],
  ["Insights", "reflections"],
  ["Contact", "contact"],
] as const;

const descriptions: Record<string, [string, string]> = {
  "": [
    "",
    "Madiha Rasheed’s work in capability building, leadership, entrepreneurship, and education in Karachi, Pakistan.",
  ],
  about: [
    "About",
    "Follow Madiha Rasheed’s journey from education and community work to capability building, research, and strategy.",
  ],
  experience: ["Experience", "Explore Madiha Rasheed’s research, facilitation, career guidance, and professional roles in Karachi."],
  "social-impact": ["Social Impact", "Explore Madiha Rasheed’s community work in civic education, youth development, women’s digital inclusion, and access to learning."],
  courses: [
    "Courses & Workshops",
    "Explore learning and workshop updates in capability building, career readiness, and digital inclusion from Madiha Rasheed.",
  ],
  reflections: [
    "Insights & Reflections",
    "Professional insights, articles, personal reflections, and newsletters on leadership, entrepreneurship, and socioeconomic growth.",
  ],
  publications: [
    "Publications",
    "Published reports, essays, research briefs, and authorized resources.",
  ],
  gallery: [
    "Certificates & Gallery",
    "Verified original certificates and milestone visuals from leadership fellowships, mentorships, and community impact programs.",
  ],
  speaking: [
    "Speaking & Collaboration",
    "Invite Madiha Rasheed to speak, facilitate workshops, or collaborate on capability building and research initiatives.",
  ],
  resources: [
    "Free Resources",
    "Practical frameworks, toolkits, and educational resources for personal and organizational growth.",
  ],
  contact: [
    "Contact",
    "Connect with Madiha Rasheed regarding capability building, workshops, speaking, research, or collaboration.",
  ],
  newsletter: [
    "Newsletter",
    "Subscribe or manage your newsletter subscription for dispatches on capability building, leadership, and growth.",
  ],
  privacy: [
    "Privacy",
    "How the website handles inquiries, reviews, subscriptions, and privacy preferences.",
  ],
};

const catalogue: Record<string, Catalogue> = {
  courses: "courses",
  reflections: "articles",
  publications: "publications",
};

type Props = { params: Promise<{ path?: string[] }>; searchParams: Promise<Query> };

async function resolve(props: Props) {
  const [{ path = [] }, query] = await Promise.all([props.params, props.searchParams]);
  const page = path[0] ?? "";
  const slug = path[1];
  if (path.length > 2 || !Object.hasOwn(descriptions, page) || (path.length === 2 && !Object.hasOwn(catalogue, page))) {
    notFound();
  }
  const site = await settings();
  if (
    (page === "gallery" && site.show_gallery !== "1") ||
    (page === "resources" && site.show_resources !== "1") ||
    (page === "speaking" && site.show_speaking !== "1")
  ) {
    notFound();
  }
  const preview = !!slug && q(query, "preview") === "1" && !!(await admin());
  const row = slug ? await item(catalogue[page], slug, preview) : null;
  if (slug && !row) notFound();
  return { page, slug, row, query, site, preview };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  try {
    const { page, slug, row, site, preview, query } = await resolve(props);
    const [label, summary] = descriptions[page];
    const name = row ? text(row, "seo_title") || text(row, "title") : label;
    const title =
      name ? name + " | " + site.site_title : site.site_title + " | Capability Building & Social Impact";
    const description = row ? text(row, "seo_description") || text(row, "summary") || summary : summary;
    const url = absolute("/" + page + (slug ? "/" + slug : ""));
    const rawImage = href(row?.image) || "/images/social-preview.jpg";
    const image = absolute(rawImage);
    const index = !row?.demo && !preview && !q(query, "invite") && !q(query, "q") &&
      !q(query, "category") && !q(query, "availability") && page !== "newsletter" && process.env.PRIVATE_PREVIEW !== "1";

    return {
      title,
      description,
      metadataBase: new URL(origin()),
      alternates: { canonical: url },
      robots: { index, follow: index },
      openGraph: {
        type: page === "reflections" && row ? "article" : "website",
        title,
        description,
        url,
        siteName: site.site_title,
        images: [{ url: image, alt: row?.image ? text(row, "alt") || text(row, "title") : "Madiha Rasheed · Capability building and social impact", ...(row?.image ? {} : { width: 1200, height: 630 }) }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  } catch (err) {
    unstable_rethrow(err);
    return { title: defaults.site_title };
  }
}

export default async function Page(props: Props) {
  const { page, slug, row, query, site, preview } = await resolve(props);
  const path = "/" + page;
  const route = path + (slug ? "/" + slug : "");
  const analytics = process.env.GA_ID || "";
  const recordVisits = publicFormsConfigured();
  const order = site.nav_order
    .toLowerCase()
    .split(",")
    .map((value) => value.trim() === "reflections" ? "insights" : value.trim());
  const nav = links.map(([label, segment]) => ({ label, href: "/" + segment }));
  if (order.includes("experience") && order.includes("social impact")) {
    nav.sort((a, b) => (order.indexOf(a.label.toLowerCase()) + 1 || 100) - (order.indexOf(b.label.toLowerCase()) + 1 || 100));
  }

  let content: React.ReactNode;
  switch (page) {
    case "":
      content = <Home site={site} />;
      break;
    case "about":
      content = <About site={site} />;
      break;
    case "experience":
      content = <Experience />;
      break;
    case "social-impact":
      content = <SocialImpact />;
      break;
    case "courses":
      content = row ? (
        <CourseDetail row={row} site={site} preview={preview} query={query} />
      ) : (
        <CataloguePage site={site} type="courses" query={query} />
      );
      break;
    case "reflections":
      content = row ? (
        <ArticleDetail row={row} site={site} preview={preview} />
      ) : (
        <CataloguePage site={site} type="articles" query={query} />
      );
      break;
    case "publications":
      content = row ? (
        <Publication row={row} site={site} preview={preview} />
      ) : (
        <CataloguePage site={site} type="publications" query={query} />
      );
      break;
    case "gallery":
      content = <GalleryPage query={query} />;
      break;
    case "contact":
      content = <Connect site={site} query={query} />;
      break;
    case "speaking":
      content = <Connect site={site} query={query} speaking />;
      break;
    case "resources":
      content = <Resources query={query} />;
      break;
    case "newsletter":
      content = <NewsletterPage site={site} query={query} />;
      break;
    case "privacy":
      content = <Privacy />;
      break;
  }

  return (
    <>
      <Header title={site.site_title} links={nav} current={path} />
      <main id="main" className="site-main" tabIndex={-1} key={route}>{content}</main>
      <Footer site={site} />
      <PresentationEffects route={route} />
      {(analytics || recordVisits) && <Metrics id={analytics} path={route} record={recordVisits} />}
    </>
  );
}
