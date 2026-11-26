import type { Row } from "@/db";

export interface ProfileOrganization extends Row {
  title: string;
  image: string;
  alt: string;
  url: string;
  role: string;
  period: string;
  kind: "partner" | "program" | "corporate" | "community";
  visible: number;
  position: number;
}

export interface ProfileQualification extends Row {
  title: string;
  issuer: string;
  date_label: string;
  body: string;
  visible: number;
  position: number;
}

export interface ProfileExperience extends Row {
  title: string;
  organization: string;
  logo: string;
  date_label: string;
  location: string;
  kind: "experience" | "fellowship" | "volunteering";
  body: string;
  impact: string;
  url: string;
  visible: number;
  position: number;
}

export interface ProfileAchievement extends Row {
  title: string;
  issuer: string;
  category: string;
  date_label: string;
  signatory: string;
  body: string;
  image: string;
  alt: string;
  featured: number;
  visible: number;
  position: number;
}

export interface ProfileMilestone extends Row {
  title: string;
  date_label: string;
  body: string;
  visible: number;
  position: number;
}

export const profileOrganizations: ProfileOrganization[] = [
  {
    id: 1,
    title: "CIRCLE Women Association",
    image: "/images/orgs/circle-women.webp",
    alt: "CIRCLE Women Association official emblem",
    url: "https://circlewomen.org",
    role: "Ambassador & Volunteer",
    period: "May 2025 – May 2026",
    kind: "community",
    visible: 1,
    position: 1,
  },
  {
    id: 2,
    title: "The Citizens Foundation (TCF)",
    image: "/images/orgs/tcf.webp",
    alt: "The Citizens Foundation logo",
    url: "https://www.tcf.org.pk",
    role: "Alumna & Change Makers Outreach",
    period: "2021 – Present",
    kind: "community",
    visible: 1,
    position: 2,
  },
  {
    id: 3,
    title: "The Capstone Program (TCP)",
    image: "/images/orgs/capstone-program.webp",
    alt: "The Capstone Program logo",
    url: "",
    role: "Cohort 1 Fellow (~13% acceptance)",
    period: "April 2026",
    kind: "program",
    visible: 1,
    position: 3,
  },
  {
    id: 4,
    title: "Enterprise Challenge Pakistan",
    image: "/images/orgs/enterprise-challenge.webp",
    alt: "Enterprise Challenge Pakistan — Prince's Trust International logo",
    url: "",
    role: "Apprentice (Top 9% of 220+ applicants)",
    period: "Oct 2023 – Feb 2024",
    kind: "program",
    visible: 1,
    position: 4,
  },
  {
    id: 5,
    title: "SEED Ventures",
    image: "/images/orgs/seed-ventures.webp",
    alt: "SEED Ventures logo",
    url: "",
    role: "Enterprise Challenge Pakistan Co-host",
    period: "2023 – 2024",
    kind: "partner",
    visible: 1,
    position: 5,
  },
  {
    id: 6,
    title: "Manzl Mentorship Program",
    image: "/images/orgs/manzl.webp",
    alt: "Manzl Mentorship Program logo",
    url: "",
    role: "Mentee · Cohort 10",
    period: "Cohort 10",
    kind: "program",
    visible: 1,
    position: 6,
  },
  {
    id: 7,
    title: "School of Leadership (YLC)",
    image: "",
    alt: "School of Leadership — Young Leaders Conference",
    url: "",
    role: "National Conference Delegate (150+ selected)",
    period: "Dec 2025 – Mar 2026",
    kind: "program",
    visible: 1,
    position: 7,
  },
  {
    id: 8,
    title: "Delhi Punjabi Saudagran Foundation (DPSF)",
    image: "",
    alt: "Delhi Punjabi Saudagran Foundation",
    url: "",
    role: "Market Researcher",
    period: "Jan 2026 – Jul 2026",
    kind: "partner",
    visible: 1,
    position: 8,
  },
  {
    id: 9,
    title: "Mk Volunteers Team",
    image: "",
    alt: "Mk Volunteers Team",
    url: "",
    role: "Career Counselor",
    period: "Jan 2026 – Jul 2026",
    kind: "community",
    visible: 1,
    position: 9,
  },
  {
    id: 10,
    title: "Maple Leaf Cement Factory Limited",
    image: "",
    alt: "Maple Leaf Cement Factory Limited",
    url: "",
    role: "Sales & Marketing Intern",
    period: "Jan 2025 – Mar 2025",
    kind: "corporate",
    visible: 1,
    position: 10,
  },
  {
    id: 11,
    title: "Danzil Events",
    image: "",
    alt: "Danzil Events",
    url: "",
    role: "Assistant Coordinator & Intern",
    period: "May 2025 – Dec 2025",
    kind: "corporate",
    visible: 1,
    position: 11,
  },
  {
    id: 12,
    title: "Luminary Learning Circle Foundation (LLCF)",
    image: "",
    alt: "Luminary Learning Circle Foundation",
    url: "",
    role: "Operations Assistant",
    period: "Jul 2024 – Sep 2024",
    kind: "community",
    visible: 1,
    position: 12,
  },
];

export const profileQualifications: ProfileQualification[] = [
  {
    id: 1,
    title: "Bachelor of Business Administration (BBA) — Organizational Behavior Studies",
    issuer: "Iqra University",
    date_label: "October 2026",
    body: "Focused on organizational behavior, leadership dynamics, human capability systems, and strategic people development.",
    visible: 1,
    position: 1,
  },
  {
    id: 2,
    title: "Bachelor of Business Administration (BBA) — Business Administration & Management",
    issuer: "GU-Tech",
    date_label: "September 2024 – October 2026",
    body: "Core foundation in management, business strategy, market analysis, entrepreneurship, and organizational operations.",
    visible: 1,
    position: 2,
  },
  {
    id: 3,
    title: "Higher Secondary Certificate (HSC) — Pre-Engineering",
    issuer: "The Citizens Foundation College",
    date_label: "June 2021 – July 2024",
    body: "Completed pre-engineering intermediate studies while actively engaging in student outreach, entrepreneurship challenges, and foundational organizational internships.",
    visible: 1,
    position: 3,
  },
];

export const profileExperiences: ProfileExperience[] = [
  {
    id: 1,
    title: "Career Counselor",
    organization: "Mk Volunteers Team",
    logo: "",
    date_label: "January 2026 – July 2026 · 7 months",
    location: "Karachi Division, Sindh, Pakistan",
    kind: "experience",
    body: "Helping students gain greater clarity and direction regarding their educational and professional pathways by aligning career choices with interests, strengths, and personality traits.\n\n- Guided 30+ students in exploring their career paths through personalized one-on-one counseling sessions.\n- Prepared 15+ students for TCF Tertiary Scholarship interviews through mentorship, interview guidance, and targeted feedback.\n- Connected students with senior mentors for domain-specific sessions, particularly in Computer Science.\n- Contributing to a structured career counseling framework for students from underprivileged backgrounds integrating the RIASEC model and MBTI personality assessment.",
    impact: "30+ students counseled one-on-one · 15+ TCF Tertiary Scholarship candidates mentored",
    url: "",
    visible: 1,
    position: 1,
  },
  {
    id: 2,
    title: "Market Researcher",
    organization: "Delhi Punjabi Saudagran Foundation (DPSF)",
    logo: "",
    date_label: "January 2026 – July 2026 · 7 months",
    location: "Karachi, Sindh, Pakistan",
    kind: "experience",
    body: "Designed and executed a comprehensive impact assessment for the DPSF Entrepreneurship Training Program.\n\n- Built a structured survey instrument and collected primary quantitative data from 196 program participants.\n- Managed participant outreach and communication to ensure high response quality.\n- Analyzed quantitative outcomes to evaluate program efficacy and authored a formal report with evidence-based recommendations.",
    impact: "196 research participants surveyed · Full quantitative impact evaluation report delivered",
    url: "",
    visible: 1,
    position: 2,
  },
  {
    id: 3,
    title: "Fellow — Cohort 1",
    organization: "The Capstone Program (TCP)",
    logo: "/images/orgs/capstone-program.webp",
    date_label: "April 2026 · 1 month",
    location: "Karachi Division, Sindh, Pakistan",
    kind: "fellowship",
    body: "Selected from a highly competitive nationwide applicant pool across Pakistan (~13% acceptance rate) for an intensive Career Readiness Fellowship.\n\n- Engaged with mentors and industry professionals from McKinsey & Company, IBA, International Trade Centre (ITC), State Bank of Pakistan, and London Strategy Centre.\n- Completed the Design Your Zindagi (DYZ) Workshop, conducted in collaboration with Stanford University and IBA, applying design thinking to career exploration and problem-solving.\n- Strengthened personal strategy, executive communication, LinkedIn positioning, and presentation skills alongside a nationwide peer network.",
    impact: "Top ~13% nationwide selection · Design Your Zindagi (Stanford & IBA) participant",
    url: "",
    visible: 1,
    position: 3,
  },
  {
    id: 4,
    title: "Conference Participant — Young Leaders Conference (YLC)",
    organization: "School of Leadership",
    logo: "",
    date_label: "December 2025 – March 2026 · 4 months",
    location: "Karachi, Sindh, Pakistan",
    kind: "fellowship",
    body: "Selected at the national level among 150+ delegates across Pakistan to participate in the Young Leaders Conference (YLC), demonstrating initiative by approaching sponsors and raising funds to support participation.\n\n- Co-designed and implemented the Rights Baithak Project, a Social Action Project raising awareness about civic rights and the responsibilities of active citizenship.\n- Delivered awareness sessions in schools on students' rights and responsibilities.\n- Supported the GenZ Walk initiative alongside the Hammad Foundation to champion human rights and civic engagement.",
    impact: "500+ individuals reached through Rights Baithak · National cohort of 150+ young leaders",
    url: "",
    visible: 1,
    position: 4,
  },
  {
    id: 5,
    title: "Ambassador & Volunteer",
    organization: "CIRCLE Women Association",
    logo: "/images/orgs/circle-women.webp",
    date_label: "May 2025 – May 2026 · 1 year 1 month",
    location: "Karachi Division, Sindh, Pakistan",
    kind: "volunteering",
    body: "Led community digital inclusion, work readiness, and women's economic empowerment initiatives across Karachi.\n\n- Managed the WRP (Work Readiness Program) Training Cohort in Karachi (26–30 May 2025) as CIRCLE Ambassador.\n- Facilitated 5+ Circle Baji awareness and onboarding sessions at organizations including Salma Ghar and RLCC, Aga Khan.\n- Conducted two onboarding sessions at the Disabled People's Welfare Organization, onboarding 30+ participants onto the Circle Baji platform.\n- Represented CIRCLE Women Association at PSTD and partner events.\n- Facilitated Work Readiness training sessions in collaboration with Faysal Bank and Digital Literacy sessions in partnership with Aga Khan (May – Oct 2025).",
    impact: "5+ community sessions facilitated · 30+ participants onboarded at DPWO · WRP Karachi cohort managed",
    url: "https://circlewomen.org",
    visible: 1,
    position: 5,
  },
  {
    id: 6,
    title: "Assistant Coordinator & Intern",
    organization: "Danzil Events",
    logo: "",
    date_label: "May 2025 – December 2025 · 8 months",
    location: "Karachi Division, Sindh, Pakistan",
    kind: "experience",
    body: "Joined as an Intern during second semester (May – July 2025) and progressed into a part-time Assistant Coordinator role during third semester (August – December 2025).\n\n- Coordinated end-to-end event operations, vendor logistics, and on-ground execution.\n- Managed internal and external stakeholder, partner, and sponsor communications via correspondence and calls.\n- Drafted and managed formal documentation including Memorandums of Understanding (MoUs), proposals, and sponsorship letters.",
    impact: "8 months startup operations · MoUs, sponsorship proposals & stakeholder coordination",
    url: "",
    visible: 1,
    position: 6,
  },
  {
    id: 7,
    title: "Sales & Marketing Intern",
    organization: "Maple Leaf Cement Factory Limited",
    logo: "",
    date_label: "January 2025 – March 2025 · 3 months",
    location: "Karachi Division, Sindh, Pakistan",
    kind: "experience",
    body: "Completed corporate internship during the first semester of university, gaining hands-on exposure to B2B market research and customer engagement in the construction materials sector.\n\n- Analyzed market needs and purchasing preferences of construction firms across varied project environments.\n- Promoted HD Putty products, supporting brand visibility and direct client outreach.",
    impact: "B2B construction market analysis · Brand outreach for HD Putty line",
    url: "",
    visible: 1,
    position: 7,
  },
  {
    id: 8,
    title: "Assistant",
    organization: "Luminary Learning Circle Foundation (LLCF)",
    logo: "",
    date_label: "July 2024 – September 2024 · 3 months",
    location: "Karachi Division, Sindh, Pakistan",
    kind: "experience",
    body: "Completed directly after higher secondary studies at TCF College.\n\n- Supported daily organizational operations and administrative workflows.\n- Handled stakeholder outreach through cold calls, email correspondence with investors, and visitor coordination.",
    impact: "Early exposure to investor correspondence and organizational operations",
    url: "",
    visible: 1,
    position: 8,
  },
  {
    id: 9,
    title: "Apprentice — Entrepreneurship Apprenticeship Program",
    organization: "Enterprise Challenge Pakistan",
    logo: "/images/orgs/enterprise-challenge.webp",
    date_label: "October 2023 – February 2024 · 5 months",
    location: "Karachi Division, Sindh, Pakistan",
    kind: "fellowship",
    body: "Selected among 220+ applicants (top 9% selection rate) for Pakistan's premier youth entrepreneurship apprenticeship organized by Prince's Trust International and SEED Ventures.\n\n- Cultivated an entrepreneurial mindset through hands-on venture exercises and practical problem-solving.\n- Identified real socioeconomic challenges and designed sustainable solutions aligned with the UN Sustainable Development Goals (SDGs).",
    impact: "Top 9% selection rate among 220+ applicants · SDG-aligned venture design",
    url: "",
    visible: 1,
    position: 9,
  },
  {
    id: 10,
    title: "Mentee — English Communication Curriculum (Cohort 10)",
    organization: "Manzl Mentorship Program",
    logo: "/images/orgs/manzl.webp",
    date_label: "Cohort 10",
    location: "Karachi, Pakistan",
    kind: "fellowship",
    body: "Selected as a mentee in Manzl's structured mentorship program, completing the English Communication Curriculum for Cohort 10.\n\n- Participated in mentoring sessions, reflective learning, and practical workshops focused on leadership, executive communication, career planning, and professional growth.",
    impact: "Completed Manzl Cohort 10 English Communication & Mentorship Curriculum",
    url: "",
    visible: 1,
    position: 10,
  },
  {
    id: 11,
    title: "Outreach Volunteer — Change Makers Campaign",
    organization: "The Citizens Foundation (TCF)",
    logo: "/images/orgs/tcf.webp",
    date_label: "Alumni Pathways",
    location: "Karachi, Pakistan",
    kind: "volunteering",
    body: "Played a pivotal role in The Citizens Foundation's outreach campaign by creating awareness of educational opportunities and inspiring students to pursue higher education and scholarships.",
    impact: "Expanded educational opportunity awareness among TCF students",
    url: "https://www.tcf.org.pk",
    visible: 1,
    position: 11,
  },
];

export const profileAchievements: ProfileAchievement[] = [
  {
    id: 1,
    title: "Certificate of Completion — The Capstone Program (Cohort 1)",
    issuer: "The Capstone Program (TCP)",
    category: "Fellowships & Programs",
    date_label: "April 2026",
    signatory: "Fawad Faruqi (Program Facilitator) & Hassam Alam (Founder)",
    body: "Selected from a competitive nationwide pool (~13% acceptance rate) for intensive career readiness, strategic networking with leaders from McKinsey, IBA, ITC, and SBP, and the Stanford/IBA Design Your Zindagi Workshop.",
    image: "/images/certificates/capstone-program-tcp.webp",
    alt: "Certificate of Completion awarded to Madiha Rasheed for Cohort 1 of The Capstone Program",
    featured: 1,
    visible: 1,
    position: 1,
  },
  {
    id: 2,
    title: "Certificate of Appreciation — WRP Training Cohort (Karachi)",
    issuer: "CIRCLE Women Association",
    category: "Leadership & Advocacy",
    date_label: "26–30 May 2025",
    signatory: "Sadaffe Abid (CEO & Founder, CIRCLE Women Association)",
    body: "Recognized for active leadership as a CIRCLE Ambassador in managing the Work Readiness Program (WRP) Training Cohort in Karachi.",
    image: "/images/certificates/circle-wrp-ambassador.webp",
    alt: "Certificate of Appreciation from CIRCLE Women Association to Madiha Rasheed for managing the WRP Training Cohort Karachi",
    featured: 1,
    visible: 1,
    position: 2,
  },
  {
    id: 3,
    title: "Certificate of Participation — Enterprise Challenge Pakistan (2023–24)",
    issuer: "Prince's Trust International & SEED Ventures",
    category: "Fellowships & Programs",
    date_label: "24 February 2024",
    signatory: "Will Straw (CEO, Prince's Trust International) & Shaista Ayesha (CEO, SEED Ventures)",
    body: "Selected in the top 9% of 220+ applicants for Pakistan's largest entrepreneurship challenge for young people, supported by Jubilee Life Insurance and Engro Foundation.",
    image: "/images/certificates/ecp-enterprise-challenge.webp",
    alt: "Enterprise Challenge Pakistan 2023-24 Certificate awarded to Young Entrepreneur Madiha Rasheed",
    featured: 1,
    visible: 1,
    position: 3,
  },
  {
    id: 4,
    title: "Certificate of Appreciation — Nano Influencer Training Academy 2025",
    issuer: "CIRCLE Women Association & Nano Influencer Academy",
    category: "Training & Mentorship",
    date_label: "2025",
    signatory: "Sadaffe Abid (CEO & Founder, CIRCLE Women Association)",
    body: "Completed a 3-day intensive training program focused on purposeful digital communication, content strategy, and community storytelling.",
    image: "/images/certificates/circle-nano-influencer.webp",
    alt: "Certificate of Appreciation for Madiha Rasheed completing Nano Influencer Training Academy 2025",
    featured: 0,
    visible: 1,
    position: 4,
  },
  {
    id: 5,
    title: "Certificate of Appreciation — Manzl Mentorship Program (Cohort 10)",
    issuer: "Manzl",
    category: "Training & Mentorship",
    date_label: "Cohort 10",
    signatory: "Shaan Mehdi, Shayaan Mehdi & Umad Khan (Co-Founders)",
    body: "Completed Manzl's English Communication Curriculum and structured mentorship program strengthening leadership, communication, and career planning.",
    image: "/images/certificates/manzl-mentorship.webp",
    alt: "Manzl Certificate of Appreciation - Mentee awarded to Madiha Rasheed for Cohort 10",
    featured: 0,
    visible: 1,
    position: 5,
  },
  {
    id: 6,
    title: "Change Makers Outreach Recognition",
    issuer: "The Citizens Foundation (TCF)",
    category: "Community & Outreach",
    date_label: "Alumni Pathways",
    signatory: "Shazia Kamal (EVP Alumni Pathways, The Citizens Foundation)",
    body: "Honored for playing a pivotal role in TCF's outreach campaign by creating awareness of educational opportunities and inspiring students to pursue them.",
    image: "/images/certificates/tcf-change-makers.webp",
    alt: "The Citizens Foundation Change Makers certificate awarded to Madiha Rasheed",
    featured: 1,
    visible: 1,
    position: 6,
  },
  {
    id: 7,
    title: "Rights Baithak Social Action Project — 500+ Individuals Reached",
    issuer: "School of Leadership · Young Leaders Conference (YLC)",
    category: "Leadership & Advocacy",
    date_label: "December 2025 – March 2026",
    signatory: "National Delegate (150+ selected across Pakistan)",
    body: "Co-designed and implemented a Social Action Project educating 500+ community members and school students on civic rights and active citizenship, alongside supporting GenZ Walk with Hammad Foundation.",
    image: "",
    alt: "",
    featured: 1,
    visible: 1,
    position: 7,
  },
  {
    id: 8,
    title: "DPSF Entrepreneurship Training Program Impact Evaluation",
    issuer: "Delhi Punjabi Saudagran Foundation",
    category: "Research & Strategy",
    date_label: "January 2026 – July 2026",
    signatory: "Market Researcher",
    body: "Designed and analyzed a 196-participant quantitative impact study evaluating program outcomes and delivering evidence-based strategic recommendations.",
    image: "",
    alt: "",
    featured: 0,
    visible: 1,
    position: 8,
  },
];

export const profileMilestones: ProfileMilestone[] = [
  {
    id: 1,
    title: "Career Counselor & Impact Researcher",
    date_label: "2026",
    body: "Completed The Capstone Program Fellowship (~13% acceptance), guided 30+ students in career counseling with Mk Volunteers Team, and led a 196-participant impact assessment at DPSF while completing dual-focus BBA studies.",
    visible: 1,
    position: 1,
  },
  {
    id: 2,
    title: "Young Leaders Conference & Rights Baithak",
    date_label: "2025 – 2026",
    body: "Selected nationally among 150+ delegates for School of Leadership's YLC and co-led Rights Baithak, reaching 500+ individuals on civic rights and youth responsibility.",
    visible: 1,
    position: 2,
  },
  {
    id: 3,
    title: "CIRCLE Ambassador, Startup Operations & Corporate Internship",
    date_label: "2025",
    body: "Managed CIRCLE Women Association's Karachi WRP cohort, facilitated Work Readiness & Digital Literacy sessions with Faysal Bank and Aga Khan, coordinated operations at Danzil Events, and interned at Maple Leaf Cement.",
    visible: 1,
    position: 3,
  },
  {
    id: 4,
    title: "Enterprise Challenge Pakistan & Foundation in Management",
    date_label: "2023 – 2024",
    body: "Selected in the top 9% of 220+ applicants for Enterprise Challenge Pakistan, completed LLCF operations assistantship, and graduated from TCF College before beginning BBA studies.",
    visible: 1,
    position: 4,
  },
];

export const profileGalleryCertificates: Row[] = profileAchievements
  .filter((a) => !!a.image)
  .map((a) => ({
    id: a.id,
    title: a.title,
    category: a.category,
    image: a.image,
    alt: a.alt,
    body: [a.issuer, a.date_label, a.signatory ? `Signed by ${a.signatory}` : "", a.body].filter(Boolean).join(" · "),
    video: "",
    visible: 1,
    position: a.position,
  }));

export const coreCompetencies = [
  {
    group: "Strategy & Research",
    items: ["Capability Building", "Growth Strategy", "Impact Evaluation", "Market & Quantitative Research", "Report Writing"],
  },
  {
    group: "Leadership & Facilitation",
    items: ["Work Readiness Facilitation", "Digital Literacy Training", "Career Counseling (RIASEC & MBTI)", "Public Speaking & Presentations", "Design Thinking (DYZ)"],
  },
  {
    group: "Operations & Partnerships",
    items: ["Stakeholder Engagement", "MoUs, Proposals & Sponsorships", "Event Operations & Logistics", "Community Mobilization", "Networking"],
  },
];

export const focusPillars = [
  {
    title: "Capability Building & Consulting",
    description: "Designing structured frameworks that help individuals and emerging organizations bridge the gap between current capacity and long-term potential.",
  },
  {
    title: "Entrepreneurship & Growth Strategy",
    description: "Combining market research, SDG-aligned venture thinking, and practical problem-solving to unlock sustainable socioeconomic value.",
  },
  {
    title: "Youth Leadership & Education",
    description: "Empowering students through career counseling (RIASEC & MBTI), scholarship mentorship, work readiness, and civic action initiatives.",
  },
  {
    title: "AI-Enabled Learning & Digital Inclusion",
    description: "Exploring how modern technology and AI-driven approaches accelerate accessible skill development across underserved communities.",
  },
];
