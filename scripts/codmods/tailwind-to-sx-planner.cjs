#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const mapping = require('./mapping.json');

function readInventory(invPath) {
  return JSON.parse(fs.readFileSync(invPath, 'utf8'));
}

function matchTokens(tokens) {
  const matched = {};
  mapping.mappings.forEach((m) => {
    m.match.forEach((tk) => {
      if (tokens.includes(tk)) {
        matched[tk] = m.sx;
      }
    });
  });
  return matched;
}

function plan(inventoryPath) {
  const inv = readInventory(inventoryPath);
  const report = { suggestions: [] };
  inv.files.forEach((f) => {
    f.tokenSets.forEach((set) => {
      const matches = matchTokens(set);
      if (Object.keys(matches).length > 0) {
        report.suggestions.push({ file: f.path, classSet: set, matches });
      }
    });
  });
  const out = path.resolve(process.cwd(), 'scripts', 'reports', 'tailwind-codemod-suggestions.json');
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log('Wrote suggestions to', out);
}

const args = process.argv.slice(2);
const inv = args[0] || path.resolve(process.cwd(), 'scripts', 'reports', 'tailwind-inventory.json');
if (!fs.existsSync(inv)) {
  console.error('Inventory not found:', inv);
  process.exit(1);
}
plan(inv);
