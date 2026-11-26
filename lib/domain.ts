import type { Row } from "@/db";

export const images = {
  hero: "/images/writing-desk.webp",
  craft: "/images/writing-workshop.webp",
  notes: "/images/notes.webp",
};

export const courseFormats = [
  "Live online",
  "Self-paced",
  "In-person workshop",
  "On-demand video",
  "Free resource",
];

export const courseStates = [
  "Upcoming",
  "Ongoing",
  "Self-paced",
  "Registration closed",
  "Coming soon",
];

export const inquiryTypes = [
  "Course or workshop registration",
  "Speaking invitation",
  "Capability building collaboration",
  "Research & strategy consultation",
  "Media and interviews",
  "General inquiry",
];

export const legacyPrototypeDefaults: Record<string, string> = {
  hero_label: "Writer · Educator · Lifelong Learner",
  hero_line_1: "Words that inspire.",
  hero_line_2: "Knowledge that empowers.",
  hero_line_3: "Experiences that transform.",
  hero_description:
    "A space for meaningful reflections, transformative learning, and ideas shaped by a journey of professional excellence, curiosity, and purpose.",
  intro_title: "The work behind the words",
  newsletter_title: "A little wisdom in your inbox.",
  newsletter_description:
    "Receive thoughtful reflections, valuable insights, learning resources, and updates on upcoming courses directly in your inbox.",
};

export const defaults = {
  site_title: "Madiha Rasheed",
  author_name: "Madiha Rasheed",
  hero_label: "Karachi, Pakistan · Capability Building & Growth Strategy",
  hero_line_1: "Capability that scales.",
  hero_line_2: "Leadership with purpose.",
  hero_line_3: "Growth built to endure.",
  hero_description:
    "BBA student and aspiring Capability Building Consultant & Growth Strategist advancing entrepreneurship, leadership, education, and socioeconomic development in Pakistan.",
  hero_image: "",
  hero_alt: "Madiha Rasheed",
  intro_title: "Bridging current capability and full potential",
  intro_body:
    "I have dedicated the past few years to contributing to social and economic development in Pakistan across education, youth empowerment, and community-based initiatives.\n\nThrough market research, career counseling, and national leadership programs, I have seen how sustainable growth depends on entrepreneurship, purposeful leadership, and structured capacity building. In today’s evolving world, technology and AI-driven learning can accelerate how individuals and organizations grow and scale.",
  intro_quote:
    "Sustainable economic growth is closely linked with strong entrepreneurship, leadership, and capacity building within individuals and organizations.",
  about_image: "",
  about_image_alt: "Madiha Rasheed",
  background:
    "Based in Karachi, Pakistan, I am pursuing Bachelor of Business Administration studies in Organizational Behavior Studies (Iqra University) and Business Administration & Management (GU-Tech), building on a Pre-Engineering foundation from The Citizens Foundation College.\n\n## From community outreach to growth strategy\n\nMy journey spans grassroots social action, entrepreneurship apprenticeships, quantitative program evaluation, and career counseling. Whether facilitating Work Readiness and Digital Literacy workshops with CIRCLE Women Association, designing a 196-participant impact study for the Delhi Punjabi Saudagran Foundation, or guiding 30+ students through one-on-one career pathways with Mk Volunteers Team, every experience has reinforced my commitment to structured learning and measurable impact.\n\n## Looking forward\n\nMy long-term focus is to serve as a Capability Building Consultant and Growth Strategist—partnering with people and organizations to bridge the gap between present capability and long-term potential through strategy, leadership development, and technology-enabled learning.",
  philosophy:
    "Growth is rarely accidental. When individuals gain clarity on their strengths—and organizations invest in structured systems, evidence-based research, and inclusive leadership—potential turns into lasting socioeconomic impact.\n\nI believe in combining human-centered mentorship with analytical rigor and AI-assisted learning tools so capability building remains accessible, practical, and transformative.",
  beyond:
    "Outside academic and consulting projects, I invest my energy in youth civic initiatives such as the Rights Baithak Social Action Project and GenZ Walk, mentoring scholarship applicants, and participating in design-thinking and leadership networks across Pakistan.",
  professional_bio: "",
  media_kit: "",
  statistics:
    "500+|Individuals reached via Rights Baithak\n196|Research participants surveyed\n70+|Students taught & mentored\n30+|Students receiving career guidance",
  speaking_topics:
    "Capability building for emerging leaders and organizations\nYouth entrepreneurship & SDG-aligned problem solving\nCareer readiness, RIASEC/MBTI frameworks & scholarship mentorship\nWomen’s digital inclusion & work readiness facilitation\nEvidence-based impact evaluation for social programs",
  speaking_types:
    "University talks and youth leadership panels\nWork readiness and career readiness workshops\nInstitutional capacity-building collaborations\nResearch, impact assessment, and strategy projects",
  speaking_intro:
    "I collaborate with universities, social enterprises, non-profits, and student networks on workshops, talks, and capacity-building initiatives rooted in practical experience across Pakistan.",
  email: "madiha2201103@gmail.com",
  whatsapp: "",
  linkedin: "https://www.linkedin.com/in/madiha-rasheed-39660b290/",
  instagram: "",
  facebook: "",
  youtube: "",
  other_social: "",
  newsletter_title: "Dispatches on capability, strategy & growth.",
  newsletter_description:
    "Receive upcoming professional insights, articles, personal reflections, and workshop announcements directly in your inbox.",
  nav_order: "Home,About,Courses,Reflections,Gallery,Speaking,Contact",
  show_gallery: "1",
  show_speaking: "1",
  show_resources: "1",
  show_testimonials: "1",
  show_demo: "0",
};

export type Settings = typeof defaults;

export function href(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";
  if (/^\/(?!\/)[^\\\s]*$/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

export function phone(value: string) {
  const number = value.replace(/[\s()+-]/g, "");
  return /^[1-9]\d{7,14}$/.test(number) ? number : "";
}

export function whatsapp(number: string, message: string) {
  return phone(number) ? "https://wa.me/" + phone(number) + "?text=" + encodeURIComponent(message) : "";
}

export function date(value: unknown) {
  if (!value) return "";
  const timestamp = new Date(String(value));
  return Number.isNaN(timestamp.getTime())
    ? ""
    : new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(timestamp);
}

export function readings(value: unknown) {
  return Math.max(1, Math.ceil(String(value ?? "").trim().split(/\s+/).length / 220)) + " min read";
}

export function text(row: Row, key: string) {
  return String(row[key] ?? "");
}

export const openCourse = (row: Row) => !row.demo && courseStates.slice(0, 3).includes(text(row, "availability"));

export function categories(rows: Row[]) {
  return [...new Set(rows.map((row) => text(row, "category")).filter(Boolean))].sort();
}

export type Query = Record<string, string | string[] | undefined>;

export function q(query: Query, key: string, max = 160) {
  const value = query[key];
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export const stars = (rating: number) =>
  "★".repeat(Math.min(5, Math.max(0, Math.round(rating)))) +
  "☆".repeat(5 - Math.min(5, Math.max(0, Math.round(rating))));
