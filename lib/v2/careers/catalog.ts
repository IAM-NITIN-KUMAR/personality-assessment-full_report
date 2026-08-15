import type { Degree, DomainId, RadarDim, RoleId } from "../types";

export interface CareerEntry {
  name: string;
  whatLine: string;            // DRAFT COPY — review with Nitin before launch
  nextStep: string;
  nextStepNonNative?: string;  // shown when the student's degree is not native to this domain
}

export const NATIVE_DEGREES: Record<DomainId, Degree[]> = {
  finance: ["engineering", "commerce", "science", "arts", "other"],
  business: ["engineering", "commerce", "science", "arts", "other"],
  entrepreneurship: ["engineering", "commerce", "science", "arts", "other"],
  technology: ["engineering"],
  people_society: ["engineering", "commerce", "science", "arts", "other"],
};

export const CATALOG: Record<RoleId, { domain: DomainId; dims: [RadarDim, RadarDim]; careers: [CareerEntry, CareerEntry, CareerEntry] }> = {
  markets: {
    domain: "finance", dims: ["analytical", "entrepreneurial"],
    careers: [
      { name: "Equity Research Analyst", whatLine: "Reads companies and calls where the price goes, in writing.", nextStep: "MSc Finance (UK/Ireland) or CFA Level 1" },
      { name: "Trader", whatLine: "Takes positions with a number attached and lives with the result.", nextStep: "Prop desk entry + NISM certs" },
      { name: "Quant Analyst", whatLine: "Turns market behaviour into models that trade or price risk.", nextStep: "MSc Quantitative Finance (strong maths)" },
    ],
  },
  deals: {
    domain: "finance", dims: ["analytical", "leadership"],
    careers: [
      { name: "Investment Banking Analyst", whatLine: "Builds the models and materials that get deals done.", nextStep: "MSc Finance or CA/CFA" },
      { name: "M&A Associate", whatLine: "Runs the process when one company buys another.", nextStep: "MSc Corporate Finance, MBA later" },
      { name: "Corporate Development", whatLine: "Finds and evaluates what a company should buy or build next.", nextStep: "MSc Strategy/Finance" },
    ],
  },
  risk: {
    domain: "finance", dims: ["analytical", "practical"],
    careers: [
      { name: "Risk Analyst", whatLine: "The person who catches the miss before it costs money.", nextStep: "MSc Risk Management (UK/Ireland) or FRM alongside work in India" },
      { name: "Internal Auditor", whatLine: "Same muscle, more structure: checks that controls actually hold.", nextStep: "CA/CIA route or MSc Accounting" },
      { name: "Compliance Officer", whatLine: "Keeps the firm inside rules that change every year.", nextStep: "ICA certs or MSc Regulation" },
    ],
  },
  advisory: {
    domain: "finance", dims: ["analytical", "people"],
    careers: [
      { name: "Wealth Manager", whatLine: "Manages a person's money with their fear in the room.", nextStep: "MSc Wealth Management + CFP" },
      { name: "Financial Planner", whatLine: "Builds the plan a family actually follows.", nextStep: "CFP India route" },
      { name: "Private Client Advisor", whatLine: "Long-trust advice for people with complicated money.", nextStep: "MSc Banking" },
    ],
  },
  operations: {
    domain: "business", dims: ["practical", "leadership"],
    careers: [
      { name: "Operations Manager", whatLine: "Makes the same work happen faster, cheaper, without drama.", nextStep: "MSc Operations/SCM" },
      { name: "Supply Chain Analyst", whatLine: "Finds where things and money get stuck between A and B.", nextStep: "MSc SCM + Six Sigma" },
      { name: "Project Coordinator", whatLine: "Keeps ten moving pieces landing in the right order.", nextStep: "PMP later or MSc Project Management" },
    ],
  },
  strategy: {
    domain: "business", dims: ["analytical", "leadership"],
    careers: [
      { name: "Strategy Analyst", whatLine: "Works out which bet the business should make next.", nextStep: "MSc Management/Strategy" },
      { name: "Consulting Business Analyst", whatLine: "Solves a different company's hardest problem every quarter.", nextStep: "Case prep now, MBA later" },
      { name: "Market Intelligence Analyst", whatLine: "Reads the market so the business isn't surprised by it.", nextStep: "MSc Business Analytics" },
    ],
  },
  growth: {
    domain: "business", dims: ["creative", "entrepreneurial"],
    careers: [
      { name: "Digital Marketing Manager", whatLine: "Runs the experiments that turn attention into customers.", nextStep: "MSc Digital Marketing" },
      { name: "Growth Analyst", whatLine: "Finds the number that moves all the other numbers.", nextStep: "MSc Marketing Analytics" },
      { name: "Brand Manager", whatLine: "Owns what a product means in people's heads.", nextStep: "MBA Marketing or MSc Brand Management" },
    ],
  },
  people_hr: {
    domain: "business", dims: ["people", "leadership"],
    careers: [
      { name: "HR Business Partner", whatLine: "The person managers call before the people problem explodes.", nextStep: "MSc HRM or IO Psychology" },
      { name: "Talent Acquisition", whatLine: "Finds and lands the people the plan depends on.", nextStep: "MSc HRM" },
      { name: "L&D Associate", whatLine: "Builds the training that changes how people actually work.", nextStep: "MSc Org Psychology or Education" },
    ],
  },
  founder: {
    domain: "entrepreneurship", dims: ["entrepreneurial", "leadership"],
    careers: [
      { name: "Startup Founder", whatLine: "Starts the thing, owns every problem nobody else takes.", nextStep: "Build now; MSc Entrepreneurship optional" },
      { name: "Early-stage Operator", whatLine: "Employee #3: does whatever the company needs this month.", nextStep: "Join a seed-stage startup" },
      { name: "Venture Analyst", whatLine: "Decides which founders get the money.", nextStep: "VC internships + MSc Finance" },
    ],
  },
  product: {
    domain: "entrepreneurship", dims: ["creative", "analytical"],
    careers: [
      { name: "Associate Product Manager", whatLine: "Decides what gets built next and why.", nextStep: "APM programmes or MSc Product/HCI" },
      { name: "Product Analyst", whatLine: "Turns usage data into the next product decision.", nextStep: "MSc Business Analytics" },
      { name: "UX-side PM", whatLine: "Owns how the product feels, not just what it does.", nextStep: "MSc HCI" },
    ],
  },
  sales: {
    domain: "entrepreneurship", dims: ["people", "entrepreneurial"],
    careers: [
      { name: "B2B Sales / Business Development", whatLine: "Turns strangers into revenue, one no at a time.", nextStep: "Start now, MBA later" },
      { name: "Account Manager", whatLine: "Keeps the customers you already won, and grows them.", nextStep: "Industry entry role" },
      { name: "Partnerships Associate", whatLine: "Builds the deals where two companies win together.", nextStep: "MSc Management" },
    ],
  },
  operator: {
    domain: "entrepreneurship", dims: ["practical", "leadership"],
    careers: [
      { name: "Chief of Staff track", whatLine: "The founder's right hand: whatever is broken this week is yours.", nextStep: "Startup entry" },
      { name: "BizOps Analyst", whatLine: "Finds and fixes how the company actually runs.", nextStep: "MSc Management/Analytics" },
      { name: "Program Manager", whatLine: "Lands the big cross-team thing nobody else can hold.", nextStep: "PMP or MSc" },
    ],
  },
  build: {
    domain: "technology", dims: ["practical", "analytical"],
    careers: [
      { name: "Software Engineer", whatLine: "Builds the thing that has to work on Friday.", nextStep: "Portfolio route — ship two real projects", nextStepNonNative: "MSc CS conversion, then portfolio" },
      { name: "Full-stack Developer", whatLine: "Owns the product from database to browser.", nextStep: "Portfolio route", nextStepNonNative: "MSc CS conversion, then portfolio" },
      { name: "Mobile Developer", whatLine: "Builds what people actually carry in their pocket.", nextStep: "Portfolio route", nextStepNonNative: "MSc CS conversion, then portfolio" },
    ],
  },
  data: {
    domain: "technology", dims: ["analytical", "practical"],
    careers: [
      { name: "Data Analyst", whatLine: "Turns messy numbers into the answer the room needs.", nextStep: "MSc Data Analytics", nextStepNonNative: "MSc Data Analytics — open to non-CS backgrounds" },
      { name: "BI Analyst", whatLine: "Builds the dashboards decisions actually get made from.", nextStep: "MSc Business Analytics", nextStepNonNative: "MSc Business Analytics — open to non-CS backgrounds" },
      { name: "Data Scientist", whatLine: "Models that predict, not just describe.", nextStep: "MSc Data Science (maths needed)" },
    ],
  },
  product_tech: {
    domain: "technology", dims: ["analytical", "creative"],
    careers: [
      { name: "Technical Product Manager", whatLine: "Decides what engineers build, and can argue why.", nextStep: "CS base + MSc/MBA" },
      { name: "Solutions Engineer", whatLine: "The technical person in the sales room.", nextStep: "CS base" },
      { name: "Product Analyst (tech)", whatLine: "Measures what shipped and whether it mattered.", nextStep: "MSc Analytics" },
    ],
  },
  infrastructure: {
    domain: "technology", dims: ["practical", "analytical"],
    careers: [
      { name: "DevOps / SRE", whatLine: "Keeps the system up while everyone else changes it.", nextStep: "Cloud certs + MSc" },
      { name: "Cloud Engineer", whatLine: "Builds the platform everything else runs on.", nextStep: "AWS/Azure certs" },
      { name: "Cybersecurity Analyst", whatLine: "Finds the hole before someone hostile does.", nextStep: "MSc Cyber Security" },
    ],
  },
  psychology: {
    domain: "people_society", dims: ["people", "analytical"],
    careers: [
      { name: "Counselling Psychologist", whatLine: "Sits with what people can't say anywhere else.", nextStep: "MA/MSc Psychology, then MPhil/licensure" },
      { name: "Organisational Psychologist", whatLine: "Applies how people work to how companies run.", nextStep: "MSc IO Psychology" },
      { name: "UX Researcher", whatLine: "Watches real people use things and reports the truth.", nextStep: "MSc HCI/Psychology" },
    ],
  },
  education: {
    domain: "people_society", dims: ["people", "creative"],
    careers: [
      { name: "Teacher / Lecturer", whatLine: "The hundredth explanation, delivered like the first.", nextStep: "B.Ed/MA + NET" },
      { name: "EdTech Content Designer", whatLine: "Designs how a million students learn a thing.", nextStep: "MSc Instructional Design" },
      { name: "Academic Counsellor", whatLine: "Helps students choose with more than a brochure.", nextStep: "MA Psychology/Education" },
    ],
  },
  policy: {
    domain: "people_society", dims: ["analytical", "people"],
    careers: [
      { name: "Policy Analyst", whatLine: "Turns evidence into rules that survive politics.", nextStep: "MPP / MA Public Policy" },
      { name: "Public Administration", whatLine: "Runs the system from inside it.", nextStep: "UPSC route or MPA" },
      { name: "Development Consultant", whatLine: "Fixes programmes that matter more than they pay.", nextStep: "MA Development Studies" },
    ],
  },
  community: {
    domain: "people_society", dims: ["people", "leadership"],
    careers: [
      { name: "NGO Program Manager", whatLine: "Delivers real change on less money than it needs.", nextStep: "MSW" },
      { name: "CSR Associate", whatLine: "Points corporate money at problems that count.", nextStep: "MSW or MBA Sustainability" },
      { name: "Public Health Coordinator", whatLine: "Gets health services to the people who won't come to them.", nextStep: "MPH" },
    ],
  },
};

/** Decision 4: highest radar dim in an unchosen branch → this card. */
export const CROSS_BRANCH: Record<RadarDim, { domain: DomainId; role: RoleId }> = {
  analytical: { domain: "technology", role: "data" },
  people: { domain: "people_society", role: "psychology" },
  creative: { domain: "entrepreneurship", role: "product" },
  entrepreneurial: { domain: "entrepreneurship", role: "founder" },
  practical: { domain: "business", role: "operations" },
  leadership: { domain: "business", role: "strategy" },
};

export function nextStepFor(role: RoleId, careerIndex: number, degree: Degree): string {
  const entry = CATALOG[role];
  const career = entry.careers[careerIndex];
  const native = NATIVE_DEGREES[entry.domain].includes(degree);
  if (!native && career.nextStepNonNative) return career.nextStepNonNative;
  return career.nextStep;
}
