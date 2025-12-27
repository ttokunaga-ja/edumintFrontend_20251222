#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach((f) => {
    const fp = path.join(dir, f);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) {
      walk(fp, filelist);
    } else if (/\.(tsx|jsx|ts|js)$/.test(fp)) {
      filelist.push(fp);
    }
  });
  return filelist;
}

function extractClassNames(code) {
  const results = [];
  // match className="..." or className='...' or className={`...`} or className={"..."}
  const regex = /className\s*=\s*(?:`([^`]+)`|"([^"]+)"|'([^']+)'|\{`([^`]+)`\})/g;
  let m;
  while ((m = regex.exec(code))) {
    const val = m[1] || m[2] || m[3] || m[4];
    if (val) results.push(val.trim());
  }
  return results;
}

const root = path.resolve(process.cwd(), 'src');
const files = walk(root);
const report = { generatedAt: new Date().toISOString(), files: [], tokens: {} };

files.forEach((fp) => {
  const code = fs.readFileSync(fp, 'utf8');
  const classVals = extractClassNames(code);
  if (classVals.length) {
    const classTokensSets = classVals.map((s) => s.split(/\s+/).filter(Boolean));
    report.files.push({ path: path.relative(process.cwd(), fp), classValues: classVals, tokenSets: classTokensSets });
    classTokensSets.forEach((tokens) => {
      tokens.forEach((t) => {
        report.tokens[t] = (report.tokens[t] || 0) + 1;
      });
    });
  }
});

const outDir = path.resolve(process.cwd(), 'scripts', 'reports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'tailwind-inventory.json'), JSON.stringify(report, null, 2));
console.log('Inventory written to scripts/reports/tailwind-inventory.json');
