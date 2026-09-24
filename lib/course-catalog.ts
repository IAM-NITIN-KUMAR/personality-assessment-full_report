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
  /**
   * Listed in every stream's picker, not just `discipline`. For programmes any bachelor's can lead
   * to — the MBA takes graduates from every degree, so filing it under Business alone hid it from
   * the students most likely to be asking about it.
   */
  crossDiscipline?: boolean;
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
    title: "BBA — Branding and Entrepreneurship",
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
    crossDiscipline: true,
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
    description: "Deep mathematical modelling, economic forecasting, corporate financial theory, and econometrics.",
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

  // ── EXPANDED MASTERS SHELF (Indian qualification naming) ─────────────
  // Technology & Computer Science
  {
    id: "mca",
    title: "MCA — Master of Computer Applications",
    discipline: "tech_cs",
    level: "masters",
    description: "Two-year applied CS masters open to BCA and B.Sc graduates. The standard bridge into product engineering for students without a B.Tech.",
    careers: [
      { role: "Software Development Engineer",      salaryIndia: "₹8–24 LPA" },
      { role: "Full-stack / Mobile Engineer",       salaryIndia: "₹7–22 LPA" },
      { role: "Technical Consultant (IT Services)", salaryIndia: "₹9–26 LPA" },
    ],
    weights: { drive: 0.25, structure: 0.15, decision_style: 0.1 },
  },
  {
    id: "mtech_data_science",
    title: "M.Tech — Data Science and Big Data Analytics",
    discipline: "tech_cs",
    level: "masters",
    description: "Distributed data systems, statistical learning, and production analytics pipelines at scale. Heavier on engineering than a pure analytics masters.",
    careers: [
      { role: "Senior Data Scientist",   salaryIndia: "₹18–45 LPA" },
      { role: "Big Data Engineer",       salaryIndia: "₹14–35 LPA" },
      { role: "Analytics Platform Lead", salaryIndia: "₹16–38 LPA" },
    ],
    weights: { decision_style: 0.3, structure: 0.2, drive: 0.15 },
  },

  // Engineering (non-CS)
  {
    id: "mtech_vlsi",
    title: "M.Tech — VLSI Design and Embedded Systems",
    discipline: "tech_engg",
    level: "masters",
    description: "Chip design flows, RTL verification, embedded firmware, and low-power silicon. One of the fastest-growing deep-tech hiring pools in India.",
    careers: [
      { role: "VLSI Design Engineer",       salaryIndia: "₹12–32 LPA" },
      { role: "Verification Engineer",      salaryIndia: "₹11–28 LPA" },
      { role: "Embedded Systems Architect", salaryIndia: "₹14–34 LPA" },
    ],
    weights: { structure: 0.3, decision_style: 0.25 },
  },
  {
    id: "mtech_structural",
    title: "M.Tech — Structural Engineering",
    discipline: "tech_engg",
    level: "masters",
    description: "Advanced structural analysis, earthquake-resistant design, and large-span infrastructure. The standard PG route for civil graduates.",
    careers: [
      { role: "Structural Design Engineer",    salaryIndia: "₹8–22 LPA" },
      { role: "Infrastructure Project Lead",   salaryIndia: "₹10–26 LPA" },
      { role: "Seismic / Forensic Consultant", salaryIndia: "₹9–24 LPA" },
    ],
    weights: { structure: 0.3, decision_style: 0.2 },
  },
  {
    id: "mtech_aerospace",
    title: "M.Tech — Aerospace Engineering",
    discipline: "tech_engg",
    level: "masters",
    description: "Flight mechanics, propulsion, computational aerodynamics, and spacecraft systems. Feeds ISRO, DRDO, and the private launch sector.",
    careers: [
      { role: "Aerospace Design Engineer",     salaryIndia: "₹10–28 LPA" },
      { role: "Propulsion / Systems Engineer", salaryIndia: "₹12–30 LPA" },
      { role: "Flight Test Engineer",          salaryIndia: "₹10–26 LPA" },
    ],
    weights: { structure: 0.25, drive: 0.2, decision_style: 0.15 },
  },

  // Business & Management
  {
    id: "mba_hr",
    title: "MBA — Human Resource Management",
    discipline: "business",
    level: "masters",
    description: "Talent strategy, organisational behaviour, compensation design, and industrial relations for people-led leadership tracks.",
    careers: [
      { role: "HR Business Partner",      salaryIndia: "₹9–24 LPA" },
      { role: "Talent Acquisition Lead",  salaryIndia: "₹8–22 LPA" },
      { role: "Head of People & Culture", salaryIndia: "₹18–40 LPA" },
    ],
    weights: { social: 0.35, structure: 0.15 },
  },
  {
    id: "mba_marketing",
    title: "MBA — Marketing and Brand Management",
    discipline: "business",
    level: "masters",
    description: "Consumer insight, brand architecture, go-to-market planning, and the economics of performance marketing.",
    careers: [
      { role: "Brand Manager",             salaryIndia: "₹12–28 LPA" },
      { role: "Growth / Performance Lead", salaryIndia: "₹12–32 LPA" },
      { role: "Chief Marketing Officer",   salaryIndia: "₹25–60 LPA" },
    ],
    weights: { social: 0.3, risk: 0.2, drive: 0.15 },
  },
  {
    id: "mba_operations",
    title: "MBA — Operations and Supply Chain Management",
    discipline: "business",
    level: "masters",
    description: "Process design, logistics networks, procurement strategy, and lean manufacturing systems.",
    careers: [
      { role: "Supply Chain Manager",       salaryIndia: "₹10–26 LPA" },
      { role: "Operations Excellence Lead", salaryIndia: "₹12–30 LPA" },
      { role: "Plant / Category Head",      salaryIndia: "₹18–42 LPA" },
    ],
    weights: { structure: 0.35, drive: 0.15 },
  },
  {
    id: "mba_entrepreneurship",
    title: "MBA — Entrepreneurship and Family Business",
    discipline: "business",
    level: "masters",
    description: "Venture building, fundraising, succession planning, and scaling an existing family enterprise into a professional organisation.",
    careers: [
      { role: "Founder / Co-founder",              salaryIndia: "Highly scalable" },
      { role: "Business Head (Family Enterprise)", salaryIndia: "₹12–35 LPA" },
      { role: "Venture Capital Associate",         salaryIndia: "₹15–40 LPA" },
    ],
    weights: { risk: 0.35, drive: 0.3, social: 0.15 },
  },

  // Commerce & Finance
  {
    id: "mcom_accountancy_tax",
    title: "M.Com — Accountancy and Taxation",
    discipline: "commerce",
    level: "masters",
    description: "Advanced financial reporting, direct and indirect tax law, audit standards, and corporate compliance. Pairs naturally with CA or CS.",
    careers: [
      { role: "Tax Manager",          salaryIndia: "₹8–22 LPA" },
      { role: "Statutory Audit Lead", salaryIndia: "₹8–20 LPA" },
      { role: "Financial Controller", salaryIndia: "₹14–32 LPA" },
    ],
    weights: { structure: 0.35, decision_style: 0.15 },
  },
  {
    id: "mcom_financial_management",
    title: "M.Com — Financial Management",
    discipline: "commerce",
    level: "masters",
    description: "Corporate treasury, working-capital strategy, valuation, and financial planning for mid-to-large enterprises.",
    careers: [
      { role: "Finance Manager",  salaryIndia: "₹9–24 LPA" },
      { role: "Treasury Analyst", salaryIndia: "₹8–20 LPA" },
      { role: "FP&A Lead",        salaryIndia: "₹12–30 LPA" },
    ],
    weights: { structure: 0.3, decision_style: 0.2 },
  },
  {
    id: "msc_quant_finance",
    title: "M.Sc — Quantitative Finance and Risk Management",
    discipline: "commerce",
    level: "masters",
    description: "Stochastic modelling, derivatives pricing, credit and market risk, and the mathematics behind institutional trading desks.",
    careers: [
      { role: "Quantitative Analyst",   salaryIndia: "₹18–50 LPA" },
      { role: "Market Risk Manager",    salaryIndia: "₹14–32 LPA" },
      { role: "Derivatives Structurer", salaryIndia: "₹16–40 LPA" },
    ],
    weights: { decision_style: 0.35, structure: 0.25, risk: 0.1 },
  },

  // Pure & Applied Sciences
  {
    id: "msc_chemistry",
    title: "M.Sc — Chemistry",
    discipline: "science",
    level: "masters",
    description: "Organic, inorganic, and physical chemistry at research depth, with heavy instrumentation and synthesis lab work.",
    careers: [
      { role: "Research Chemist (Pharma)", salaryIndia: "₹6–18 LPA" },
      { role: "Quality / Analytical Lead", salaryIndia: "₹6–16 LPA" },
      { role: "Process Chemist",           salaryIndia: "₹7–20 LPA" },
    ],
    weights: { structure: 0.3, decision_style: 0.2 },
  },
  {
    id: "msc_physics_astro",
    title: "M.Sc — Physics with Astrophysics",
    discipline: "science",
    level: "masters",
    description: "Quantum mechanics, condensed matter, and observational astrophysics. The standard on-ramp to a PhD or a national research lab.",
    careers: [
      { role: "Research Associate (Physics)",    salaryIndia: "₹6–16 LPA" },
      { role: "Scientific Computing Specialist", salaryIndia: "₹10–26 LPA" },
      { role: "Data Scientist (Science Track)",  salaryIndia: "₹12–30 LPA" },
    ],
    weights: { decision_style: 0.35, structure: 0.2 },
  },
  {
    id: "msc_forensic_science",
    title: "M.Sc — Forensic Science",
    discipline: "science",
    level: "masters",
    description: "Crime-scene analysis, DNA profiling, toxicology, questioned documents, and courtroom expert testimony.",
    careers: [
      { role: "Forensic Analyst (State Lab)", salaryIndia: "₹5–14 LPA" },
      { role: "Digital Forensics Examiner",   salaryIndia: "₹8–22 LPA" },
      { role: "Forensic Consultant",          salaryIndia: "₹7–18 LPA" },
    ],
    weights: { structure: 0.3, decision_style: 0.25 },
  },
  {
    id: "msc_actuarial",
    title: "M.Sc — Actuarial Science",
    discipline: "science",
    level: "masters",
    description: "Survival models, insurance mathematics, pension valuation, and the exam pathway toward IAI or IFoA fellowship.",
    careers: [
      { role: "Actuarial Analyst",  salaryIndia: "₹8–22 LPA" },
      { role: "Pricing Actuary",    salaryIndia: "₹14–35 LPA" },
      { role: "Consulting Actuary", salaryIndia: "₹20–50 LPA" },
    ],
    weights: { decision_style: 0.35, structure: 0.3 },
  },

  // Economics
  {
    id: "ma_economics",
    title: "MA — Economics",
    discipline: "economics",
    level: "masters",
    description: "Microeconomic theory, macro policy, and applied econometrics. The classic route to research, civil services, and policy institutions.",
    careers: [
      { role: "Economist (Institution / Bank)",  salaryIndia: "₹8–24 LPA" },
      { role: "Research Associate (Think Tank)", salaryIndia: "₹6–18 LPA" },
      { role: "Business Economist",              salaryIndia: "₹10–26 LPA" },
    ],
    weights: { decision_style: 0.3, structure: 0.2 },
  },
  {
    id: "msc_econometrics",
    title: "M.Sc — Econometrics and Data Analytics",
    discipline: "economics",
    level: "masters",
    description: "Causal inference, time-series forecasting, and statistical programming applied to markets and public policy.",
    careers: [
      { role: "Econometrician",                salaryIndia: "₹12–30 LPA" },
      { role: "Data Scientist (Economics)",    salaryIndia: "₹14–35 LPA" },
      { role: "Pricing & Forecasting Analyst", salaryIndia: "₹10–26 LPA" },
    ],
    weights: { decision_style: 0.35, structure: 0.25 },
  },
  {
    id: "ma_development_studies",
    title: "MA — Development Studies and Public Economics",
    discipline: "economics",
    level: "masters",
    description: "Poverty and inequality measurement, impact evaluation, and the economics of health, education, and welfare programmes.",
    careers: [
      { role: "Development Sector Analyst",             salaryIndia: "₹6–18 LPA" },
      { role: "Impact Evaluation Lead",                 salaryIndia: "₹8–22 LPA" },
      { role: "Programme Manager (NGO / Multilateral)", salaryIndia: "₹9–26 LPA" },
    ],
    weights: { social: 0.3, decision_style: 0.2 },
  },

  // Psychology
  {
    id: "ma_counselling_psych",
    title: "MA — Counselling Psychology",
    discipline: "psychology",
    level: "masters",
    description: "Therapeutic frameworks, supervised counselling practice, and case formulation for school, workplace, and private settings.",
    careers: [
      { role: "Counselling Psychologist",   salaryIndia: "₹6–18 LPA" },
      { role: "School / Campus Counsellor", salaryIndia: "₹5–14 LPA" },
      { role: "Wellbeing Programme Lead",   salaryIndia: "₹8–22 LPA" },
    ],
    weights: { social: 0.35, energy: 0.1 },
  },
  {
    id: "msc_org_psych",
    title: "M.Sc — Organisational Psychology and HR",
    discipline: "psychology",
    level: "masters",
    description: "Psychometrics, selection science, team dynamics, and behavioural design applied inside organisations.",
    careers: [
      { role: "Organisational Psychologist",  salaryIndia: "₹9–24 LPA" },
      { role: "Talent Assessment Consultant", salaryIndia: "₹10–26 LPA" },
      { role: "People Analytics Lead",        salaryIndia: "₹12–30 LPA" },
    ],
    weights: { social: 0.3, decision_style: 0.2, structure: 0.15 },
  },
  {
    id: "msc_cognitive_neuro",
    title: "M.Sc — Cognitive Science and Neuropsychology",
    discipline: "psychology",
    level: "masters",
    description: "Brain-behaviour relationships, cognitive testing, neuroimaging methods, and computational models of the mind.",
    careers: [
      { role: "Neuropsychology Researcher",  salaryIndia: "₹7–20 LPA" },
      { role: "UX Researcher (Cognitive)",   salaryIndia: "₹12–30 LPA" },
      { role: "Clinical Research Associate", salaryIndia: "₹8–22 LPA" },
    ],
    weights: { decision_style: 0.3, structure: 0.2 },
  },

  // Humanities
  {
    id: "ma_english_lit",
    title: "MA — English Literature",
    discipline: "humanities",
    level: "masters",
    description: "Literary theory, postcolonial and comparative literature, and advanced critical writing with a research dissertation.",
    careers: [
      { role: "Academic / Lecturer (post-NET)",   salaryIndia: "₹6–18 LPA" },
      { role: "Editor / Publishing Professional", salaryIndia: "₹6–16 LPA" },
      { role: "Content Strategy Lead",            salaryIndia: "₹8–22 LPA" },
    ],
    weights: { decision_style: 0.2, social: 0.1 },
  },
  {
    id: "ma_history",
    title: "MA — History",
    discipline: "humanities",
    level: "masters",
    description: "Historiography, archival research methods, and regional or global history specialisations.",
    careers: [
      { role: "Historian / Academic",        salaryIndia: "₹6–16 LPA" },
      { role: "Archivist / Museum Curator",  salaryIndia: "₹5–14 LPA" },
      { role: "Civil Services (UPSC track)", salaryIndia: "₹9–22 LPA" },
    ],
    weights: { structure: 0.2, decision_style: 0.15 },
  },
  {
    id: "ma_polsci_ir",
    title: "MA — Political Science and International Relations",
    discipline: "humanities",
    level: "masters",
    description: "Comparative politics, diplomacy, security studies, and the institutions of global governance.",
    careers: [
      { role: "Policy Researcher",           salaryIndia: "₹7–20 LPA" },
      { role: "Foreign Service (IFS track)", salaryIndia: "₹10–24 LPA" },
      { role: "Geopolitical Risk Analyst",   salaryIndia: "₹10–26 LPA" },
    ],
    weights: { decision_style: 0.25, social: 0.15 },
  },
  {
    id: "ma_sociology",
    title: "MA — Sociology",
    discipline: "humanities",
    level: "masters",
    description: "Social theory, qualitative and quantitative field methods, and the study of institutions, gender, caste, and urban life.",
    careers: [
      { role: "Social Researcher",         salaryIndia: "₹6–16 LPA" },
      { role: "CSR / ESG Specialist",      salaryIndia: "₹8–22 LPA" },
      { role: "Qualitative Insights Lead", salaryIndia: "₹9–24 LPA" },
    ],
    weights: { social: 0.3, decision_style: 0.15 },
  },
  {
    id: "msw",
    title: "MSW — Master of Social Work",
    discipline: "humanities",
    level: "masters",
    description: "Field-based professional training in community organisation, medical and psychiatric social work, and welfare administration.",
    careers: [
      { role: "Medical / Psychiatric Social Worker", salaryIndia: "₹5–14 LPA" },
      { role: "CSR Programme Manager",               salaryIndia: "₹8–22 LPA" },
      { role: "Development Sector Lead",             salaryIndia: "₹9–24 LPA" },
    ],
    weights: { social: 0.4, energy: 0.1 },
  },

  // Media & Communication
  {
    id: "ma_mass_comm",
    title: "MA — Mass Communication",
    discipline: "media",
    level: "masters",
    description: "Media theory, multi-platform reporting, communication research, and newsroom-grade production practice.",
    careers: [
      { role: "News / Features Editor",        salaryIndia: "₹7–20 LPA" },
      { role: "Corporate Communications Lead", salaryIndia: "₹9–24 LPA" },
      { role: "Media Researcher",              salaryIndia: "₹6–16 LPA" },
    ],
    weights: { social: 0.25, risk: 0.15 },
  },
  {
    id: "ma_film_tv",
    title: "MA — Film and Television Production",
    discipline: "media",
    level: "masters",
    description: "Direction, cinematography, editing, and production management across film, streaming, and long-form television.",
    careers: [
      { role: "Director / Assistant Director", salaryIndia: "₹6–25 LPA" },
      { role: "Editor / Post-production Lead", salaryIndia: "₹7–20 LPA" },
      { role: "Showrunner / Producer",         salaryIndia: "₹12–40 LPA" },
    ],
    weights: { risk: 0.3, drive: 0.2, energy: 0.1 },
  },
  {
    id: "ma_advertising_pr",
    title: "MA — Advertising and Public Relations",
    discipline: "media",
    level: "masters",
    description: "Campaign strategy, reputation management, media planning, and crisis communication.",
    careers: [
      { role: "Account Planner (Agency)",   salaryIndia: "₹7–20 LPA" },
      { role: "PR / Reputation Manager",    salaryIndia: "₹8–22 LPA" },
      { role: "Creative Strategy Director", salaryIndia: "₹14–35 LPA" },
    ],
    weights: { social: 0.3, risk: 0.2 },
  },
  {
    id: "ma_performing_arts",
    title: "MA — Performing Arts (Theatre and Music)",
    discipline: "media",
    level: "masters",
    description: "Advanced performance practice, dramaturgy, composition, and arts pedagogy, built around a production thesis.",
    careers: [
      { role: "Performer / Practitioner",     salaryIndia: "₹4–18 LPA" },
      { role: "Arts Educator",                salaryIndia: "₹5–14 LPA" },
      { role: "Creative / Festival Director", salaryIndia: "₹8–22 LPA" },
    ],
    weights: { risk: 0.3, energy: 0.2, social: 0.15 },
  },

  // Law
  {
    id: "llm_corporate",
    title: "LL.M. — Corporate and Commercial Law",
    discipline: "law",
    level: "masters",
    description: "Company law, mergers and acquisitions, securities regulation, and cross-border commercial contracting.",
    careers: [
      { role: "M&A Associate (Law Firm)",   salaryIndia: "₹14–40 LPA" },
      { role: "In-house Corporate Counsel", salaryIndia: "₹14–35 LPA" },
      { role: "Compliance Head",            salaryIndia: "₹18–42 LPA" },
    ],
    weights: { structure: 0.3, decision_style: 0.25 },
  },
  {
    id: "llm_ip_tech",
    title: "LL.M. — Intellectual Property and Technology Law",
    discipline: "law",
    level: "masters",
    description: "Patents, trademarks, data protection, platform regulation, and the law of emerging technologies.",
    careers: [
      { role: "IP Attorney",                       salaryIndia: "₹12–32 LPA" },
      { role: "Technology Policy Counsel",         salaryIndia: "₹12–30 LPA" },
      { role: "Privacy / Data Protection Officer", salaryIndia: "₹15–38 LPA" },
    ],
    weights: { decision_style: 0.3, structure: 0.25 },
  },
  {
    id: "llm_constitutional",
    title: "LL.M. — Constitutional and Human Rights Law",
    discipline: "law",
    level: "masters",
    description: "Constitutional interpretation, civil liberties, public interest litigation, and international human rights instruments.",
    careers: [
      { role: "Litigation Counsel",                 salaryIndia: "₹8–28 LPA" },
      { role: "Judicial Services (aspirant track)", salaryIndia: "₹10–24 LPA" },
      { role: "Human Rights Advocate / Researcher", salaryIndia: "₹7–20 LPA" },
    ],
    weights: { social: 0.25, decision_style: 0.25 },
  },

  // Design & Architecture
  {
    id: "mdes_product",
    title: "M.Des — Product and Industrial Design",
    discipline: "design_arch",
    level: "masters",
    description: "Form-giving, materials and manufacturing, ergonomics, and design research for physical products.",
    careers: [
      { role: "Product / Industrial Designer", salaryIndia: "₹8–24 LPA" },
      { role: "Design Researcher",             salaryIndia: "₹10–26 LPA" },
      { role: "Design Studio Lead",            salaryIndia: "₹15–36 LPA" },
    ],
    weights: { risk: 0.25, drive: 0.2, structure: 0.15 },
  },
  {
    id: "mdes_communication",
    title: "M.Des — Communication Design",
    discipline: "design_arch",
    level: "masters",
    description: "Visual systems, typography, motion, and narrative design across print, screen, and environment.",
    careers: [
      { role: "Brand / Visual Designer", salaryIndia: "₹7–22 LPA" },
      { role: "Motion & Graphics Lead",  salaryIndia: "₹9–24 LPA" },
      { role: "Design Director",         salaryIndia: "₹18–40 LPA" },
    ],
    weights: { risk: 0.3, energy: 0.1 },
  },
  {
    id: "mplan_urban",
    title: "M.Plan — Urban and Regional Planning",
    discipline: "design_arch",
    level: "masters",
    description: "Land-use planning, transport networks, housing policy, and GIS-driven regional development.",
    careers: [
      { role: "Urban Planner",                 salaryIndia: "₹8–22 LPA" },
      { role: "Transport Planning Consultant", salaryIndia: "₹10–26 LPA" },
      { role: "Smart City Programme Lead",     salaryIndia: "₹12–30 LPA" },
    ],
    weights: { structure: 0.3, social: 0.15 },
  },

  // Education
  {
    id: "med",
    title: "M.Ed — Master of Education",
    discipline: "education",
    level: "masters",
    description: "Educational psychology, curriculum theory, assessment design, and school leadership. The route to senior academic roles and NET eligibility.",
    careers: [
      { role: "Academic Coordinator",    salaryIndia: "₹6–16 LPA" },
      { role: "School Principal / Head", salaryIndia: "₹10–28 LPA" },
      { role: "Teacher Educator",        salaryIndia: "₹7–18 LPA" },
    ],
    weights: { social: 0.3, structure: 0.2 },
  },
  {
    id: "ma_special_education",
    title: "MA — Special Education and Inclusive Practice",
    discipline: "education",
    level: "masters",
    description: "Learning-disability assessment, individualised education plans, assistive technology, and inclusive classroom design.",
    careers: [
      { role: "Special Educator",             salaryIndia: "₹5–14 LPA" },
      { role: "Learning Support Coordinator", salaryIndia: "₹6–16 LPA" },
      { role: "Inclusion Consultant",         salaryIndia: "₹8–20 LPA" },
    ],
    weights: { social: 0.35, structure: 0.15 },
  },

  // Hospitality
  {
    id: "mhm",
    title: "MHM — Master of Hotel Management",
    discipline: "hospitality",
    level: "masters",
    description: "Advanced rooms-division and F&B operations, revenue management, and multi-property leadership.",
    careers: [
      { role: "Hotel Operations Manager",   salaryIndia: "₹8–22 LPA" },
      { role: "Revenue Manager",            salaryIndia: "₹9–24 LPA" },
      { role: "General Manager (Property)", salaryIndia: "₹15–35 LPA" },
    ],
    weights: { social: 0.3, energy: 0.2, structure: 0.15 },
  },
  {
    id: "msc_culinary_business",
    title: "M.Sc — Culinary Arts and Food Business Management",
    discipline: "hospitality",
    level: "masters",
    description: "Advanced culinary technique paired with food-cost engineering, menu strategy, and restaurant entrepreneurship.",
    careers: [
      { role: "Executive Chef",                  salaryIndia: "₹8–24 LPA" },
      { role: "Food & Beverage Director",        salaryIndia: "₹12–28 LPA" },
      { role: "Restaurant Founder / Consultant", salaryIndia: "Highly scalable" },
    ],
    weights: { energy: 0.25, risk: 0.2, drive: 0.2 },
  },
];

/**
 * Group courses by discipline for the UI picker. Cross-disciplinary programmes are listed in every
 * stream; a single pass keeps them from appearing twice in their own.
 */
export function coursesByDiscipline(discipline: Discipline): Course[] {
  return COURSES.filter((c) => c.discipline === discipline || c.crossDiscipline);
}

export function courseById(id: string | undefined): Course | undefined {
  if (!id) return undefined;
  return COURSES.find((c) => c.id === id);
}
