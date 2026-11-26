export const impactFigures = [
  { id: "rights-baithak", value: "500+", label: "People reached through Rights Baithak" },
  { id: "impact-research", value: "196", label: "Participants surveyed in impact research" },
  { id: "mathematics", value: "70+", label: "Students taught mathematics" },
  { id: "education-outreach", value: "50+", label: "Students reached through education outreach" },
  { id: "career-guidance", value: "30+", label: "Students guided one-on-one" },
  { id: "summer-camp", value: "45+", label: "Summer camp students supported" },
] as const;

type ImpactCase = {
  id: string;
  title: string;
  organization: string;
  theme: string;
  period?: string;
  objective: string;
  contribution: string;
  outcome?: string;
};

export const impactCases: ImpactCase[] = [
  {
    id: "rights-baithak",
    title: "Rights Baithak",
    organization: "Young Leaders Conference · School of Leadership",
    theme: "Civic education",
    period: "December 2025 – March 2026",
    objective: "Make civic rights and responsibilities relevant to daily life for students and community members.",
    contribution: "Co-designed the social action project, delivered school awareness sessions, and supported the GenZ Walk alongside the Hammad Foundation.",
    outcome: "500+ people reached through school and community sessions.",
  },
  {
    id: "impact-research",
    title: "Evaluating entrepreneurship training",
    organization: "Delhi Punjabi Saudagran Foundation",
    theme: "Impact research",
    period: "January – July 2026",
    objective: "Evaluate the outcomes of the foundation’s Entrepreneurship Training Program.",
    contribution: "Designed the survey, coordinated participant outreach, and analyzed the results to identify priorities for the program.",
    outcome: "196 participants surveyed and a quantitative evaluation report with recommendations delivered.",
  },
  {
    id: "digital-inclusion",
    title: "CIRCLE Baji digital inclusion",
    organization: "CIRCLE Women Association",
    theme: "Women’s digital inclusion",
    period: "May 2025 – May 2026",
    objective: "Make digital learning and work-readiness support accessible to more people across Karachi.",
    contribution: "Facilitated platform onboarding and awareness sessions with community organizations and managed the Karachi Work Readiness Program cohort.",
    outcome: "5+ awareness and onboarding sessions facilitated, with 30+ participants onboarded at the Disabled People’s Welfare Organization.",
  },
  {
    id: "career-guidance",
    title: "Career guidance and scholarship preparation",
    organization: "Mk Volunteers Team",
    theme: "Youth development",
    period: "January – July 2026",
    objective: "Help students choose education and career pathways based on their interests and strengths.",
    contribution: "Led one-on-one career conversations, connected students with mentors, and helped applicants prepare for TCF Tertiary Scholarship interviews.",
    outcome: "30+ students counseled and 15+ scholarship applicants mentored.",
  },
  {
    id: "education-outreach",
    title: "Change Makers education outreach",
    organization: "The Citizens Foundation · Alumni Pathways",
    theme: "Education access",
    objective: "Help students learn about opportunities for further education.",
    contribution: "Volunteered in the TCF Change Makers outreach campaign to raise awareness of education and scholarship pathways.",
    outcome: "50+ students reached through education outreach.",
  },
  {
    id: "summer-camp",
    title: "Summer camp learning support",
    organization: "The Citizens Foundation",
    theme: "Education access",
    objective: "Support students taking part in the TCF Summer Camp.",
    contribution: "Supported students during summer camp learning activities.",
    outcome: "45+ summer camp students supported.",
  },
  {
    id: "mathematics",
    title: "Mathematics teaching",
    organization: "Education and student support",
    theme: "Education access",
    objective: "Help students build their understanding of mathematics.",
    contribution: "Taught mathematics as part of my work in student learning and support.",
    outcome: "70+ students taught.",
  },
  {
    id: "special-olympics",
    title: "Special Olympics Pakistan",
    organization: "Special Olympics Pakistan",
    theme: "Community inclusion",
    objective: "Support community inclusion through sport.",
    contribution: "Took part in community work with Special Olympics Pakistan.",
  },
];
