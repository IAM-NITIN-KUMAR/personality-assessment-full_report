// Anonymised career journeys, compiled from the tech & engineering roadmap brief (September 2026).
// Every profile is stripped of identifying detail: no names, no employers, no institutions, no
// cities. Degrees, dates, role titles, countries and skills are kept, because the shape of the path
// is the point. Employers and universities are described by category instead ("a global technology
// company", "a US university"). Stories are written in the anonymous third person.
//
// RULE: never reintroduce a person's name, an employer or an institution here. The journeys tests
// enforce this — see tests/v2/journeys-data.test.ts.

import type { Discipline } from "../../course-catalog";
import type { RoleId } from "../types";

export interface Journey {
  /** Roadmap serial, zero-padded ("01".."33"). Stable; never reuse. */
  id: string;
  /** Neutral descriptor: degree plus graduating batch. Never a person's name. */
  label: string;
  /** Course-catalog ids this person's bachelor's counts as (the roadmap's grouping plus the actual degree). */
  courses: string[];
  discipline: Extract<Discipline, "tech_cs" | "tech_engg">;
  /** Technology-domain roles whose careers this person's current job demonstrates. Empty for core-engineering jobs. */
  proves: RoleId[];
  steps: {
    degree: string;
    firstJob: string;
    /** What they added on top of the degree: a master's, a certification, key internships. */
    bridge: string;
    now: string;
  };
  skills: string[];
  /** Two or three sentences: how the first job led to the current one. */
  story: string;
  status: "Employed" | "Early career" | "Doctoral researcher";
}

export const JOURNEYS: Journey[] = [
  // ─── Technology and Computer Science ───────────────────────────────────────
  {
    id: "01", label: "BCA graduate, 2019 batch", courses: ["bca"], discipline: "tech_cs", proves: ["data"],
    steps: {
      degree: "Bachelor of Computer Applications, a private university in Bangalore (2016–2019)",
      firstJob: "Transformation Change Analyst, a global energy company (2019–2021)",
      bridge: "Master of Business Administration at a top national institute of technology, plus an analytics internship at a global consulting firm",
      now: "Lead Data Scientist, a global management consulting firm, India",
    },
    skills: ["Data Science", "Analytics", "Management Consulting"],
    story: "This graduate began with a computer applications degree and a transformation analytics role in the energy sector, then added an MBA at a top national institute and an analytics internship in consulting. They joined that consulting firm full time as a Data Scientist and have since risen to Lead Data Scientist.",
    status: "Employed",
  },
  {
    id: "02", label: "BCA graduate, 2020 batch", courses: ["bca"], discipline: "tech_cs", proves: ["infrastructure"],
    steps: {
      degree: "Bachelor of Computer Applications, a private institute in Delhi (2017–2020)",
      firstJob: "System Administrator, a large IT services firm (2021–2023)",
      bridge: "Master of Computer Applications through a distance university, studied alongside work",
      now: "Service Design and Transition Manager, a large IT services firm, United Kingdom",
    },
    skills: ["Service Management", "Systems Administration"],
    story: "This graduate paired a bachelor's with a distance Master of Computer Applications and joined a large IT services firm as a System Administrator. They progressed to Team Lead Manager and then to Service Design and Transition Manager, moving from India to a United Kingdom posting along the way.",
    status: "Employed",
  },
  {
    id: "05", label: "B.Tech Computer Science graduate, 2024 batch", courses: ["btech_cse"], discipline: "tech_cs", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Computer Science and Engineering, a state technological university (2021–2024)",
      firstJob: "Associate Software Engineer, a global professional services firm",
      bridge: "Straight from campus into a large-firm software engineering track",
      now: "Associate Software Engineer, a global professional services firm, India",
    },
    skills: ["Software Engineering"],
    story: "This graduate completed a Computer Science and Engineering degree and joined a global professional services firm as an Associate Software Engineer. They are at the early stage of a general software engineering track, the most common first rung for this degree.",
    status: "Employed",
  },
  {
    id: "06", label: "B.Tech Computer Science graduate, 2016 batch", courses: ["btech_cse"], discipline: "tech_cs", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Computational Science, a state university in Punjab (2012–2016)",
      firstJob: "Android Application Developer, a Canadian software company",
      bridge: "Post Graduate Diploma in Mobile Application Development at a Canadian college (2018–2019)",
      now: "Senior Android Developer, a global professional services firm, Canada",
    },
    skills: ["Android", "Mobile Applications"],
    story: "This graduate moved from a Bachelor of Technology in Computational Science into a Post Graduate Diploma in Mobile Application Development in Canada. They built a mobile specialisation across a software company, a startup and a telecom operator, and are now a Senior Android Developer at a global professional services firm.",
    status: "Employed",
  },
  {
    id: "07", label: "B.Tech Computer Science graduate", courses: ["btech_cse"], discipline: "tech_cs", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Computer Science, a private engineering institute in India",
      firstJob: "Software Developer, a large IT services firm",
      bridge: "Master of Science in Computer Science at a US university, plus retail-sector internships",
      now: "Software Development Engineer 2, a global technology company, United States",
    },
    skills: ["Software Development", "Distributed Systems"],
    story: "This graduate paired a Computer Science bachelor's with a Master of Science at a US university. They progressed from Software Developer at a large IT services firm, through internships, to Software Development Engineer, and are now a Software Development Engineer 2 at a global technology company.",
    status: "Employed",
  },
  {
    id: "08", label: "B.Tech Computer Science (AI & ML) graduate, 2024 batch", courses: ["btech_cse_aiml", "btech_cse"], discipline: "tech_cs", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Computer Science (Artificial Intelligence and Machine Learning), a private engineering college in Hyderabad (2020–2024)",
      firstJob: "Packaged App Development Associate, a global professional services firm (2024)",
      bridge: "Vendor certifications in generative artificial intelligence and AI-assisted coding",
      now: "Quality Assurance Engineer, a global professional services firm, India",
    },
    skills: ["Machine Learning", "Natural Language Processing", "Test Automation"],
    story: "This graduate completed a Computer Science degree with an Artificial Intelligence and Machine Learning specialisation and joined a global professional services firm. They work in quality assurance across enterprise applications using SQL validation and Selenium automation, backed by generative AI and AI-assisted coding certifications.",
    status: "Employed",
  },
  {
    id: "09", label: "B.Tech Computer Engineering graduate, 2025 batch", courses: ["btech_cse_cyber", "btech_cse"], discipline: "tech_cs", proves: ["infrastructure"],
    steps: {
      degree: "Bachelor of Technology, Computer Engineering, a private deemed university in Chennai (2021–2025)",
      firstJob: "Information Technology Intern, a global engine manufacturer's India arm",
      bridge: "A vendor certification in privileged access management",
      now: "Security Engineer, a global professional services firm, India",
    },
    skills: ["Security Engineering", "Identity Security", "Privileged Access Management"],
    story: "This graduate completed a Computer Engineering degree with an early information technology internship in manufacturing. They moved into security as a Security Engineer at a global professional services firm and earned a privileged-access credential, building a focused identity and access security profile.",
    status: "Employed",
  },
  {
    id: "10", label: "B.Tech Computer Science (Cyber Security) graduate", courses: ["btech_cse_cyber", "btech_cse"], discipline: "tech_cs", proves: ["infrastructure"],
    steps: {
      degree: "Bachelor's degree, Computer Science (Cyber Security), a private deemed university in India",
      firstJob: "Research Intern, the artificial intelligence department of a top national institute of technology (2023)",
      bridge: "An associate engineer role in product development",
      now: "Technical Support Engineer, a global technology company, India",
    },
    skills: ["Cyber Security", "Windows Support", "Product Development"],
    story: "This graduate studied Computer Science with a Cyber Security specialisation and interned in the artificial intelligence department of a top national institute. After an associate engineer role in product development, they became a Technical Support Engineer at a global technology company.",
    status: "Employed",
  },
  {
    id: "13", label: "B.Tech Computer Engineering graduate", courses: ["btech_cse_ds", "btech_cse"], discipline: "tech_cs", proves: ["data"],
    steps: {
      degree: "Bachelor of Technology, Computer Engineering, a state technological university in West Bengal",
      firstJob: "Industry Project Computer Vision Engineer, a US home-improvement retailer",
      bridge: "Master of Science in Computer Science at a US public university",
      now: "Lead Machine Learning Engineer, a global financial services firm, United States",
    },
    skills: ["Machine Learning", "Computer Vision", "Data Science"],
    story: "This graduate paired a Computer Engineering bachelor's with a Master of Science in Computer Science in the United States. They built a data and machine learning track through a healthcare software company and an analytics consultancy, then joined a global financial services firm, rising from Senior to Lead Machine Learning Engineer.",
    status: "Employed",
  },
  {
    id: "14", label: "B.Tech Computer Science (IoT minor) graduate, 2023 batch", courses: ["btech_cse_iot", "btech_cse"], discipline: "tech_cs", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Computer Science Engineering with an Internet of Things minor, a private deemed university in India (2019–2023)",
      firstJob: "Research Intern, the India research arm of a global electronics manufacturer (2022)",
      bridge: "Master of Science in Computer Science at a US public university (2023–2025)",
      now: "Graduate Researcher, a distributed systems laboratory at a US public university",
    },
    skills: ["Distributed Systems", "Internet of Things", "Natural Language Processing"],
    story: "This graduate completed a Computer Science degree with an Internet of Things minor, then a Master of Science in the United States. Their work spans a security internship in consumer electronics, an Industrial Internet of Things pilot using video analytics, and graduate research on distributed graph databases.",
    status: "Early career",
  },

  // ─── Engineering (non Computer Science) ────────────────────────────────────
  {
    id: "15", label: "B.Tech Mechanical Engineering graduate, 2017 batch", courses: ["btech_mech"], discipline: "tech_engg", proves: ["product_tech"],
    steps: {
      degree: "Bachelor of Technology, Mechanical Engineering, a national institute of technology (2013–2017)",
      firstJob: "Graduate Research Assistant, a US university business school",
      bridge: "Master of Science in Industrial Engineering at a US university (2022–2024)",
      now: "Technical Program Manager, New Product Introduction, a US electric-vehicle manufacturer, United States",
    },
    skills: ["Manufacturing", "New Product Introduction", "Program Management"],
    story: "This graduate paired a Mechanical Engineering degree with a Master of Science in Industrial Engineering in the United States. They moved from Senior Manufacturing Engineer at a global automotive supplier into an electric-vehicle manufacturer as a Manufacturing Process Engineer, and now run new product introduction as a Technical Program Manager.",
    status: "Employed",
  },
  {
    id: "16", label: "B.Tech Mechanical Engineering graduate, 2022 batch", courses: ["btech_mech"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Mechanical Engineering, a private deemed university in India (2018–2022)",
      firstJob: "Mechanical Engineer (Intern), an architecture and engineering firm",
      bridge: "Master of Science in Mechanical Engineering at a US public university, plus an internship at an electric-vehicle manufacturer",
      now: "Mechanical Product Design Engineer, a global technology company, United States",
    },
    skills: ["Computer Aided Design", "Finite Element Analysis", "Thermal Design"],
    story: "This graduate paired a Mechanical Engineering degree with a Master of Science at a US public university. Internships in engineering consulting and at an electric-vehicle manufacturer led to a Hardware Thermal Quality Assurance Engineer role at a networking company, and then to a global technology company, designing mechanical components and cooling systems for hyperscale data centres. Seven years from degree start to big tech.",
    status: "Employed",
  },
  {
    id: "17", label: "B.Tech Mechanical Engineering graduate, 2020 batch", courses: ["btech_mech"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Mechanical Engineering, a national institute of technology (2016–2020)",
      firstJob: "Intern, a public-sector heavy engineering company",
      bridge: "Master of Technology in Mechanical Design at a top national institute of technology (2023–2025)",
      now: "Doctor of Philosophy candidate, Engineering and Industrial Management, a US public university",
    },
    skills: ["Mechanical Design", "Industrial Management", "Automotive Service"],
    story: "This graduate moved from a Mechanical Engineering degree into automotive service and management roles, then a Master of Technology in Mechanical Design at a top national institute. They are now pursuing a doctorate in Engineering and Industrial Management in the United States.",
    status: "Doctoral researcher",
  },
  {
    id: "18", label: "B.Tech Electrical Engineering graduate", courses: ["btech_eee"], discipline: "tech_engg", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Electrical Engineering, a top national institute of technology",
      firstJob: "Machine Learning Intern, an engineering services startup",
      bridge: "Master of Science at a US public university, plus internships at a global technology company and a semiconductor company",
      now: "Graphics Processing Unit Performance Engineer, a global technology company, United States",
    },
    skills: ["Graphics Processing Unit", "Performance Modelling", "Machine Learning"],
    story: "This graduate studied Electrical Engineering at a top national institute and completed a Master of Science at a US public university, alongside leading outreach teams for a large campus festival. After internships in software and semiconductors, they became a Graphics Processing Unit Performance Engineer at a global technology company.",
    status: "Employed",
  },
  {
    id: "19", label: "B.Tech Electrical and Electronics graduate, 2026 batch", courses: ["btech_eee"], discipline: "tech_engg", proves: ["build"],
    steps: {
      degree: "Bachelor's degree, Electrical and Electronics Engineering, a private institute of technology in Hyderabad (2022–2026)",
      firstJob: "Technical Intern, an electronics services company (2024)",
      bridge: "Internships at an IT services firm and a global technology company, converted into a full-time offer",
      now: "Software Development Engineer I, a global technology company, India",
    },
    skills: ["Software Development", "Research"],
    story: "This graduate studied Electrical and Electronics Engineering at a private institute of technology. Internships in IT services and at a global technology company converted into a full-time Software Development Engineer role straight out of college, without a computer science degree.",
    status: "Employed",
  },
  {
    id: "20", label: "B.Tech Electrical and Electronics graduate, 2014 batch", courses: ["btech_eee"], discipline: "tech_engg", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Electrical and Electronics Engineering, a private engineering college near Delhi (2010–2014)",
      firstJob: "Research and Development Engineer, a semiconductor company (2014–2018)",
      bridge: "Master of Science in Embedded Systems at a US private university (2018–2020)",
      now: "Software Development Engineer II, a global technology company, United States",
    },
    skills: ["Embedded Systems", "Computer Architecture", "Wireless Communication"],
    story: "This graduate moved from an Electrical and Electronics Engineering degree and four years of research and development in semiconductors into a Master of Science in Embedded Systems in the United States. They are now a Software Development Engineer II at a global technology company.",
    status: "Employed",
  },
  {
    id: "21", label: "B.Tech Electrical, Electronics and Communications graduate, 2011 batch", courses: ["btech_eee", "btech_ece"], discipline: "tech_engg", proves: ["infrastructure", "build"],
    steps: {
      degree: "Bachelor of Technology, Electrical, Electronics and Communications Engineering, a state technological university in West Bengal (2007–2011)",
      firstJob: "Programmer Analyst, a large IT services firm (2011–2014)",
      bridge: "Nearly a decade leading order-management migrations in IT services, then a professional certificate in artificial intelligence from a UK university (2025–2026)",
      now: "Engineering Lead, a large IT services firm, United Kingdom",
    },
    skills: ["Order Management Systems", "Cloud and Kubernetes", "Enterprise Architecture"],
    story: "This graduate studied Electrical, Electronics and Communications Engineering and spent nearly a decade in IT services, leading order management system migrations for United Kingdom and United States retailers. They are now an Engineering Lead working on returns platforms and AI-powered operations tooling for a major retailer.",
    status: "Employed",
  },
  {
    id: "22", label: "B.Tech Electrical, Electronics and Communications graduate, 2019 batch", courses: ["btech_ece", "btech_eee", "btech_robotics"], discipline: "tech_engg", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Electrical, Electronics and Communications Engineering, a private university in Rajasthan (2015–2019)",
      firstJob: "Project Intern, an engineering innovations startup",
      bridge: "Embedded Vision Engineer at an autonomous-driving startup, then driver-assistance work at an automotive electronics supplier and perception software at a German automaker's India research centre",
      now: "Mechatronics Technical Lead Engineer, a semiconductor equipment manufacturer, India",
    },
    skills: ["Advanced Driver Assistance Systems", "Perception Software", "Computer Vision"],
    story: "This graduate studied Electrical, Electronics and Communications Engineering and specialised in perception and autonomy. They moved through Embedded Vision Engineer at an autonomous-driving startup, driver-assistance development at an electronics supplier, Senior Perception Software Engineer at a German automaker's India research centre, and are now a Mechatronics Technical Lead Engineer at a semiconductor equipment manufacturer.",
    status: "Employed",
  },
  {
    id: "23", label: "B.Tech Electrical, Electronics and Communications graduate, 2026 batch", courses: ["btech_ece"], discipline: "tech_engg", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Electrical, Electronics and Communications Engineering, a private deemed university in India (2022–2026)",
      firstJob: "Embedded System Intern, a national defence research organisation (2024)",
      bridge: "An embedded software engineering internship, converted into a full-time role",
      now: "Engineer, a large IT services firm, India",
    },
    skills: ["Embedded Systems", "Embedded Software"],
    story: "This graduate studied Electrical, Electronics and Communications Engineering, with an embedded systems internship at a national defence research organisation. They moved into an embedded software engineering internship and then a full-time Engineer role at a large IT services firm.",
    status: "Early career",
  },
  {
    id: "24", label: "B.Tech Electronics and Communications graduate, 2023 batch", courses: ["btech_ece"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Electronics and Communications Engineering, a private university in Bangalore (2019–2023)",
      firstJob: "Project Intern, a commercial-vehicle manufacturer (2022)",
      bridge: "Straight from campus into an industrial plant role",
      now: "Maintenance Engineer, a global chemicals company, India",
    },
    skills: ["Maintenance Engineering", "Industrial Systems"],
    story: "This graduate studied Electronics and Communications Engineering, with an internship at a commercial-vehicle manufacturer. They moved directly into industry as a Maintenance Engineer at a global chemicals company.",
    status: "Employed",
  },
  {
    id: "25", label: "B.Tech Electronics and Communications graduate, 2014 batch", courses: ["btech_ece"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Electronics and Communications Engineering, a state technical university in Uttar Pradesh (2010–2014)",
      firstJob: "Register Transfer Level Design Engineer, a memory technology startup",
      bridge: "Master of Technology in Very Large Scale Integration Design at a private deemed university (2015–2017)",
      now: "Senior Design Engineer, a semiconductor company, United States",
    },
    skills: ["Very Large Scale Integration Design", "Register Transfer Level Design"],
    story: "This graduate paired an Electronics and Communications Engineering degree with a Master of Technology in Very Large Scale Integration Design. They worked as a Register Transfer Level Design Engineer at a memory technology startup and are now a Senior Design Engineer at a semiconductor company, active in professional engineering bodies.",
    status: "Employed",
  },
  {
    id: "27", label: "B.Tech Automobile Engineering graduate, 2016 batch", courses: ["btech_auto"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Automobile Engineering, a state university in Kerala (2012–2016)",
      firstJob: "Automotive Service Advisor, a Japanese automaker's India operations (2016–2018)",
      bridge: "After-sales and warranty roles at luxury car dealerships in the United Arab Emirates",
      now: "Warranty Administrator, a British automotive manufacturer, United Kingdom",
    },
    skills: ["After Sales", "Warranty", "Service"],
    story: "This graduate completed an Automobile Engineering degree and built an automotive after-sales and warranty career, from a Japanese automaker's India operations to luxury dealerships in the United Arab Emirates, and now Warranty Administrator at a British automotive manufacturer.",
    status: "Employed",
  },
  {
    id: "28", label: "B.Tech Mechanical Engineering graduate, 2021 batch", courses: ["btech_auto", "btech_mech"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Mechanical Engineering, a private university in Bangalore (2017–2021)",
      firstJob: "Product Engineering Intern, a mobile-living products manufacturer (2023)",
      bridge: "Master of Science in Automotive Systems Engineering at a US public university (2022–2023), then validation work at a multinational automaker",
      now: "Vehicle Hardware Validation Engineer, a US electric-vehicle manufacturer, United States",
    },
    skills: ["Computer Aided Design", "Structural Validation", "Body in White"],
    story: "This graduate paired a Mechanical Engineering degree with a Master of Science in Automotive Systems Engineering in the United States. Product and validation roles at a products manufacturer and a multinational automaker led to a Vehicle Hardware Validation Engineer position at an electric-vehicle manufacturer.",
    status: "Employed",
  },
  {
    id: "29", label: "B.Tech Mechanical Engineering graduate, 2019 batch", courses: ["btech_auto", "btech_mech"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor's degree, Mechanical Engineering, a private engineering college in Bangalore (2015–2019)",
      firstJob: "Chassis Engineer and Fabrication Head, a student racing team (2018–2019)",
      bridge: "Formula Student, then a Master's in Automotive and Motorsport Engineering at a UK university (2020–2021)",
      now: "Senior Logistics Engineer, a British performance-car manufacturer, United Kingdom",
    },
    skills: ["Motorsport", "Chassis Design", "Logistics Engineering"],
    story: "This graduate paired a Mechanical Engineering bachelor's with a Master's in Automotive and Motorsport Engineering in the United Kingdom. A motorsport path through Formula Student and racing roles led to a performance-car manufacturer, where they progressed from Production Team Member to New Model and now Senior Logistics Engineer.",
    status: "Employed",
  },
  {
    id: "30", label: "B.Tech Mechanical Engineering graduate, 2017 batch", courses: ["btech_robotics", "btech_mech"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Mechanical Engineering, a private engineering college in Andhra Pradesh (2013–2017)",
      firstJob: "Research Engineer, a Korean automaker's India engineering centre (2017–2020)",
      bridge: "Master of Science in Mechatronics, Robotics and Automation Engineering at a German university (2020–2023), with a thesis at an automotive technology supplier",
      now: "Research Associate, a German university of applied sciences, Germany",
    },
    skills: ["Mechatronics", "Robotics", "Automotive Light Weight Design"],
    story: "This graduate moved from a Mechanical Engineering degree and a research role in automotive engineering into a Master of Science in Mechatronics, Robotics and Automation Engineering in Germany. They combined a master's thesis at an automotive technology supplier with German research and development roles, and now work in mechatronics research at a university of applied sciences.",
    status: "Employed",
  },
  {
    id: "31", label: "B.Tech Mechanical Engineering graduate, 2011 batch", courses: ["btech_robotics", "btech_mech"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Mechanical Engineering, a private engineering college in Kerala (2007–2011)",
      firstJob: "Fulfilment Centre Associate, a global technology company (2023–2024)",
      bridge: "Master of Science in Mechatronics and Robotics at a UK university (2022–2023), plus Lean Six Sigma",
      now: "Proxy Team Lead, a global technology company, United Kingdom",
    },
    skills: ["Human Robot Interaction", "Lean Six Sigma", "Operations"],
    story: "This graduate paired a Mechanical Engineering degree with a Master of Science in Mechatronics and Robotics in the United Kingdom. They applied human robot interaction and Lean methods inside warehouse operations, working with semi-automated robotic storage systems, and rose from Fulfilment Centre Associate to Proxy Team Lead.",
    status: "Employed",
  },
  {
    id: "32", label: "B.Tech Mechanical Engineering graduate, 2016 batch", courses: ["btech_robotics", "btech_mech"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor's degree, Mechanical Engineering, a state university in Kerala (2012–2016)",
      firstJob: "Programmer Analyst, a large IT services firm",
      bridge: "Post Graduate Diploma in Mechatronics, Robotics and Automation Engineering at a Canadian college (2018–2020)",
      now: "Mechatronics and Robotics Technician, a global technology company, Canada",
    },
    skills: ["Automation", "Robotics Maintenance"],
    story: "This graduate paired a Mechanical Engineering bachelor's with a Post Graduate Diploma in Mechatronics, Robotics and Automation Engineering in Canada. They worked across automation and robotics technician roles at automotive and contract manufacturers, and now at a global technology company.",
    status: "Employed",
  },
  {
    id: "33", label: "B.Tech Mechanical Engineering graduate, 2020 batch", courses: ["btech_robotics", "btech_mech"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Mechanical Engineering, a top national institute of technology (2016–2020)",
      firstJob: "Graduate Researcher, an intelligent-robotics laboratory at a US university (2022–2024)",
      bridge: "Master of Science in Robotics at a US university (2022–2024)",
      now: "Graduate Researcher at a US university, and Design Automation Engineer at an elevator manufacturer",
    },
    skills: ["Robotics", "Robot Operating System", "Trajectory Optimization"],
    story: "This graduate paired a Mechanical Engineering degree at a top national institute with a Master of Science in Robotics in the United States. Their research covered visuo-tactile sensing and humanoid manipulation, including a modular gripper for a humanoid robot, alongside a design automation role at an elevator manufacturer.",
    status: "Early career",
  },
];
