// Single source of truth for portfolio content. Every design reads from here.

export const profile = {
  name: "Mayank Bhadrasen",
  firstName: "Mayank",
  lastName: "Bhadrasen",
  role: "Full-Stack Developer & AI Automation Engineer",
  roleShort: ["Full-Stack Developer", "AI Automation Engineer"],
  tagline: "I build the product, and the automations behind it.",
  location: "Boston, MA",
  email: "bhadrasen.m@northeastern.edu",
  photo: "/images/profile-photo.jpeg",
  resume: "/GradResume_Mayank.pdf",
  summary: [
    "I'm a full-stack engineer with 3 years of experience shipping React and Next.js products, secure API integrations and the workflows that connect them. I'm finishing an M.S. in Information Systems at Northeastern University.",
    "I've been the technical point of contact on platform migrations and API delivery, working across engineering, product and business teams. These days I run self-hosted n8n in Docker and build agentic automations that connect LLMs, APIs and business systems.",
  ],
}

export const socials = {
  github: "https://github.com/Mayank-1024",
  linkedin: "https://linkedin.com/in/mayankbhadrasen",
  x: "https://x.com/Mbhadrasen",
  email: `mailto:${profile.email}`,
}

export const stats = [
  { value: "3+", label: "years shipping production software" },
  { value: "30-40%", label: "faster deployments via structured API validation" },
  { value: "60%", label: "less code redundancy from a shared component library" },
  { value: "20+", label: "HR admins on an access-control layer I designed" },
]

export const venture = {
  name: "Qixazow",
  url: "https://qixazow.com",
  domain: "qixazow.com",
  role: "Co-founder",
  period: "2026 - Present",
  summary:
    "An AI publication and consultancy I co-founded with two fellow AI professionals, focused on n8n, Claude and bringing AI into real businesses.",
  short: "Writing, consulting and video on n8n, Claude and business AI, with two fellow AI professionals.",
  pillars: [
    { title: "Publication", body: "In-depth guides on n8n and Claude" },
    { title: "Consulting", body: "Workflow automation for businesses" },
    { title: "Video", body: "Walkthroughs of AI tools" },
  ],
}

export type Project = {
  slug: string
  title: string
  kicker: string
  stack: string[]
  description: string
  image: string
  demo?: string
  code?: string
}

export const projects: Project[] = [
  {
    slug: "uniswap",
    title: "Uniswap V2 Interface",
    kicker: "DeFi · Production",
    stack: ["Next.js", "TypeScript", "ethers / viem", "Chart.js"],
    description:
      "Production-deployed swap and liquidity interface with pool selection, live reserve and price analytics, and constant-product (x·y=k) curve visualisations.",
    image: "/images/uniswap-v2-dashboard.png",
    demo: "https://mayankuniswapv2-ui.vercel.app/",
    code: "https://github.com/Mayank-1024/UniswapV2",
  },
  {
    slug: "nextap",
    title: "NexTap NFC Wallet",
    kicker: "Web3 · Hardware",
    stack: ["React", "TypeScript", "Redux"],
    description:
      "Wallet platform using NFC cards and QR-based login to streamline onboarding and transaction approval, with state-managed auth and approval flows tested on real devices.",
    image: "/images/nextap-project.png",
    code: "https://github.com/Mayank-1024/NexTap-NFC-App",
  },
  {
    slug: "emergency",
    title: "Emergency Alert App",
    kicker: "Safety · Cross-platform",
    stack: ["Java (Swing)", "Twilio API"],
    description:
      "Cross-platform safety app that sends location-based SOS alerts over SMS and email, triggered by a button on desktop or by motion on mobile.",
    image: "/images/emergency-alert.png",
    code: "https://github.com/Mayank-1024/EmergencyAlert_App",
  },
]

export type Role = {
  id: string
  title: string
  company: string
  location: string
  period: string
  current?: boolean
  note?: string
  bullets: string[]
  stack: string[]
  /** Which line drawing the On-Chain design shows for this role. */
  scene: "workflow" | "interior" | "org" | "hardware"
}

export const experience: Role[] = [
  {
    id: "qixazow",
    title: "Co-founder",
    company: "Qixazow",
    location: "Remote",
    period: "2026 - Present",
    current: true,
    bullets: [
      venture.short,
      "In-depth guides on n8n and Claude, workflow automation for businesses, and video walkthroughs of AI tools.",
    ],
    stack: ["n8n", "Claude", "AI agents", "Automation consulting"],
    scene: "workflow",
  },
  {
    id: "veraai",
    title: "Frontend Lead",
    company: "VeraAI Technologies Inc.",
    location: "St. Petersburg, FL (Remote)",
    period: "Jul 2025 - Dec 2025",
    note: "Promoted from SDE Intern",
    bullets: [
      "Technical point of contact for architecture decisions; ran sprint planning and coordinated multi-developer merges and release stability.",
      "Integrated multi-source product catalogs (IKEA, Home Depot) from Firestore into one normalised product model for live inventory placement.",
      "Containerised the product in Docker, taking it from a local Next.js codebase to a reproducible hosted deployment with a standard release path.",
      "Built an image-to-layout pipeline (photo → 2D template → 3D placement sandbox), Stripe billing across tiers and an in-product AI chatbot.",
    ],
    stack: ["Next.js", "TypeScript", "Three.js", "Firebase", "Docker", "Stripe"],
    scene: "interior",
  },
  {
    id: "aess",
    title: "Assistant Manager, Front-End Development",
    company: "AESS Solutions Pvt. Ltd.",
    location: "Bhopal, India",
    period: "Nov 2022 - Nov 2023",
    bullets: [
      "Technical point of contact for the PeopleSol HRMS migration from .NET to React: discovery, phased cutover and stakeholder trade-offs.",
      "Improved deployment efficiency 30-40% by owning API testing, integrations and production bug triage.",
      "Designed the Master Section access-control layer governing what 20+ HR administrators could view and modify.",
      "Shipped D3 org-hierarchy visualisation and API-integrated scheduling; a reusable component library cut redundancy 60%.",
    ],
    stack: ["React", "Material UI", "D3.js", "Ant Design", "REST APIs"],
    scene: "org",
  },
  {
    id: "appright",
    title: "Associate Software Engineer",
    company: "Appright Software Solutions Pvt. Ltd.",
    location: "Bangalore, India",
    period: "Jul 2021 - Nov 2022",
    bullets: [
      "Built OAuth 2.0 and JWT authenticated Django APIs for hardware control systems, tested in Postman and integrated end to end.",
      "Delivered Visitor Alert and Service Management modules, cutting component latency 20% and template render latency 30%.",
      "Optimised database operations for 30% better data handling; managed code review and pull requests across the team.",
    ],
    stack: ["Django", "OAuth 2.0", "JWT", "Postman", "React", "Redux"],
    scene: "hardware",
  },
]

export const education = [
  {
    degree: "M.S., Information Systems",
    school: "Northeastern University",
    location: "Boston, MA",
    period: "2024 - 2026",
    detail: "Application Engineering · Web UX · Cryptocurrency & Smart Contract Engineering",
  },
  {
    degree: "B.E., Information Technology",
    school: "Shri G. S. Institute of Technology and Science",
    location: "Indore, India",
    period: "2017 - 2021",
    detail: "Web Engineering · Data Structures · Artificial Intelligence",
  },
]

export const publication = {
  title: "Safeguarding Digital Assets: Harnessing the Power of Artificial Intelligence for Enhanced Data Protection",
  venue: "IJISRT, Vol. 8 Issue 12",
  date: "Dec 2023",
}

/** Where a skill was used: a role id, a project slug, or "northeastern" for coursework. */
export type UsedIn = "qixazow" | "veraai" | "aess" | "appright" | "uniswap" | "nextap" | "emergency" | "northeastern"

export type Skill = {
  name: string
  /** simple-icons export name (si*) or a generic icon key the design maps itself. */
  icon: string
  used: UsedIn[]
}

export type SkillGroup = { group: string; blurb: string; items: Skill[] }

// Usage is taken from the resume; skills without a specific role/project listed have an empty `used`.
export const skills: SkillGroup[] = [
  {
    group: "Integration & Automation",
    blurb: "Wiring LLMs, APIs and business systems into workflows that run on their own.",
    items: [
      { name: "n8n", icon: "siN8n", used: ["qixazow"] },
      { name: "LLM / agentic workflows", icon: "bot", used: ["qixazow", "veraai"] },
      { name: "REST APIs", icon: "network", used: ["appright", "aess"] },
      { name: "Webhooks", icon: "webhook", used: ["qixazow"] },
      { name: "OAuth 2.0", icon: "key", used: ["appright"] },
      { name: "JWT", icon: "siJsonwebtokens", used: ["appright"] },
      { name: "Postman", icon: "siPostman", used: ["appright"] },
    ],
  },
  {
    group: "Languages & Frameworks",
    blurb: "Typed frontends, Python backends and a little Solidity.",
    items: [
      { name: "TypeScript", icon: "siTypescript", used: ["veraai", "uniswap", "nextap"] },
      { name: "JavaScript", icon: "siJavascript", used: ["aess", "appright"] },
      { name: "Python", icon: "siPython", used: ["appright"] },
      { name: "Java", icon: "siOpenjdk", used: ["emergency"] },
      { name: "SQL", icon: "database", used: ["appright"] },
      { name: "Solidity", icon: "siSolidity", used: ["northeastern"] },
      { name: "React", icon: "siReact", used: ["aess", "appright", "nextap"] },
      { name: "Next.js", icon: "siNextdotjs", used: ["veraai", "uniswap"] },
      { name: "Node.js", icon: "siNodedotjs", used: [] },
      { name: "Redux", icon: "siRedux", used: ["appright", "nextap"] },
      { name: "Django", icon: "siDjango", used: ["appright"] },
    ],
  },
  {
    group: "Cloud & DevOps",
    blurb: "From a local codebase to a reproducible deployment.",
    items: [
      { name: "Docker", icon: "siDocker", used: ["veraai", "qixazow"] },
      { name: "AWS", icon: "cloud", used: [] },
      { name: "Firebase", icon: "siFirebase", used: ["veraai"] },
      { name: "Vercel", icon: "siVercel", used: ["uniswap"] },
      { name: "VPS hosting", icon: "server", used: ["qixazow"] },
      { name: "CI/CD", icon: "siGithubactions", used: ["veraai"] },
      { name: "Git / GitHub", icon: "siGithub", used: ["veraai", "appright"] },
    ],
  },
  {
    group: "Data & Visualisation",
    blurb: "Stores that scale and charts people can read.",
    items: [
      { name: "MongoDB", icon: "siMongodb", used: [] },
      { name: "SQLite", icon: "siSqlite", used: [] },
      { name: "Firestore", icon: "siFirebase", used: ["veraai"] },
      { name: "D3.js", icon: "siD3", used: ["aess"] },
      { name: "Chart.js", icon: "siChartdotjs", used: ["uniswap"] },
    ],
  },
]

export const marquee = [
  "Next.js",
  "React",
  "TypeScript",
  "n8n",
  "Claude",
  "Docker",
  "Django",
  "Solidity",
  "OAuth 2.0",
  "Webhooks",
  "Three.js",
  "D3.js",
  "Firebase",
  "AWS",
]

export const nav = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
]
