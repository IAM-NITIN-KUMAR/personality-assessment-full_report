const React = require('react');
const { renderToFile, Font } = require('@react-pdf/renderer');
const path = require('path');

// Register premium custom fonts from local files for the Node test environment
const fontsDir = path.join(__dirname, '../public/fonts');

Font.register({
  family: "Outfit",
  src: path.join(fontsDir, "Outfit-Regular.ttf"),
});

Font.register({
  family: "Outfit-Bold",
  src: path.join(fontsDir, "Outfit-Bold.ttf"),
});

Font.register({
  family: "Outfit-ExtraBold",
  src: path.join(fontsDir, "Outfit-ExtraBold.ttf"),
});

Font.register({
  family: "PlusJakartaSans",
  src: path.join(fontsDir, "PlusJakartaSans-Regular.ttf"),
});

Font.register({
  family: "PlusJakartaSans-Bold",
  src: path.join(fontsDir, "PlusJakartaSans-Bold.ttf"),
});

Font.register({
  family: "PlusJakartaSans-Italic",
  src: path.join(fontsDir, "PlusJakartaSans-Italic.ttf"),
});

Font.register({
  family: "JetBrainsMono",
  src: path.join(fontsDir, "JetBrainsMono-Regular.ttf"),
});

Font.register({
  family: "JetBrainsMono-Bold",
  src: path.join(fontsDir, "JetBrainsMono-Bold.ttf"),
});

// Mock a minimal data structure matching ReportData
const mockData = {
  profile: {
    name: "Riya Mehta",
    email: "riya@example.com",
    discipline: "tech_cs",
    course: "bca",
  },
  archetype: {
    name: "The Builder",
    tagline: "You build systems, products, and solutions.",
    description: "You thrive when converting ideas into tangible, working systems.",
    scores: [
      { dimension: "decision_style", raw: 5, normalized: 50 },
      { dimension: "energy", raw: -2, normalized: -20 },
      { dimension: "structure", raw: 8, normalized: 80 },
      { dimension: "risk", raw: 4, normalized: 40 },
      { dimension: "social", raw: -3, normalized: -30 },
      { dimension: "drive", raw: 6, normalized: 60 },
    ],
  },
  context: {
    budget: "10L-15L",
    budgetTag: "budget:10-15",
    geographies: ["region:northamerica"],
    family: "Full support",
    familyTag: "family:free",
    tier: "Tier 1",
    tierTag: "tier:1",
    timeline: "1 year",
    timelineTag: "tl:1y",
    dream: "Software engineer at Google",
  },
  rootsReadout: [
    { dimension: "decision_style", value: 50, sentence: "You make decisions carefully." },
    { dimension: "energy", value: -20, sentence: "You prefer quiet work." },
    { dimension: "structure", value: 80, sentence: "You like structure." },
    { dimension: "risk", value: 40, sentence: "You take calculated risks." },
    { dimension: "social", value: -30, sentence: "You work well alone." },
    { dimension: "drive", value: 60, sentence: "You are driven." },
  ],
  routesClusters: [],
  engagement: {
    score: 2,
    level: "High",
    message: "Great job",
  },
  stats: [
    { key: "strength-0", section: "self", label: "Strength 0", value: "Coding", detail: "You code well" },
    { key: "strength-1", section: "self", label: "Strength 1", value: "Logic", detail: "You logic well" },
    { key: "strength-2", section: "self", label: "Strength 2", value: "Math", detail: "You math well" },
    { key: "hidden-talent", section: "self", label: "Hidden Talent", value: "Design", detail: "You design well" },
  ],
  niches: [],
  workPreferences: [
    { key: "p1", label: "Pref 1", detail: "Detail 1", level: "Strong", score: 80 },
  ],
  workAptitudes: [
    { key: "a1", label: "Apt 1", detail: "Detail 1", score: 85 },
  ],
  environmentFit: [
    { key: "env_1", description: "Env 1", fit: "Enhanced", score: 80 },
  ],
  careerTraits: [],
  measurementCount: 10,
  matchScore: 90,
  coreThemes: ["Code", "Logic"],
  archetypeQuote: { text: "To be or not to be", attribution: "Shakespeare" },
  drivers: [
    { key: "d1", category: "Category 1", label: "Driver 1", description: "Desc 1" }
  ],
  futureDay: { narrative: "Future narrative" },
  topDegrees: [
    { title: "BCA", match: 95, why: "Why BCA", insight: "Insight BCA" }
  ],
  alternativeDegrees: [
    { title: "BSc CS", match: 85, why: "Why BSc CS", insight: "Insight BSc CS" }
  ],
  commonCareerPaths: [
    { role: "Software Engineer", percentage: 40 }
  ],
  sharedInterests: ["Hacking", "Gaming"],
  parentLetter: {
    greeting: "Hello parents",
    paragraphs: ["Para 1"],
    signoff: "Thanks,\nTeam"
  }
};

// We import the compiled ReportDocument component
const { ReportDocument } = require('../lib/report-pdf');

async function test() {
  try {
    const doc = React.createElement(ReportDocument, { data: mockData });
    const outputPath = 'C:\\Users\\Nitin Kumar\\Downloads\\roots-and-routes-report.pdf';
    console.log(`Rendering PDF to ${outputPath}...`);
    await renderToFile(doc, outputPath);
    console.log('PDF rendered and written to Downloads successfully!');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

test();
