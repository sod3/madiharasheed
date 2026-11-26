import type { Row } from "@/db";

// Prototype sample data is intentionally empty so unpublished courses, articles,
// and testimonials are never fabricated on the public website.
export const exampleCourses: Row[] = [];
export const exampleModules: Record<number, { title: string; body: string }[]> = {};
export const exampleArticles: Row[] = [];
export const exampleGallery: Row[] = [];
