import type { Row } from "@/db";
import { impactFigures } from "./impact-data";

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
  hero_image: "/images/writing-desk.webp",
  about_image: "/images/writing-workshop.webp",
  intro_title: "The work behind the words",
  newsletter_title: "A little wisdom in your inbox.",
  newsletter_description:
    "Receive thoughtful reflections, valuable insights, learning resources, and updates on upcoming courses directly in your inbox.",
};

export const defaults = {
  site_title: "Madiha Rasheed",
  author_name: "Madiha Rasheed",
  hero_label: "Capability building & growth strategy",
  hero_line_1: "Building capabilities.",
  hero_line_2: "Inspiring growth.",
  hero_line_3: "Creating meaningful impact.",
  hero_description:
    "I work across leadership, entrepreneurship, and education to help people and communities build the skills to shape their own futures.",
  hero_image: "",
  hero_alt: "Madiha Rasheed",
  intro_title: "How do people build the skills to grow?",
  intro_body:
    "My work in Karachi has taken me from classrooms and community sessions to entrepreneurship research and career counseling. Each setting has shown me a different part of the same question, from finding a first opportunity to understanding which kinds of support make a difference.\n\nI bring those experiences to my growing practice in capability building, leadership development, and strategy.",
  intro_quote:
    "Sustainable economic growth is closely linked with strong entrepreneurship, leadership, and capacity building within individuals and organizations.",
  about_image: "",
  about_image_alt: "Madiha Rasheed",
  background:
    "I studied pre-engineering at The Citizens Foundation College before moving into business administration at Iqra University and GU-Tech. Along the way, an entrepreneurship apprenticeship gave me a chance to work on practical solutions to socioeconomic challenges. That interest carried into research, career counseling, and youth civic action.\n\n## Looking forward\n\nI aspire to work as a capability building consultant and growth strategist. I want to help organizations understand what their teams and communities need, then design learning and leadership programs that respond to those needs.",
  philosophy:
    "Growth is rarely accidental. When individuals gain clarity on their strengths—and organizations invest in structured systems, evidence-based research, and inclusive leadership—potential turns into lasting socioeconomic impact.\n\nI believe in combining human-centered mentorship with analytical rigor and AI-assisted learning tools so capability building remains accessible, practical, and transformative.",
  beyond:
    "Outside academic and consulting projects, I invest my energy in youth civic initiatives such as the Rights Baithak Social Action Project and GenZ Walk, mentoring scholarship applicants, and participating in design-thinking and leadership networks across Pakistan.",
  professional_bio: "",
  media_kit: "",
  statistics: impactFigures.map(({ value, label }) => value + "|" + label).join("\n"),
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
  newsletter_title: "Field notes on growth.",
  newsletter_description:
    "Get new essays, research reflections, and workshop announcements by email.",
  nav_order: "Home,About,Experience,Social Impact,Courses,Insights,Contact",
  show_gallery: "1",
  show_speaking: "1",
  show_resources: "1",
  show_testimonials: "1",
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
