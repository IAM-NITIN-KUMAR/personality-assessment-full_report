/**
 * Secure Steps course catalog. The single source of truth for:
 *   1. The course-picker on the landing page.
 *   2. The "Top Course Recommendations" + "Alternative Pathways" sections of
 *      the report (filtered by discipline, ranked by archetype fit).
 *
 * Editing rules:
 *   - `id` is stable and url-safe — never reuse, never rename.
 *   - `careers` should be 3–5 short entries, salary ranges in LPA.
 *   - `weights` are 0..1 multipliers that shift archetype fit. Optional.
 */

import type { Dimension } from "./types";

export type Discipline =
  | "tech_cs"
  | "tech_engg"
  | "business"
  | "commerce"
  | "science"
  | "economics"
  | "psychology"
  | "humanities"
  | "media"
  | "law"
  | "design_arch"
  | "education"
  | "hospitality"
  | "schooling";

export interface DisciplineMeta {
  id: Discipline;
  label: string;
  /** One-line description shown under the tile. */
  blurb: string;
  /** True if Routes / question banks are already discipline-specific. */
  routesReady: boolean;
}

export const DISCIPLINES: DisciplineMeta[] = [
  { id: "tech_cs",      label: "Tech & Computer Science",      blurb: "BCA, BTech CS, AI/ML, Data Science, Cybersecurity",                routesReady: true  },
  { id: "tech_engg",    label: "Engineering (non-CS)",          blurb: "Mechanical, Electrical, Civil, Robotics, Automotive",              routesReady: false },
  { id: "business",     label: "Business Administration (BBA)", blurb: "BBA Honours and specialisations — Finance, Strategy, Marketing",   routesReady: false },
  { id: "commerce",     label: "Commerce (BCom)",               blurb: "BCom variants — Accountancy, Taxation, Finance & Investment",      routesReady: false },
  { id: "science",      label: "Pure & Applied Sciences",       blurb: "Physics, Chemistry, Biotech, Life Sciences, Actuarial",            routesReady: false },
  { id: "economics",    label: "Economics & Quant",             blurb: "BSc Economics, Math+Stats, Econometrics, Data Analytics",          routesReady: false },
  { id: "psychology",   label: "Psychology",                    blurb: "Clinical, Organisational, Counselling, Research",                   routesReady: false },
  { id: "humanities",   label: "Humanities & Liberal Arts",     blurb: "English, History, Political Science, Philosophy, Liberal Arts",     routesReady: false },
  { id: "media",        label: "Media, Comm & Performing Arts", blurb: "Journalism, Communication, Theatre, Music, Performing Arts",        routesReady: false },
  { id: "law",          label: "Law (Integrated)",              blurb: "BA LLB and BBA LLB Honours",                                         routesReady: false },
  { id: "design_arch",  label: "Design & Architecture",         blurb: "Architecture, UI/UX, Product, Communication Design",                routesReady: false },
  { id: "education",    label: "Education (BEd)",               blurb: "Teaching, school leadership, EdTech, curriculum",                    routesReady: false },
  { id: "hospitality",  label: "Hotel Management",              blurb: "BHM, F&B, Revenue, Luxury Hospitality",                              routesReady: false },
  { id: "schooling",    label: "Schooling (High School / K-12)", blurb: "Currently in high school / completing K-12 education",              routesReady: false },
];

export interface CourseCareer {
  role: string;
  salaryIndia: string;
}

export interface Course {
  id: string;
  title: string;
  discipline: Discipline;
  level?: "bachelors" | "masters";
  description: string;
  careers: CourseCareer[];
  /**
   * Optional dimension weights — positive values boost match for students who
   * lean that way. Multiplied into the base match score during ranking.
   */
  weights?: Partial<Record<Dimension, number>>;
}

export const COURSES: Course[] = [
  // ── TECH & COMPUTER SCIENCE ──────────────────────────────────────────
  {
    id: "bca",
    title: "Bachelor of Computer Applications (BCA / Honours / with Research)",
    discipline: "tech_cs",
    description: "Three-year applied CS degree. Faster on-ramp than B.Tech, well-suited to students wanting to build + ship.",
    careers: [
      { role: "Software / Full-stack Developer", salaryIndia: "₹6–25 LPA" },
      { role: "Data / ML Engineer",               salaryIndia: "₹10–35 LPA" },
      { role: "Cloud / DevOps Engineer",          salaryIndia: "₹10–40 LPA" },
      { role: "Product Manager (Tech)",           salaryIndia: "₹15–35 LPA" },
      { role: "Tech Founder / Indie Builder",     salaryIndia: "Highly scalable" },
    ],
    weights: { drive: 0.25, decision_style: 0.15, structure: 0.10 },
  },
  {
    id: "btech_cse",
    title: "B.Tech — Computer Science and Engineering",
    discipline: "tech_cs",
    description: "Four-year rigorous CS. Strongest for students aiming at top product companies, research, or graduate studies.",
    careers: [
      { role: "Software Engineer (Product Cos)", salaryIndia: "₹12–35 LPA" },
      { role: "Backend / Systems Engineer",      salaryIndia: "₹15–45 LPA" },
      { role: "Research Engineer / MS-PhD track", salaryIndia: "₹10–40 LPA" },
    ],
    weights: { decision_style: 0.25, structure: 0.25, drive: 0.15 },
  },
  {
    id: "btech_cse_aiml",
    title: "B.Tech — Computer Science (AI & Machine Learning)",
    discipline: "tech_cs",
    description: "CSE with deeper ML/AI specialisation. Best for students who want to build with models and invest in deep math.",
    careers: [
      { role: "ML / AI Engineer",          salaryIndia: "₹15–50 LPA" },
      { role: "Applied Research Engineer", salaryIndia: "₹15–40 LPA" },
      { role: "AI Product Manager",        salaryIndia: "₹18–45 LPA" },
    ],
    weights: { drive: 0.3, decision_style: 0.2, risk: 0.15 },
  },
  {
    id: "btech_cse_cyber",
    title: "B.Tech — CSE (Cyber Security)",
    discipline: "tech_cs",
    description: "Deeply technical, less crowded than ML. For analytical, patient, risk-aware students wanting a long-term moat.",
    careers: [
      { role: "Security Engineer / Pentester", salaryIndia: "₹8–30 LPA" },
      { role: "Application Security Lead",     salaryIndia: "₹20–60 LPA" },
      { role: "Cloud Security / GRC",          salaryIndia: "₹12–40 LPA" },
    ],
    weights: { structure: 0.3, decision_style: 0.25, risk: 0.1 },
  },
  {
    id: "btech_cse_ds",
    title: "B.Tech — CSE (Data Science)",
    discipline: "tech_cs",
    description: "Bridges classical CS with statistics and large-scale data systems.",
    careers: [
      { role: "Data Scientist",        salaryIndia: "₹10–40 LPA" },
      { role: "Data Engineer",         salaryIndia: "₹10–35 LPA" },
      { role: "Analytics Consultant",  salaryIndia: "₹12–35 LPA" },
    ],
    weights: { decision_style: 0.3, structure: 0.2, drive: 0.1 },
  },
  {
    id: "btech_cse_iot",
    title: "B.Tech — CSE (IoT)",
    discipline: "tech_cs",
    description: "CS with hardware-meets-software focus. Suited to builders interested in connected devices, edge compute, robotics.",
    careers: [
      { role: "IoT / Embedded Engineer", salaryIndia: "₹8–25 LPA" },
      { role: "Hardware-Software Lead",  salaryIndia: "₹15–40 LPA" },
      { role: "Robotics Engineer",       salaryIndia: "₹10–30 LPA" },
    ],
    weights: { drive: 0.25, structure: 0.2, risk: 0.15 },
  },
  {
    id: "btech_aiml",
    title: "B.Tech — Artificial Intelligence & Machine Learning",
    discipline: "tech_cs",
    description: "Pure AI/ML degree — heavier on math and modelling than a CSE spec.",
    careers: [
      { role: "ML Researcher",           salaryIndia: "₹12–45 LPA" },
      { role: "Deep Learning Engineer",  salaryIndia: "₹15–50 LPA" },
      { role: "AI Product Lead",         salaryIndia: "₹20–60 LPA" },
    ],
    weights: { decision_style: 0.3, drive: 0.2, structure: 0.2 },
  },
  {
    id: "bsc_cs_ds",
    title: "B.Sc — Computer Science with Data Science",
    discipline: "tech_cs",
    description: "Three-year science track. Lighter on engineering, stronger on analytical / research thinking.",
    careers: [
      { role: "Data Analyst",       salaryIndia: "₹6–18 LPA" },
      { role: "Quantitative Analyst", salaryIndia: "₹12–40 LPA" },
      { role: "Software Developer", salaryIndia: "₹8–25 LPA" },
    ],
    weights: { decision_style: 0.25, structure: 0.2 },
  },
  {
    id: "bsc_ds_ai",
    title: "B.Sc — Data Science and Artificial Intelligence",
    discipline: "tech_cs",
    description: "Modern three-year degree blending CS, statistics, AI. Strong on-ramp to data + ML careers.",
    careers: [
      { role: "Data Scientist",       salaryIndia: "₹10–35 LPA" },
      { role: "ML Engineer",          salaryIndia: "₹12–40 LPA" },
      { role: "Analytics Consultant", salaryIndia: "₹10–30 LPA" },
    ],
    weights: { decision_style: 0.25, drive: 0.15 },
  },

  // ── ENGINEERING (non-CS) ────────────────────────────────────────────
  {
    id: "btech_mech",
    title: "B.Tech — Mechanical Engineering",
    discipline: "tech_engg",
    description: "Classic mechanical with applications in manufacturing, automotive, energy, robotics.",
    careers: [
      { role: "Design / Production Engineer", salaryIndia: "₹6–18 LPA" },
      { role: "Robotics / Mechatronics",      salaryIndia: "₹8–25 LPA" },
      { role: "R&D Engineer (Defense / Aero)", salaryIndia: "₹10–30 LPA" },
    ],
    weights: { structure: 0.25, drive: 0.15 },
  },
  {
    id: "btech_eee",
    title: "B.Tech — Electrical and Electronics Engineering",
    discipline: "tech_engg",
    description: "Power systems, electronics, control systems. Versatile foundation.",
    careers: [
      { role: "Electrical Design Engineer",   salaryIndia: "₹6–18 LPA" },
      { role: "Power Systems Engineer",       salaryIndia: "₹8–22 LPA" },
      { role: "Embedded / Firmware Engineer", salaryIndia: "₹8–25 LPA" },
    ],
    weights: { structure: 0.25, decision_style: 0.15 },
  },
  {
    id: "btech_ece",
    title: "B.Tech — Electronics and Communication Engineering",
    discipline: "tech_engg",
    description: "Signal processing, communications, VLSI. Bridges hardware and software.",
    careers: [
      { role: "VLSI Design Engineer",     salaryIndia: "₹8–25 LPA" },
      { role: "Signal / Wireless Engineer", salaryIndia: "₹7–20 LPA" },
      { role: "Embedded Systems Engineer", salaryIndia: "₹8–25 LPA" },
    ],
    weights: { structure: 0.25, decision_style: 0.2 },
  },
  {
    id: "btech_civil",
    title: "B.Tech — Civil Engineering (with AI/ML applications)",
    discipline: "tech_engg",
    description: "Modern civil + smart-infrastructure track. Useful for students wanting to bring data into construction and planning.",
    careers: [
      { role: "Structural / Site Engineer", salaryIndia: "₹5–15 LPA" },
      { role: "Smart Infrastructure Lead",  salaryIndia: "₹10–25 LPA" },
      { role: "Project Manager (Construction)", salaryIndia: "₹8–25 LPA" },
    ],
    weights: { structure: 0.3, decision_style: 0.15 },
  },
  {
    id: "btech_auto",
    title: "B.Tech — Automobile Engineering",
    discipline: "tech_engg",
    description: "Vehicle systems, EVs, autonomous tech. Fast-evolving with the EV transition.",
    careers: [
      { role: "Automotive Design Engineer", salaryIndia: "₹6–18 LPA" },
      { role: "EV Powertrain Engineer",     salaryIndia: "₹8–22 LPA" },
      { role: "Autonomous Systems Engineer", salaryIndia: "₹12–30 LPA" },
    ],
  },
  {
    id: "btech_robotics",
    title: "B.Tech — Robotics and Mechatronics",
    discipline: "tech_engg",
    description: "Interdisciplinary — mechanical + electronics + AI. High demand in deeptech.",
    careers: [
      { role: "Robotics Engineer",         salaryIndia: "₹10–30 LPA" },
      { role: "Industrial Automation Lead", salaryIndia: "₹12–35 LPA" },
      { role: "Mechatronics R&D",          salaryIndia: "₹10–28 LPA" },
    ],
    weights: { drive: 0.2, structure: 0.2 },
  },
  {
    id: "barch",
    title: "Bachelor of Architecture (BArch)",
    discipline: "design_arch",
    description: "Five-year design + structural program. Combines creative and technical work.",
    careers: [
      { role: "Architect (Practice)",      salaryIndia: "₹6–25 LPA" },
      { role: "Urban / Interior Designer", salaryIndia: "₹6–20 LPA" },
      { role: "Design-tech entrepreneur",   salaryIndia: "Variable" },
    ],
    weights: { risk: 0.15, structure: 0.2 },
  },

  // ── BUSINESS (BBA) ───────────────────────────────────────────────────
  {
    id: "bba",
    title: "Bachelor of Business Administration (BBA Honours / with Research)",
    discipline: "business",
    description: "Generalist business degree. Sets up for consulting, IB, product, or founder track.",
    careers: [
      { role: "Management Consultant",   salaryIndia: "₹10–25 LPA (entry), ₹40+ LPA (senior)" },
      { role: "Investment Banking / IB",  salaryIndia: "₹12–40 LPA" },
      { role: "Product Manager (Tech)",   salaryIndia: "₹15–35 LPA" },
      { role: "Business / Data Analyst",  salaryIndia: "₹8–25 LPA" },
    ],
    weights: { social: 0.2, drive: 0.2, decision_style: 0.1 },
  },
  {
    id: "bba_decision_science",
    title: "BBA — Decision Science",
    discipline: "business",
    description: "Analytics-heavy BBA. Strong for data-driven consulting, product, ops.",
    careers: [
      { role: "Business / Decision Analyst", salaryIndia: "₹8–25 LPA" },
      { role: "Management Consultant",       salaryIndia: "₹12–25 LPA (entry)" },
      { role: "Product Manager",             salaryIndia: "₹15–35 LPA" },
    ],
    weights: { decision_style: 0.25, structure: 0.2 },
  },
  {
    id: "bba_fin_intl",
    title: "BBA — Finance and International Business",
    discipline: "business",
    description: "Finance + global trade focus. For students wanting cross-border careers.",
    careers: [
      { role: "Global Financial Analyst", salaryIndia: "₹10–30 LPA" },
      { role: "Investment Banker",        salaryIndia: "₹12–40 LPA" },
      { role: "Trade / Forex Specialist", salaryIndia: "₹8–25 LPA" },
    ],
    weights: { decision_style: 0.2, drive: 0.2 },
  },
  {
    id: "bba_strategy_analytics",
    title: "BBA — Strategy and Business Analytics",
    discipline: "business",
    description: "Strategy meets data. Bridge to consulting and corporate strategy roles.",
    careers: [
      { role: "Strategy Analyst",        salaryIndia: "₹8–30 LPA" },
      { role: "Management Consultant",   salaryIndia: "₹12–40 LPA" },
      { role: "Corporate Strategy Lead", salaryIndia: "₹15–40 LPA" },
    ],
    weights: { decision_style: 0.25, drive: 0.15 },
  },
  {
    id: "bba_fin_marketing",
    title: "BBA — Finance and Marketing Analytics",
    discipline: "business",
    description: "Twin specialisation — finance + analytics-led marketing.",
    careers: [
      { role: "Marketing Analyst",        salaryIndia: "₹7–20 LPA" },
      { role: "Brand Strategist",         salaryIndia: "₹8–25 LPA" },
      { role: "Financial Analyst",        salaryIndia: "₹8–25 LPA" },
    ],
  },
  {
    id: "bba_fintech",
    title: "BBA — FinTech",
    discipline: "business",
    description: "Finance + product + technology. Strong for the digital-payments / blockchain / DeFi era.",
    careers: [
      { role: "FinTech Product Manager",  salaryIndia: "₹10–35 LPA" },
      { role: "Blockchain Analyst",       salaryIndia: "₹12–40 LPA" },
      { role: "Payments Lead",             salaryIndia: "₹8–25 LPA" },
    ],
    weights: { drive: 0.2, decision_style: 0.15, risk: 0.15 },
  },
  {
    id: "bba_marketing_supply",
    title: "BBA — Marketing and Supply Chain Management",
    discipline: "business",
    description: "Marketing + operations. Suited to retail, e-commerce, and consumer brand roles.",
    careers: [
      { role: "Brand Manager",            salaryIndia: "₹8–30 LPA" },
      { role: "Supply Chain Manager",     salaryIndia: "₹10–35 LPA" },
      { role: "Operations Manager",       salaryIndia: "₹8–28 LPA" },
    ],
  },
  {
    id: "bba_branding_entrepreneurship",
    title: "BCom — Branding and Entrepreneurship",
    discipline: "business",
    description: "Commerce + brand + founder skills. Best for students who want to start ventures.",
    careers: [
      { role: "Brand Manager",         salaryIndia: "₹8–30 LPA" },
      { role: "Startup Founder",       salaryIndia: "Highly scalable" },
      { role: "Product / Growth Lead", salaryIndia: "₹10–35 LPA" },
    ],
    weights: { risk: 0.25, drive: 0.25 },
  },

  // ── COMMERCE (BCom) ──────────────────────────────────────────────────
  {
    id: "bcom",
    title: "Bachelor of Commerce (BCom Honours / with Research)",
    discipline: "commerce",
    description: "Generalist commerce. Strong for CA / CMA / CS prep and corporate finance careers.",
    careers: [
      { role: "Chartered Accountant",          salaryIndia: "₹8–30 LPA+" },
      { role: "Financial / Business Analyst",  salaryIndia: "₹6–18 LPA" },
      { role: "Tax Consultant",                salaryIndia: "₹6–20 LPA" },
    ],
    weights: { structure: 0.25, decision_style: 0.2 },
  },
  {
    id: "bcom_intl_acc_fin",
    title: "BCom — International Accountancy and Finance",
    discipline: "commerce",
    description: "Globally-oriented finance + accountancy. ACCA / CPA / CIMA mobility built in.",
    careers: [
      { role: "Chartered / CPA / ACCA",     salaryIndia: "₹8–25 LPA (India), ₹40–90 LPA global" },
      { role: "Investment Banking Analyst", salaryIndia: "₹12–40 LPA" },
      { role: "International Tax Consultant", salaryIndia: "₹10–40 LPA" },
    ],
    weights: { decision_style: 0.2, structure: 0.25 },
  },
  {
    id: "bcom_intl_business_acc",
    title: "BCom — International Business Accounting (CPA Australia)",
    discipline: "commerce",
    description: "Integrated CPA Australia program. Built for students aiming at global accounting careers.",
    careers: [
      { role: "Global Accountant (CPA)",   salaryIndia: "₹10–40 LPA" },
      { role: "Audit / Risk Manager",      salaryIndia: "₹10–30 LPA" },
      { role: "FP&A Specialist",            salaryIndia: "₹8–20 LPA" },
    ],
  },
  {
    id: "bcom_cima",
    title: "BCom — Global Management Accounting & Strategy (CIMA UK Integrated)",
    discipline: "commerce",
    description: "BCom + CIMA UK pathway. For students aiming at corporate finance, management accounting, and CFO tracks.",
    careers: [
      { role: "Management Accountant",   salaryIndia: "₹8–25 LPA (India), ₹40–80 LPA global" },
      { role: "Financial Controller",    salaryIndia: "₹12–30 LPA" },
      { role: "FP&A / CFO Track",         salaryIndia: "₹15–45 LPA" },
    ],
  },
  {
    id: "bcom_fin_accountancy",
    title: "BCom — Finance and Accountancy",
    discipline: "commerce",
    description: "Strong on classical finance + accounting. Best for CA / IB / corp finance careers.",
    careers: [
      { role: "Chartered Accountant",      salaryIndia: "₹8–25 LPA" },
      { role: "Investment Banking Analyst", salaryIndia: "₹12–30 LPA" },
      { role: "Internal Auditor",          salaryIndia: "₹8–25 LPA" },
    ],
  },
  {
    id: "bcom_accountancy_tax",
    title: "BCom — Accountancy and Taxation",
    discipline: "commerce",
    description: "Deep specialisation in tax. Aligned with CA route and Big-4 tax practice.",
    careers: [
      { role: "Tax Consultant / GST Specialist", salaryIndia: "₹6–20 LPA" },
      { role: "Internal Auditor",                salaryIndia: "₹8–25 LPA" },
      { role: "Forensic Accountant",             salaryIndia: "₹10–30 LPA" },
    ],
  },
  {
    id: "bcom_fin_investment",
    title: "BCom — Finance and Investment",
    discipline: "commerce",
    description: "Capital markets, equity research, portfolio management focus.",
    careers: [
      { role: "Equity Research Analyst",   salaryIndia: "₹8–25 LPA" },
      { role: "Portfolio Manager",         salaryIndia: "₹10–35 LPA" },
      { role: "Investment Banker",         salaryIndia: "₹15–50 LPA" },
    ],
    weights: { decision_style: 0.25, drive: 0.2 },
  },
  {
    id: "bcom_strategic_finance",
    title: "BCom — Strategic Finance",
    discipline: "commerce",
    description: "Long-horizon corporate finance — capital allocation, M&A, restructuring.",
    careers: [
      { role: "Strategic Finance Analyst", salaryIndia: "₹10–30 LPA" },
      { role: "Investment Banker",         salaryIndia: "₹15–40 LPA" },
      { role: "CFO Track",                  salaryIndia: "₹25–70 LPA+" },
    ],
  },
  {
    id: "bcom_applied_fin_analytics",
    title: "BCom — Applied Finance and Analytics",
    discipline: "commerce",
    description: "Modern BCom — finance + analytics. Bridges to FP&A and data-driven finance roles.",
    careers: [
      { role: "Financial Analyst (Analytics)", salaryIndia: "₹8–25 LPA" },
      { role: "FinTech Analyst",                salaryIndia: "₹10–35 LPA" },
      { role: "Risk Analyst",                   salaryIndia: "₹8–25 LPA" },
    ],
  },
  {
    id: "bcom_bfsi",
    title: "BCom — Banking, Financial Services and Insurance (Apprenticeship)",
    discipline: "commerce",
    description: "Apprenticeship-embedded — work + learn in BFSI from day one.",
    careers: [
      { role: "Banking Officer / Manager",    salaryIndia: "₹5–20 LPA" },
      { role: "Insurance Underwriter",        salaryIndia: "₹5–18 LPA" },
      { role: "Investment Advisor",           salaryIndia: "₹8–25 LPA" },
    ],
  },

  // ── SCIENCE (BSc) ────────────────────────────────────────────────────
  {
    id: "bsc_biotech_chemistry",
    title: "B.Sc — Biotechnology, Chemistry",
    discipline: "science",
    description: "Lab-heavy degree. Foundation for biotech R&D, pharma, and bioinformatics.",
    careers: [
      { role: "Research Scientist (Biotech / Pharma)", salaryIndia: "₹6–20 LPA" },
      { role: "Pharmaceutical Scientist / QC",         salaryIndia: "₹5–15 LPA" },
      { role: "Bioinformatics Analyst",                salaryIndia: "₹8–18 LPA" },
    ],
    weights: { structure: 0.2, decision_style: 0.15 },
  },
  {
    id: "bsc_biotech_botany",
    title: "B.Sc — Biotechnology, Botany",
    discipline: "science",
    description: "Plant biotech focus. Strong for agri-tech, sustainability, and crop science.",
    careers: [
      { role: "Plant Biotechnologist",       salaryIndia: "₹6–15 LPA" },
      { role: "Agricultural Scientist",      salaryIndia: "₹6–16 LPA" },
      { role: "Environmental Consultant",    salaryIndia: "₹6–15 LPA" },
    ],
  },
  {
    id: "bsc_biotech_zoology",
    title: "B.Sc — Biotechnology, Zoology",
    discipline: "science",
    description: "Animal biology + biotech. For conservation, veterinary, or wildlife careers.",
    careers: [
      { role: "Wildlife Biologist",  salaryIndia: "₹5–12 LPA" },
      { role: "Research Scientist",  salaryIndia: "₹6–18 LPA" },
      { role: "Clinical Research Associate", salaryIndia: "₹5–15 LPA" },
    ],
  },
  {
    id: "bsc_biotech_forensic",
    title: "B.Sc — Biotechnology, Forensic Science",
    discipline: "science",
    description: "DNA, toxicology, crime-lab work. For students drawn to forensic + investigative roles.",
    careers: [
      { role: "Forensic Scientist",        salaryIndia: "₹6–18 LPA" },
      { role: "DNA / Molecular Analyst",   salaryIndia: "₹7–22 LPA" },
      { role: "Toxicologist",              salaryIndia: "₹6–16 LPA" },
    ],
  },
  {
    id: "bsc_life_sciences",
    title: "B.Sc — Life Sciences (Honours / with Research)",
    discipline: "science",
    description: "Broad biology base. Sets up clinical research, biotech, or graduate science.",
    careers: [
      { role: "Research Scientist",       salaryIndia: "₹6–20 LPA" },
      { role: "Pharma Scientist / CRA",   salaryIndia: "₹5–15 LPA" },
      { role: "Bioinformatics Analyst",   salaryIndia: "₹7–18 LPA" },
    ],
  },
  {
    id: "bsc_chemistry_zoology",
    title: "B.Sc — Chemistry, Zoology",
    discipline: "science",
    description: "Twin science honours. Common bridge to MSc / pharma / wildlife.",
    careers: [
      { role: "Research Scientist",     salaryIndia: "₹6–18 LPA" },
      { role: "Pharma Chemist",         salaryIndia: "₹6–20 LPA" },
      { role: "Wildlife / Conservation", salaryIndia: "₹5–15 LPA" },
    ],
  },
  {
    id: "bsc_physics_math_astro",
    title: "B.Sc — Physics, Mathematics with Astrophysics minor",
    discipline: "science",
    description: "Theoretical / experimental physics with space focus. Best for graduate research and quant careers.",
    careers: [
      { role: "Astrophysicist / Space Scientist", salaryIndia: "₹10–35 LPA" },
      { role: "Quantitative Analyst (Finance)",   salaryIndia: "₹15–50 LPA+" },
      { role: "Research Scientist",                salaryIndia: "₹8–25 LPA" },
    ],
    weights: { decision_style: 0.3, structure: 0.25 },
  },
  {
    id: "bsc_actuarial",
    title: "B.Sc — Actuarial Science",
    discipline: "science",
    description: "Statistical risk modelling. High-paying niche for analytical, patient students.",
    careers: [
      { role: "Actuary (Qualified)",   salaryIndia: "₹25–60 LPA+" },
      { role: "Actuarial Analyst",     salaryIndia: "₹8–15 LPA" },
      { role: "Risk Manager",          salaryIndia: "₹8–25 LPA" },
    ],
    weights: { structure: 0.3, decision_style: 0.25 },
  },

  // ── ECONOMICS & QUANT ────────────────────────────────────────────────
  {
    id: "bsc_econ",
    title: "B.Sc — Economics (Honours / with Research)",
    discipline: "economics",
    description: "Quantitative economics + research. Strong for policy, finance, and graduate study.",
    careers: [
      { role: "Economist / Researcher",    salaryIndia: "₹8–25 LPA" },
      { role: "Management Consultant",     salaryIndia: "₹10–25 LPA" },
      { role: "Equity Research Analyst",   salaryIndia: "₹8–25 LPA" },
    ],
    weights: { decision_style: 0.25, structure: 0.2 },
  },
  {
    id: "bsc_econ_math_stats",
    title: "B.Sc — Economics, Mathematics, Statistics / Econometrics",
    discipline: "economics",
    description: "Triple-major focus. Top-tier prep for quant finance, ML, or PhD economics.",
    careers: [
      { role: "Quantitative Analyst",     salaryIndia: "₹20–60 LPA+" },
      { role: "Data Scientist",           salaryIndia: "₹12–40 LPA" },
      { role: "Economist (Top Firms)",    salaryIndia: "₹10–30 LPA" },
    ],
    weights: { decision_style: 0.3, structure: 0.25 },
  },
  {
    id: "ba_econ_polsci",
    title: "BA — Economics, Political Science",
    discipline: "economics",
    description: "Policy-leaning economics. Ideal for UPSC, think-tanks, public-sector consulting.",
    careers: [
      { role: "Policy Analyst",        salaryIndia: "₹6–20 LPA" },
      { role: "Civil Services (IAS/IFS)", salaryIndia: "₹10–18 LPA + perks" },
      { role: "Development Economist", salaryIndia: "₹10–30 LPA" },
    ],
  },
  {
    id: "ba_econ_socio",
    title: "BA — Economics, Sociology (with Political Science minor)",
    discipline: "economics",
    description: "Interdisciplinary social science. Builds toward policy, research, or civil services.",
    careers: [
      { role: "Public Policy Analyst",      salaryIndia: "₹6–20 LPA" },
      { role: "Sociologist / Researcher",   salaryIndia: "₹6–15 LPA" },
      { role: "Civil Services",             salaryIndia: "₹10–18 LPA + perks" },
    ],
  },

  // ── PSYCHOLOGY ───────────────────────────────────────────────────────
  {
    id: "bsc_psych",
    title: "B.Sc — Psychology (Honours / with Research)",
    discipline: "psychology",
    description: "Scientific psychology — research, clinical pathway, or industrial/org careers.",
    careers: [
      { role: "Clinical Psychologist",     salaryIndia: "₹6–20 LPA" },
      { role: "I-O Psychologist",          salaryIndia: "₹8–25 LPA" },
      { role: "Neuropsychologist",         salaryIndia: "₹7–22 LPA" },
    ],
    weights: { social: 0.2, decision_style: 0.15 },
  },
  {
    id: "bsc_clinical_psych",
    title: "B.Sc — Clinical Psychology (RCI-Recognised)",
    discipline: "psychology",
    description: "Direct pathway to clinical practice. RCI recognition required for licensure.",
    careers: [
      { role: "Clinical Psychologist",  salaryIndia: "₹6–20 LPA" },
      { role: "Therapist / Counsellor", salaryIndia: "₹5–15 LPA" },
      { role: "Rehabilitation Specialist", salaryIndia: "₹6–18 LPA" },
    ],
    weights: { social: 0.25 },
  },
  {
    id: "ba_psych_english",
    title: "BA — Psychology, English (Honours / with Research)",
    discipline: "psychology",
    description: "Psychology + literature. Suits counselling, content, communication-led careers.",
    careers: [
      { role: "Counsellor / Therapist",  salaryIndia: "₹5–15 LPA" },
      { role: "Content / Editorial Lead", salaryIndia: "₹5–15 LPA" },
      { role: "HR / Organisational Dev", salaryIndia: "₹7–20 LPA" },
    ],
  },
  {
    id: "ba_psych_econ",
    title: "BA — Psychology, Economics (Honours / with Research)",
    discipline: "psychology",
    description: "Behavioural-economics flavoured pathway. Strong for UX research, behavioural science roles.",
    careers: [
      { role: "Behavioural Researcher",  salaryIndia: "₹8–22 LPA" },
      { role: "UX Researcher",           salaryIndia: "₹8–25 LPA" },
      { role: "Marketing Analyst",       salaryIndia: "₹7–20 LPA" },
    ],
  },

  // ── HUMANITIES / LIBERAL ARTS ────────────────────────────────────────
  {
    id: "ba_liberal_arts",
    title: "BA — Liberal Arts (Honours / with Research)",
    discipline: "humanities",
    description: "Interdisciplinary humanities + social sciences. Broad, adaptable, suits multi-track students.",
    careers: [
      { role: "Policy Analyst",                   salaryIndia: "₹7–25 LPA" },
      { role: "Content Strategist / Editor",      salaryIndia: "₹5–18 LPA" },
      { role: "Consultant (Edu / Social Sector)", salaryIndia: "₹8–30 LPA" },
    ],
    weights: { risk: 0.1 },
  },
  {
    id: "ba_history_polsci",
    title: "BA — History, Political Science (with Economics minor)",
    discipline: "humanities",
    description: "Gold combo for UPSC / civil services. Also strong for policy, journalism, law.",
    careers: [
      { role: "Civil Services",                salaryIndia: "₹10–18 LPA + perks" },
      { role: "Political / Foreign Affairs Analyst", salaryIndia: "₹8–25 LPA" },
      { role: "Historian / Heritage Consultant", salaryIndia: "₹6–18 LPA" },
    ],
  },
  {
    id: "ba_polsci",
    title: "BA — Political Science (Honours / with Research)",
    discipline: "humanities",
    description: "For students drawn to politics, diplomacy, public affairs.",
    careers: [
      { role: "Civil Services (IAS/IPS/IFS)", salaryIndia: "₹10–30 LPA+" },
      { role: "Diplomat / Policy Advisor",     salaryIndia: "₹10–35 LPA" },
      { role: "Political Strategist",          salaryIndia: "₹8–30 LPA" },
    ],
  },
  {
    id: "ba_english_creative",
    title: "BA — English with Creative Writing (Honours / with Research)",
    discipline: "humanities",
    description: "Writing-craft + literature. For aspiring writers, editors, content leaders.",
    careers: [
      { role: "Writer / Editor",          salaryIndia: "₹5–18 LPA" },
      { role: "Content Strategist",       salaryIndia: "₹8–25 LPA" },
      { role: "UX Writer",                 salaryIndia: "₹10–35 LPA" },
    ],
    weights: { risk: 0.15 },
  },
  {
    id: "ba_english_digital_humanities",
    title: "BA — English with Digital Humanities",
    discipline: "humanities",
    description: "Literature + digital research methods. Modern pathway into UX, edtech, archive work.",
    careers: [
      { role: "UX Writer / Content Designer", salaryIndia: "₹7–20 LPA" },
      { role: "Digital Archivist / Librarian", salaryIndia: "₹5–15 LPA" },
      { role: "E-learning Content Developer",  salaryIndia: "₹6–18 LPA" },
    ],
  },
  {
    id: "ba_philosophy",
    title: "BA — Philosophy",
    discipline: "humanities",
    description: "Rigorous thinking, ethics, logic. Pathway to law, policy, academia, consulting.",
    careers: [
      { role: "Academic / Researcher",  salaryIndia: "₹5–15 LPA" },
      { role: "Legal Profession (post LLB)", salaryIndia: "₹8–30 LPA+" },
      { role: "Ethics / CSR Consultant", salaryIndia: "₹7–20 LPA" },
    ],
  },

  // ── MEDIA, COMMUNICATION & PERFORMING ARTS ──────────────────────────
  {
    id: "ba_comm_english",
    title: "BA — Communication and Media, English",
    discipline: "media",
    description: "Media + literature. Foundation for journalism, PR, content roles.",
    careers: [
      { role: "Journalist / Reporter",         salaryIndia: "₹5–20 LPA" },
      { role: "Corporate Communications",       salaryIndia: "₹10–30 LPA" },
      { role: "Content / Digital Strategist",   salaryIndia: "₹8–25 LPA" },
    ],
  },
  {
    id: "ba_comm_psych",
    title: "BA — Communication and Media, Psychology",
    discipline: "media",
    description: "Communication + psych. Strong for UX research, behavioural marketing, brand.",
    careers: [
      { role: "Media Psychologist",        salaryIndia: "₹8–25 LPA" },
      { role: "UX Researcher / Designer",  salaryIndia: "₹8–25 LPA" },
      { role: "Market Research Analyst",   salaryIndia: "₹7–20 LPA" },
    ],
  },
  {
    id: "ba_journalism_english",
    title: "BA — Journalism and Digital Media, English",
    discipline: "media",
    description: "Modern journalism — video, podcast, multimedia + classical reporting.",
    careers: [
      { role: "Digital Journalist",   salaryIndia: "₹6–18 LPA" },
      { role: "Editor / Content Lead", salaryIndia: "₹8–25 LPA" },
      { role: "Video / Podcast Producer", salaryIndia: "₹7–20 LPA" },
    ],
  },
  {
    id: "ba_media_with_cs",
    title: "B.Sc — Media with Computer Science",
    discipline: "media",
    description: "Media production + coding. For UX designers, multimedia engineers, game / interactive devs.",
    careers: [
      { role: "UX / UI Designer",       salaryIndia: "₹8–28 LPA" },
      { role: "Multimedia Programmer",  salaryIndia: "₹7–22 LPA" },
      { role: "Game Developer",          salaryIndia: "₹8–30 LPA" },
    ],
  },
  {
    id: "ba_performing_psych",
    title: "BA — Performing Arts, Psychology (Honours)",
    discipline: "media",
    description: "Stagecraft + psychology — emerging field of expressive arts therapy and performance coaching.",
    careers: [
      { role: "Performing Artist",       salaryIndia: "Variable, ₹5–20 LPA+" },
      { role: "Drama / Arts Therapist",  salaryIndia: "₹6–20 LPA" },
      { role: "Performance Coach",       salaryIndia: "₹10–30 LPA" },
    ],
    weights: { risk: 0.2 },
  },
  {
    id: "ba_performing_creative",
    title: "BA — Performing Arts, Creative Media (Honours)",
    discipline: "media",
    description: "Performing + production. Best for cross-disciplinary creative careers.",
    careers: [
      { role: "Actor / Performer",         salaryIndia: "Variable" },
      { role: "Film / Media Producer",     salaryIndia: "₹8–25 LPA" },
      { role: "Creative Director",         salaryIndia: "₹10–35 LPA" },
    ],
  },
  {
    id: "ba_theatre_creative",
    title: "BA — Theatre Studies, Creative Media (Honours)",
    discipline: "media",
    description: "Theatre as the core lens. For directors, writers, production careers.",
    careers: [
      { role: "Theatre / Stage Performer",  salaryIndia: "Variable" },
      { role: "Director / Producer",         salaryIndia: "₹8–30 LPA" },
      { role: "Scriptwriter / Playwright",   salaryIndia: "₹6–20 LPA" },
    ],
  },
  {
    id: "ba_music_classical",
    title: "BA — Music (Western Classical), Creative Media (Honours)",
    discipline: "media",
    description: "Western classical + production. For musicians, composers, sound producers.",
    careers: [
      { role: "Performer / Soloist",  salaryIndia: "Variable" },
      { role: "Music Producer",        salaryIndia: "₹7–25 LPA" },
      { role: "Composer / Film Scorer", salaryIndia: "₹8–30 LPA" },
    ],
  },

  // ── LAW ──────────────────────────────────────────────────────────────
  {
    id: "ba_llb",
    title: "BA LLB (Honours)",
    discipline: "law",
    description: "Five-year integrated law. Strong for constitutional, judicial, civil services tracks.",
    careers: [
      { role: "Corporate Lawyer",       salaryIndia: "₹12–20 LPA (entry), ₹30–80 LPA mid" },
      { role: "Judiciary / PCS-J",      salaryIndia: "₹10–18 LPA + perks" },
      { role: "Policy / Constitutional", salaryIndia: "₹8–25 LPA" },
    ],
    weights: { decision_style: 0.25, structure: 0.2 },
  },
  {
    id: "bba_llb",
    title: "BBA LLB (Honours)",
    discipline: "law",
    description: "Five-year business + law. Bridge into corporate law, M&A, IB-legal, IP.",
    careers: [
      { role: "Corporate / M&A Lawyer", salaryIndia: "₹12–20 LPA (entry), ₹30–80 LPA mid" },
      { role: "In-House Counsel (MNC)",  salaryIndia: "₹10–30 LPA, ₹50+ senior" },
      { role: "IP / IB-Legal",            salaryIndia: "₹15–40 LPA" },
    ],
    weights: { decision_style: 0.2, drive: 0.2 },
  },

  // ── EDUCATION ────────────────────────────────────────────────────────
  {
    id: "bed",
    title: "Bachelor of Education (BEd)",
    discipline: "education",
    description: "Teacher training. Government, international school, or edtech pathways.",
    careers: [
      { role: "Government Teacher (TGT/PGT)", salaryIndia: "₹5–18 LPA" },
      { role: "International School Teacher",  salaryIndia: "₹6–15 LPA (India), ₹25–60 LPA abroad" },
      { role: "EdTech Faculty / Online Educator", salaryIndia: "₹8–25 LPA" },
    ],
    weights: { social: 0.2 },
  },

  // ── HOSPITALITY ──────────────────────────────────────────────────────
  {
    id: "bhm",
    title: "Bachelor of Hotel Management (BHM)",
    discipline: "hospitality",
    description: "Four-year hospitality + operations. Pathway to GM, F&B, luxury brand, cruise, aviation.",
    careers: [
      { role: "Hotel General Manager",  salaryIndia: "₹12–30 LPA, ₹60–150K USD global" },
      { role: "Revenue / Yield Manager", salaryIndia: "₹8–20 LPA" },
      { role: "F&B Manager",             salaryIndia: "₹6–18 LPA" },
      { role: "Luxury Brand Manager",    salaryIndia: "₹7–18 LPA" },
    ],
    weights: { social: 0.2, energy: 0.15 },
  },

  // ── MASTERS DEGREES ──────────────────────────────────────────────────
  // Technology & Computer Science
  {
    id: "ms_cs",
    title: "MS in Computer Science",
    discipline: "tech_cs",
    level: "masters",
    description: "Advanced study of computer systems, networks, algorithms, and computational theory. Prepares for deep engineering and architectural roles.",
    careers: [
      { role: "Software Architect / Principal Engineer", salaryIndia: "₹18–45 LPA" },
      { role: "Research & Development Engineer",        salaryIndia: "₹15–38 LPA" },
      { role: "Systems Programmer",                    salaryIndia: "₹12–30 LPA" },
    ],
    weights: { decision_style: 0.25, structure: 0.2, drive: 0.1 },
  },
  {
    id: "ms_aiml",
    title: "MS in Artificial Intelligence / Machine Learning",
    discipline: "tech_cs",
    level: "masters",
    description: "Deep study of neural networks, reinforcement learning, statistical models, and modern AI architectures.",
    careers: [
      { role: "Machine Learning Engineer",    salaryIndia: "₹20–50 LPA" },
      { role: "AI Research Scientist",        salaryIndia: "₹22–55 LPA" },
      { role: "Computer Vision Specialist",    salaryIndia: "₹18–45 LPA" },
    ],
    weights: { drive: 0.3, decision_style: 0.25, risk: 0.15 },
  },
  {
    id: "ms_cyber",
    title: "MS in Cybersecurity",
    discipline: "tech_cs",
    level: "masters",
    description: "Advanced network defense, penetration testing, cryptography, incident response, and cybersecurity policy.",
    careers: [
      { role: "Security Architect",          salaryIndia: "₹15–38 LPA" },
      { role: "Principal Penetration Tester", salaryIndia: "₹14–35 LPA" },
      { role: "CISO / Director of Security",  salaryIndia: "₹25–65 LPA" },
    ],
    weights: { structure: 0.3, decision_style: 0.25, risk: 0.1 },
  },
  {
    id: "ms_software_engg",
    title: "MS in Software Engineering",
    discipline: "tech_cs",
    level: "masters",
    description: "Enterprise software design, design patterns, lifecycle management, cloud architectures, and agile engineering practices.",
    careers: [
      { role: "Lead Software Architect",   salaryIndia: "₹16–42 LPA" },
      { role: "Engineering Manager",        salaryIndia: "₹18–40 LPA" },
      { role: "DevOps Solutions Lead",      salaryIndia: "₹15–35 LPA" },
    ],
    weights: { structure: 0.25, decision_style: 0.2, drive: 0.15 },
  },

  // Engineering (non-CS)
  {
    id: "ms_mech",
    title: "MS in Mechanical Engineering",
    discipline: "tech_engg",
    level: "masters",
    description: "Advanced thermal systems, fluid dynamics, manufacturing design, automation, and computer-aided engineering.",
    careers: [
      { role: "R&D Mechanical Engineer",   salaryIndia: "₹10–25 LPA" },
      { role: "Materials / Structural Lead", salaryIndia: "₹8–22 LPA" },
      { role: "Aerodynamics Consultant",    salaryIndia: "₹12–28 LPA" },
    ],
    weights: { structure: 0.25, drive: 0.15 },
  },
  {
    id: "ms_eee",
    title: "MS in Electrical & Electronics Engineering",
    discipline: "tech_engg",
    level: "masters",
    description: "Advanced power systems, signal processing, control systems, power electronics, and semi-conductor engineering.",
    careers: [
      { role: "Semi-conductor Designer",    salaryIndia: "₹12–30 LPA" },
      { role: "Control Systems Architect",   salaryIndia: "₹10–25 LPA" },
      { role: "Power Grid Solutions Engineer", salaryIndia: "₹8–22 LPA" },
    ],
    weights: { structure: 0.25, decision_style: 0.2 },
  },
  {
    id: "ms_robotics",
    title: "MS in Robotics",
    discipline: "tech_engg",
    level: "masters",
    description: "Interdisciplinary robotics systems, kinematics, path planning, autonomous machinery, and robotic manipulation.",
    careers: [
      { role: "Robotics R&D Specialist",    salaryIndia: "₹14–35 LPA" },
      { role: "Autonomous Systems Lead",    salaryIndia: "₹15–40 LPA" },
      { role: "Automation Architect",       salaryIndia: "₹12–30 LPA" },
    ],
    weights: { drive: 0.25, structure: 0.2, risk: 0.15 },
  },

  // Business & Management
  {
    id: "mba",
    title: "MBA (General / Specializations)",
    discipline: "business",
    level: "masters",
    description: "Two-year flagship MBA. Core strategies, global finance, corporate leadership, and organization scaling.",
    careers: [
      { role: "Management Consultant",    salaryIndia: "₹15–35 LPA" },
      { role: "Investment Banking Associate", salaryIndia: "₹18–45 LPA" },
      { role: "Strategy Director",         salaryIndia: "₹20–50 LPA" },
    ],
    weights: { social: 0.25, drive: 0.25, decision_style: 0.15 },
  },
  {
    id: "ms_biz_analytics",
    title: "MS in Business Analytics",
    discipline: "business",
    level: "masters",
    description: "Advanced data sciences, forecasting models, predictive operations, and data-backed business optimization.",
    careers: [
      { role: "Business Analytics Lead",  salaryIndia: "₹12–30 LPA" },
      { role: "Product Manager (Data)",    salaryIndia: "₹15–35 LPA" },
      { role: "Operations Strategy Lead",  salaryIndia: "₹14–32 LPA" },
    ],
    weights: { decision_style: 0.25, structure: 0.2 },
  },
  {
    id: "ms_finance",
    title: "MS in Finance",
    discipline: "commerce",
    level: "masters",
    description: "Advanced corporate finance, asset pricing, quantitative options, risk management, and capital markets.",
    careers: [
      { role: "Investment Banker",       salaryIndia: "₹16–42 LPA" },
      { role: "Financial Risk Manager",   salaryIndia: "₹12–30 LPA" },
      { role: "Portfolio Manager",       salaryIndia: "₹15–40 LPA" },
    ],
    weights: { decision_style: 0.25, drive: 0.2 },
  },
  {
    id: "ms_fintech",
    title: "MS in FinTech",
    discipline: "commerce",
    level: "masters",
    description: "Algorithmic trading, block-chain protocols, digital banking platforms, and financial analytics software.",
    careers: [
      { role: "FinTech Product Manager",   salaryIndia: "₹15–38 LPA" },
      { role: "Quantitative Trader",       salaryIndia: "₹20–60 LPA" },
      { role: "Blockchain Solutions Lead",  salaryIndia: "₹16–40 LPA" },
    ],
    weights: { drive: 0.2, decision_style: 0.2, risk: 0.15 },
  },

  // Pure & Applied Sciences
  {
    id: "ms_biotech",
    title: "MS in Biotechnology",
    discipline: "science",
    level: "masters",
    description: "Advanced gene therapy, bioprocess kinetics, bioinformatics models, and molecular science R&D.",
    careers: [
      { role: "Bio-pharma Lead Scientist",  salaryIndia: "₹10–28 LPA" },
      { role: "Bioinformatics Architect",   salaryIndia: "₹12–32 LPA" },
      { role: "R&D Innovations Lead",       salaryIndia: "₹12–30 LPA" },
    ],
    weights: { structure: 0.25, decision_style: 0.2 },
  },
  {
    id: "ms_public_health",
    title: "MS in Public Health (MPH)",
    discipline: "science",
    level: "masters",
    description: "Epidemiological studies, public policy systems, disease prevention programs, and community health management.",
    careers: [
      { role: "Epidemiologist",             salaryIndia: "₹8–22 LPA" },
      { role: "Public Health Director",     salaryIndia: "₹10–25 LPA" },
      { role: "Healthcare Policy Consultant", salaryIndia: "₹9–24 LPA" },
    ],
    weights: { social: 0.25, structure: 0.2 },
  },

  // Economics
  {
    id: "ms_econ",
    title: "MS in Quantitative Economics",
    discipline: "economics",
    level: "masters",
    description: "Deeps mathematical modelling, economic forecasting, corporate financial theory, and econometrics.",
    careers: [
      { role: "Quantitative Economist", salaryIndia: "₹12–32 LPA" },
      { role: "Policy Advisor (Economic)", salaryIndia: "₹10–26 LPA" },
      { role: "Data Science Consultant",  salaryIndia: "₹12–30 LPA" },
    ],
    weights: { decision_style: 0.3, structure: 0.25 },
  },

  // Psychology
  {
    id: "ms_clinical_psych",
    title: "MS in Clinical Psychology",
    discipline: "psychology",
    level: "masters",
    description: "Advanced diagnostics, psychotherapies, clinical assessments, and patient consulting.",
    careers: [
      { role: "Clinical Psychologist",     salaryIndia: "₹8–24 LPA" },
      { role: "Therapy Practice Lead",     salaryIndia: "₹6–20 LPA" },
      { role: "Rehabilitation Consultant", salaryIndia: "₹7–22 LPA" },
    ],
    weights: { social: 0.25, decision_style: 0.15 },
  },

  // Humanities
  {
    id: "ms_public_policy",
    title: "MS in Public Policy",
    discipline: "humanities",
    level: "masters",
    description: "Geopolitical research, legislative analysis, civic management strategy, and policy testing models.",
    careers: [
      { role: "Public Policy Consultant", salaryIndia: "₹9–26 LPA" },
      { role: "Legislative Analyst",      salaryIndia: "₹8–22 LPA" },
      { role: "Non-Profit Executive",     salaryIndia: "₹7–20 LPA" },
    ],
    weights: { decision_style: 0.2, social: 0.15 },
  },

  // Media
  {
    id: "ms_journalism",
    title: "MS in Communications / Journalism",
    discipline: "media",
    level: "masters",
    description: "Digital storytelling, broadcast journalism models, public relations, and content scaling strategies.",
    careers: [
      { role: "Editorial Director",        salaryIndia: "₹10–28 LPA" },
      { role: "Communications Strategist", salaryIndia: "₹8–24 LPA" },
      { role: "Digital Media Producer",     salaryIndia: "₹7–22 LPA" },
    ],
    weights: { risk: 0.15, social: 0.1 },
  },

  // Law
  {
    id: "llm",
    title: "LL.M. (Master of Laws)",
    discipline: "law",
    level: "masters",
    description: "Advanced corporate compliance, intellectual property frameworks, international arbitration, and comparative law.",
    careers: [
      { role: "Corporate Legal Counsel", salaryIndia: "₹15–38 LPA" },
      { role: "Arbitration Specialist",   salaryIndia: "₹12–30 LPA" },
      { role: "Legal Consultant",         salaryIndia: "₹10–25 LPA" },
    ],
    weights: { decision_style: 0.25, structure: 0.2 },
  },

  // Design & Architecture
  {
    id: "ms_uiux",
    title: "MS in UX/UI Design",
    discipline: "design_arch",
    level: "masters",
    description: "User research, cognitive human-computer interaction, advanced wireframing, and design system engineering.",
    careers: [
      { role: "Principal Interaction Designer", salaryIndia: "₹18–42 LPA" },
      { role: "UX Design Architect",           salaryIndia: "₹14–35 LPA" },
      { role: "Digital Product Director",       salaryIndia: "₹22–50 LPA" },
    ],
    weights: { risk: 0.2, drive: 0.2 },
  },
  {
    id: "ms_architecture",
    title: "MS in Architecture",
    discipline: "design_arch",
    level: "masters",
    description: "Advanced spatial theory, computational design, green building metrics, and urban structural engineering.",
    careers: [
      { role: "Senior Design Architect",    salaryIndia: "₹12–30 LPA" },
      { role: "Urban Infrastructure Lead",  salaryIndia: "₹14–32 LPA" },
      { role: "Sustainability Architect",   salaryIndia: "₹10–25 LPA" },
    ],
    weights: { risk: 0.15, structure: 0.25 },
  },

  // Education
  {
    id: "ms_education",
    title: "MS in Education & Learning Design",
    discipline: "education",
    level: "masters",
    description: "Pedagogy analytics, digital curriculum building, learning management systems, and academic leadership.",
    careers: [
      { role: "Learning Experience Designer", salaryIndia: "₹8–22 LPA" },
      { role: "Curriculum Lead",              salaryIndia: "₹8–20 LPA" },
      { role: "EdTech Program Architect",     salaryIndia: "₹10–25 LPA" },
    ],
    weights: { social: 0.25 },
  },

  // Hospitality
  {
    id: "ms_hospitality",
    title: "MS in Hospitality & Tourism Management",
    discipline: "hospitality",
    level: "masters",
    description: "Global luxury brand strategies, complex hotel operations, financial yields, and tourism analytics.",
    careers: [
      { role: "General Manager (Operations)", salaryIndia: "₹15–35 LPA" },
      { role: "Hospitality Analytics Director", salaryIndia: "₹12–28 LPA" },
      { role: "Yield Management Lead",         salaryIndia: "₹10–25 LPA" },
    ],
    weights: { social: 0.25, energy: 0.15 },
  },
];

/** Group courses by discipline for the UI picker. */
export function coursesByDiscipline(discipline: Discipline): Course[] {
  return COURSES.filter((c) => c.discipline === discipline);
}

export function courseById(id: string | undefined): Course | undefined {
  if (!id) return undefined;
  return COURSES.find((c) => c.id === id);
}
