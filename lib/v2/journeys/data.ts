// Real career journeys, sourced from LinkedIn profiles supplied to Secure Steps and compiled in
// career roadmaps/Technology_and_Engineering_Career_Roadmap.pdf (September 2026). Profiles that
// arrived without a name or without a bachelor's degree are left out. Every short form is written
// out in full, matching the roadmap's brief. None of these profiles are independently verified.

import type { Discipline } from "../../course-catalog";
import type { RoleId } from "../types";

export interface Journey {
  /** Roadmap serial, zero-padded ("01".."33"). Stable; never reuse. */
  id: string;
  name: string;
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
    id: "01", name: "Anshul Agarwal", courses: ["bca"], discipline: "tech_cs", proves: ["data"],
    steps: {
      degree: "Bachelor of Computer Applications, Christ University, Bangalore (2016–2019)",
      firstJob: "Transformation Change Analyst, Shell (2019–2021)",
      bridge: "Master of Business Administration, Indian Institute of Technology Madras, plus an analytics internship at McKinsey",
      now: "Lead Data Scientist, McKinsey & Company, Gurugram",
    },
    skills: ["Data Science", "Analytics", "Management Consulting"],
    story: "Anshul began with a computer applications degree and a transformation analytics role at Shell, then added an MBA at IIT Madras and an analytics internship at McKinsey. He joined McKinsey full time as a Data Scientist and has since risen to Lead Data Scientist.",
    status: "Employed",
  },
  {
    id: "02", name: "Mansi Rana", courses: ["bca"], discipline: "tech_cs", proves: ["infrastructure"],
    steps: {
      degree: "Bachelor of Computer Applications, Vivekananda Institute of Professional Studies (2017–2020)",
      firstJob: "System Administrator, Tata Consultancy Services (2021–2023)",
      bridge: "Master of Computer Applications, Indira Gandhi National Open University, alongside work",
      now: "Service Design and Transition Manager, Tata Consultancy Services, United Kingdom",
    },
    skills: ["Service Management", "Systems Administration"],
    story: "Mansi paired her bachelor's with a distance Master of Computer Applications and joined Tata Consultancy Services as a System Administrator. She progressed to Team Lead Manager and then to Service Design and Transition Manager, moving from India to a United Kingdom posting along the way.",
    status: "Employed",
  },
  {
    id: "05", name: "Divya Kolhe", courses: ["btech_cse"], discipline: "tech_cs", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Computer Science and Engineering, Dr. Babasaheb Ambedkar Technological University (2021–2024)",
      firstJob: "Associate Software Engineer, Accenture",
      bridge: "Straight from campus into a large-firm software engineering track",
      now: "Associate Software Engineer, Accenture, India",
    },
    skills: ["Software Engineering"],
    story: "Divya completed her Computer Science and Engineering degree and joined Accenture as an Associate Software Engineer. She is at the early stage of a general software engineering track, the most common first rung for this degree.",
    status: "Employed",
  },
  {
    id: "06", name: "Ramanpreet Kaur", courses: ["btech_cse"], discipline: "tech_cs", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Computational Science, Punjabi University (2012–2016)",
      firstJob: "Android Application Developer, Dakia Canada",
      bridge: "Post Graduate Diploma in Mobile Application Development, Cégep de la Gaspésie et des Îles, Canada (2018–2019)",
      now: "Senior Android Developer, Accenture, Canada",
    },
    skills: ["Android", "Mobile Applications"],
    story: "Ramanpreet moved from a Bachelor of Technology in Computational Science into a Post Graduate Diploma in Mobile Application Development in Canada. She built a mobile specialisation across Dakia Canada, Stay Inc. and Bell, and is now a Senior Android Developer at Accenture.",
    status: "Employed",
  },
  {
    id: "07", name: "Aditya Malik", courses: ["btech_cse"], discipline: "tech_cs", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Computer Science, Jaypee Institute of Information Technology",
      firstJob: "Software Developer, Tata Consultancy Services",
      bridge: "Master of Science in Computer Science, Boston University, plus internships at Office Depot",
      now: "Software Development Engineer 2, Amazon, United States",
    },
    skills: ["Software Development", "Distributed Systems"],
    story: "Aditya paired his Computer Science bachelor's with a Master of Science at Boston University. He progressed from Software Developer at Tata Consultancy Services, through internships, to Software Development Engineer, and is now a Software Development Engineer 2 at Amazon.",
    status: "Employed",
  },
  {
    id: "08", name: "Puja Badabandala", courses: ["btech_cse_aiml", "btech_cse"], discipline: "tech_cs", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Computer Science (Artificial Intelligence and Machine Learning), CMR College of Engineering and Technology (2020–2024)",
      firstJob: "Packaged App Development Associate, Accenture (2024)",
      bridge: "Google Generative Artificial Intelligence and GitHub Copilot certifications",
      now: "Quality Assurance Engineer, Accenture, Hyderabad",
    },
    skills: ["Machine Learning", "Natural Language Processing", "Test Automation"],
    story: "Puja completed a Computer Science degree with an Artificial Intelligence and Machine Learning specialisation and joined Accenture. She works in quality assurance across enterprise applications using SQL validation and Selenium automation, backed by Google Generative AI and GitHub Copilot certifications.",
    status: "Employed",
  },
  {
    id: "09", name: "Shreya Sharma", courses: ["btech_cse_cyber", "btech_cse"], discipline: "tech_cs", proves: ["infrastructure"],
    steps: {
      degree: "Bachelor of Technology, Computer Engineering, SRM Institute of Science and Technology (2021–2025)",
      firstJob: "Information Technology Intern, Cummins India",
      bridge: "CyberArk Defender certification in Privileged Access Management",
      now: "Security Engineer, Deloitte, India",
    },
    skills: ["Security Engineering", "Identity Security", "Privileged Access Management"],
    story: "Shreya completed a Computer Engineering degree with an early information technology internship at Cummins India. She moved into security as a Security Engineer at Deloitte and earned the CyberArk Defender credential, building a focused identity and access security profile.",
    status: "Employed",
  },
  {
    id: "10", name: "T Mahima Singh", courses: ["btech_cse_cyber", "btech_cse"], discipline: "tech_cs", proves: ["infrastructure"],
    steps: {
      degree: "Bachelor's degree, Computer Science (Cyber Security), Amrita Vishwa Vidyapeetham",
      firstJob: "Research Intern, Department of Artificial Intelligence, Indian Institute of Technology Hyderabad (2023)",
      bridge: "An associate engineer role in product development",
      now: "Technical Support Engineer, Microsoft, India",
    },
    skills: ["Cyber Security", "Windows Support", "Product Development"],
    story: "Mahima studied Computer Science with a Cyber Security specialisation and interned in the Department of Artificial Intelligence at IIT Hyderabad. After an associate engineer role in product development, she became a Technical Support Engineer at Microsoft.",
    status: "Employed",
  },
  {
    id: "13", name: "Sourav Roy Choudhury", courses: ["btech_cse_ds", "btech_cse"], discipline: "tech_cs", proves: ["data"],
    steps: {
      degree: "Bachelor of Technology, Computer Engineering, West Bengal University of Technology",
      firstJob: "Industry Project Computer Vision Engineer, Lowe's Companies",
      bridge: "Master of Science in Computer Science, University of North Carolina at Charlotte",
      now: "Lead Machine Learning Engineer, State Street, United States",
    },
    skills: ["Machine Learning", "Computer Vision", "Data Science"],
    story: "Sourav paired a Computer Engineering bachelor's with a Master of Science in Computer Science in the United States. He built a data and machine learning track through Forcura and Tiger Analytics, then joined State Street, rising from Senior to Lead Machine Learning Engineer.",
    status: "Employed",
  },
  {
    id: "14", name: "Aatman Prajapati", courses: ["btech_cse_iot", "btech_cse"], discipline: "tech_cs", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Computer Science Engineering with an Internet of Things minor, Vellore Institute of Technology (2019–2023)",
      firstJob: "Research Intern, Samsung Research and Development Institute India (2022)",
      bridge: "Master of Science in Computer Science, University of Washington Bothell (2023–2025)",
      now: "Graduate Researcher, Distributed Systems Laboratory, University of Washington Bothell",
    },
    skills: ["Distributed Systems", "Internet of Things", "Natural Language Processing"],
    story: "Aatman completed his Computer Science degree with an Internet of Things minor, then a Master of Science in the United States. His work spans a security internship at Samsung, an Industrial Internet of Things pilot using video analytics, and graduate research on distributed graph databases.",
    status: "Early career",
  },

  // ─── Engineering (non Computer Science) ────────────────────────────────────
  {
    id: "15", name: "Jainam Gala", courses: ["btech_mech"], discipline: "tech_engg", proves: ["product_tech"],
    steps: {
      degree: "Bachelor of Technology, Mechanical Engineering, National Institute of Technology Karnataka (2013–2017)",
      firstJob: "Graduate Research Assistant, Purdue University Daniels School of Business",
      bridge: "Master of Science in Industrial Engineering, Purdue University (2022–2024)",
      now: "Technical Program Manager, New Product Introduction, Tesla, United States",
    },
    skills: ["Manufacturing", "New Product Introduction", "Program Management"],
    story: "Jainam paired a Mechanical Engineering degree with a Master of Science in Industrial Engineering at Purdue. He moved from Senior Manufacturing Engineer at ZF Group into Tesla as a Manufacturing Process Engineer, and now runs new product introduction as a Technical Program Manager.",
    status: "Employed",
  },
  {
    id: "16", name: "Kishorre Annanth Vijayan", courses: ["btech_mech"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Mechanical Engineering, Vellore Institute of Technology (2018–2022)",
      firstJob: "Mechanical Engineer (Intern), SmithGroup",
      bridge: "Master of Science in Mechanical Engineering, Texas A&M University, plus an internship at Tesla",
      now: "Mechanical Product Design Engineer, Google, California",
    },
    skills: ["Computer Aided Design", "Finite Element Analysis", "Thermal Design"],
    story: "Kishorre paired his Mechanical Engineering degree with a Master of Science at Texas A&M. Internships at SmithGroup and Tesla led to a Hardware Thermal Quality Assurance Engineer role at Cisco, and then to Google, where he designs mechanical components and cooling systems for hyperscale data centres. Seven years from degree start to Google.",
    status: "Employed",
  },
  {
    id: "17", name: "Purushottam Ray", courses: ["btech_mech"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Mechanical Engineering, Maulana Azad National Institute of Technology (2016–2020)",
      firstJob: "Intern, Bharat Heavy Electricals Limited",
      bridge: "Master of Technology in Mechanical Design, Indian Institute of Technology Madras (2023–2025)",
      now: "Doctor of Philosophy candidate, Engineering and Industrial Management, Wichita State University",
    },
    skills: ["Mechanical Design", "Industrial Management", "Automotive Service"],
    story: "Purushottam moved from a Mechanical Engineering degree into automotive service and management roles, then a Master of Technology in Mechanical Design at IIT Madras. He is now pursuing a doctorate in Engineering and Industrial Management in the United States.",
    status: "Doctoral researcher",
  },
  {
    id: "18", name: "Madhan Sanikommu", courses: ["btech_eee"], discipline: "tech_engg", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Electrical Engineering, Indian Institute of Technology Madras",
      firstJob: "Machine Learning Intern, Blue Barrel Solutions",
      bridge: "Master of Science, University of Texas at Austin, plus internships at Microsoft and Qualcomm",
      now: "Graphics Processing Unit Performance Engineer, Apple, United States",
    },
    skills: ["Graphics Processing Unit", "Performance Modelling", "Machine Learning"],
    story: "Madhan studied Electrical Engineering at IIT Madras and completed a Master of Science at the University of Texas at Austin, alongside leading outreach teams at the Saarang festival. After internships at Microsoft and Qualcomm, he became a Graphics Processing Unit Performance Engineer at Apple.",
    status: "Employed",
  },
  {
    id: "19", name: "Yash Garg", courses: ["btech_eee"], discipline: "tech_engg", proves: ["build"],
    steps: {
      degree: "Bachelor's degree, Electrical and Electronics Engineering, Birla Institute of Technology and Science Pilani, Hyderabad (2022–2026)",
      firstJob: "Technical Intern, Electrono Solutions (2024)",
      bridge: "Internships at Tech Mahindra and Amazon, converted into a full-time offer",
      now: "Software Development Engineer I, Amazon, India",
    },
    skills: ["Software Development", "Research"],
    story: "Yash studied Electrical and Electronics Engineering at BITS Pilani, Hyderabad. Internships at Tech Mahindra and Amazon converted into a full-time Software Development Engineer role at Amazon straight out of college, without a computer science degree.",
    status: "Employed",
  },
  {
    id: "20", name: "Kartik Srivastava", courses: ["btech_eee"], discipline: "tech_engg", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Electrical and Electronics Engineering, Galgotias College of Engineering and Technology (2010–2014)",
      firstJob: "Research and Development Engineer, Broadcom (2014–2018)",
      bridge: "Master of Science in Embedded Systems, University of Pennsylvania (2018–2020)",
      now: "Software Development Engineer II, Amazon, United States",
    },
    skills: ["Embedded Systems", "Computer Architecture", "Wireless Communication"],
    story: "Kartik moved from an Electrical and Electronics Engineering degree and four years of research and development at Broadcom into a Master of Science in Embedded Systems at the University of Pennsylvania. He is now a Software Development Engineer II at Amazon.",
    status: "Employed",
  },
  {
    id: "21", name: "Mrinmoy Mandal", courses: ["btech_eee", "btech_ece"], discipline: "tech_engg", proves: ["infrastructure", "build"],
    steps: {
      degree: "Bachelor of Technology, Electrical, Electronics and Communications Engineering, West Bengal University of Technology (2007–2011)",
      firstJob: "Programmer Analyst, Cognizant (2011–2014)",
      bridge: "Nearly a decade leading order-management migrations at Cognizant, then a Professional Certificate in Artificial Intelligence, Imperial College London (2025–2026)",
      now: "Engineering Lead, Tata Consultancy Services, London",
    },
    skills: ["Order Management Systems", "Cloud and Kubernetes", "Enterprise Architecture"],
    story: "Mrinmoy studied Electrical, Electronics and Communications Engineering and spent nearly a decade at Cognizant, leading order management system migrations for United Kingdom and United States retailers. He is now an Engineering Lead at Tata Consultancy Services, working on returns platforms and AI-powered operations tooling for a major retailer.",
    status: "Employed",
  },
  {
    id: "22", name: "Shivarama Devarasetty", courses: ["btech_ece", "btech_eee", "btech_robotics"], discipline: "tech_engg", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Electrical, Electronics and Communications Engineering, NIIT University (2015–2019)",
      firstJob: "Project Intern, VirGo Innovations",
      bridge: "Embedded Vision Engineer at Flux Auto, then Advanced Driver Assistance Systems at Harman and perception software at Mercedes-Benz Research and Development India",
      now: "Mechatronics Technical Lead Engineer, Lam Research, India",
    },
    skills: ["Advanced Driver Assistance Systems", "Perception Software", "Computer Vision"],
    story: "Shivarama studied Electrical, Electronics and Communications Engineering and specialised in perception and autonomy. He moved through Embedded Vision Engineer at Flux Auto, driver-assistance development at Harman, Senior Perception Software Engineer at Mercedes-Benz Research and Development India, and is now a Mechatronics Technical Lead Engineer at Lam Research.",
    status: "Employed",
  },
  {
    id: "23", name: "Chebrolu Satya Naga Renu", courses: ["btech_ece"], discipline: "tech_engg", proves: ["build"],
    steps: {
      degree: "Bachelor of Technology, Electrical, Electronics and Communications Engineering, Vellore Institute of Technology (2022–2026)",
      firstJob: "Embedded System Intern, Defence Research and Development Organisation (2024)",
      bridge: "An embedded software engineering internship, converted into a full-time role",
      now: "Engineer, Tata Consultancy Services, Hyderabad",
    },
    skills: ["Embedded Systems", "Embedded Software"],
    story: "Renu studied Electrical, Electronics and Communications Engineering at Vellore Institute of Technology, with an embedded systems internship at the Defence Research and Development Organisation. She moved into an embedded software engineering internship and then a full-time Engineer role at Tata Consultancy Services.",
    status: "Early career",
  },
  {
    id: "24", name: "Shalini Maruthiah", courses: ["btech_ece"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Electronics and Communications Engineering, Alliance University (2019–2023)",
      firstJob: "Project Intern, Ashok Leyland (2022)",
      bridge: "Straight from campus into an industrial plant role",
      now: "Maintenance Engineer, BASF Environmental Catalyst and Metal Solutions, India",
    },
    skills: ["Maintenance Engineering", "Industrial Systems"],
    story: "Shalini studied Electronics and Communications Engineering at Alliance University, with an internship at Ashok Leyland. She moved directly into industry as a Maintenance Engineer at BASF Environmental Catalyst and Metal Solutions.",
    status: "Employed",
  },
  {
    id: "25", name: "Priya Pandey", courses: ["btech_ece"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Electronics and Communications Engineering, Dr. A.P.J. Abdul Kalam Technical University (2010–2014)",
      firstJob: "Register Transfer Level Design Engineer, Numem",
      bridge: "Master of Technology in Very Large Scale Integration Design, Vellore Institute of Technology (2015–2017)",
      now: "Senior Design Engineer, Microchip Technology, United States",
    },
    skills: ["Very Large Scale Integration Design", "Register Transfer Level Design"],
    story: "Priya paired her Electronics and Communications Engineering degree with a Master of Technology in Very Large Scale Integration Design. She worked as a Register Transfer Level Design Engineer at Numem and is now a Senior Design Engineer at Microchip Technology, active in the Institute of Electrical and Electronics Engineers and the Society of Women Engineers.",
    status: "Employed",
  },
  {
    id: "27", name: "Praveen S Pillai", courses: ["btech_auto"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Automobile Engineering, Mahatma Gandhi University, Kerala (2012–2016)",
      firstJob: "Automotive Service Advisor, Honda Motor India (2016–2018)",
      bridge: "After-sales and warranty roles at Aston Martin dealerships in Dubai",
      now: "Warranty Administrator, Jaguar Land Rover, United Kingdom",
    },
    skills: ["After Sales", "Warranty", "Service"],
    story: "Praveen completed an Automobile Engineering degree and built an automotive after-sales and warranty career, from Honda Motor India to Aston Martin dealerships in Dubai, and now Warranty Administrator at Jaguar Land Rover in the United Kingdom.",
    status: "Employed",
  },
  {
    id: "28", name: "Ankith Sanjay Thampi", courses: ["btech_auto", "btech_mech"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Mechanical Engineering, Christ University (2017–2021)",
      firstJob: "Product Engineering Intern, Dometic (2023)",
      bridge: "Master of Science in Automotive Systems Engineering, University of Michigan-Dearborn (2022–2023), then validation work at Stellantis",
      now: "Vehicle Hardware Validation Engineer, Rivian, United States",
    },
    skills: ["Computer Aided Design", "Structural Validation", "Body in White"],
    story: "Ankith paired a Mechanical Engineering degree at Christ University with a Master of Science in Automotive Systems Engineering in the United States. Product and validation roles at Dometic and Stellantis led to a Vehicle Hardware Validation Engineer position at Rivian.",
    status: "Employed",
  },
  {
    id: "29", name: "Anoop Shetty", courses: ["btech_auto", "btech_mech"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor's degree, Mechanical Engineering, Ramaiah Institute of Technology (2015–2019)",
      firstJob: "Chassis Engineer and Fabrication Head, Stier Racing (2018–2019)",
      bridge: "Formula Student, then a Master's in Automotive and Motorsport Engineering, Brunel University of London (2020–2021)",
      now: "Senior Logistics Engineer, McLaren Automotive, United Kingdom",
    },
    skills: ["Motorsport", "Chassis Design", "Logistics Engineering"],
    story: "Anoop paired a Mechanical Engineering bachelor's with a Master's in Automotive and Motorsport Engineering at Brunel. A motorsport path through Formula Student and racing roles led to McLaren Automotive, where he progressed from Production Team Member to New Model and now Senior Logistics Engineer.",
    status: "Employed",
  },
  {
    id: "30", name: "Bidheyak Subedi", courses: ["btech_robotics", "btech_mech"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Mechanical Engineering, Sri Venkateswara College of Engineering and Technology (2013–2017)",
      firstJob: "Research Engineer, Hyundai Motor India Engineering (2017–2020)",
      bridge: "Master of Science in Mechatronics, Robotics and Automation Engineering, Universität Siegen (2020–2023), with a master's thesis at Aptiv",
      now: "Research Associate, Technische Hochschule Ingolstadt, Germany",
    },
    skills: ["Mechatronics", "Robotics", "Automotive Light Weight Design"],
    story: "Bidheyak moved from a Mechanical Engineering degree and a research role at Hyundai into a Master of Science in Mechatronics, Robotics and Automation Engineering in Germany. He combined a master's thesis at Aptiv with German research and development roles, and now works in mechatronics research at Technische Hochschule Ingolstadt.",
    status: "Employed",
  },
  {
    id: "31", name: "Vishnu Raveendran Nair", courses: ["btech_robotics", "btech_mech"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Mechanical Engineering, Mohandas College of Engineering and Technology (2007–2011)",
      firstJob: "Fulfilment Centre Associate, Amazon (2023–2024)",
      bridge: "Master of Science in Mechatronics and Robotics, University of Leeds (2022–2023), plus Lean Six Sigma",
      now: "Proxy Team Lead, Amazon, United Kingdom",
    },
    skills: ["Human Robot Interaction", "Lean Six Sigma", "Operations"],
    story: "Vishnu paired a Mechanical Engineering degree with a Master of Science in Mechatronics and Robotics at the University of Leeds. He applied human robot interaction and Lean methods inside Amazon operations in the United Kingdom, working with semi-automated robotic storage systems, and rose from Fulfilment Centre Associate to Proxy Team Lead.",
    status: "Employed",
  },
  {
    id: "32", name: "Bibin Babu", courses: ["btech_robotics", "btech_mech"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor's degree, Mechanical Engineering, Mahatma Gandhi University (2012–2016)",
      firstJob: "Programmer Analyst, Cognizant",
      bridge: "Post Graduate Diploma in Mechatronics, Robotics and Automation Engineering, Centennial College, Canada (2018–2020)",
      now: "Mechatronics and Robotics Technician, Amazon, Canada",
    },
    skills: ["Automation", "Robotics Maintenance"],
    story: "Bibin paired a Mechanical Engineering bachelor's with a Post Graduate Diploma in Mechatronics, Robotics and Automation Engineering in Canada. He worked across automation and robotics technician roles at Faurecia, Stargate Manufacturing, and now Amazon.",
    status: "Employed",
  },
  {
    id: "33", name: "Chaitanya Mehta", courses: ["btech_robotics", "btech_mech"], discipline: "tech_engg", proves: [],
    steps: {
      degree: "Bachelor of Technology, Mechanical Engineering, Indian Institute of Technology Indore (2016–2020)",
      firstJob: "Graduate Researcher, Laboratory for Intelligent Decision and Autonomous Robots, Georgia Institute of Technology (2022–2024)",
      bridge: "Master of Science in Robotics, Georgia Institute of Technology (2022–2024)",
      now: "Graduate Researcher, Georgia Institute of Technology, and Design Automation Engineer, TK Elevator",
    },
    skills: ["Robotics", "Robot Operating System", "Trajectory Optimization"],
    story: "Chaitanya paired a Mechanical Engineering degree at IIT Indore with a Master of Science in Robotics at Georgia Tech. His research covered visuo-tactile sensing and humanoid manipulation, including a modular gripper for the Digit humanoid robot, alongside a design automation role at TK Elevator.",
    status: "Early career",
  },
];
