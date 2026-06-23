const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../lib/report-pdf.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('careertrait')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
