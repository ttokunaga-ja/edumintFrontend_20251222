#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'src');
const exts = ['.tsx', '.ts', '.jsx', '.js', '.css', '.snap', '.json', '.html'];

const tokens = ['className','cls','cn','bg-','text-','flex','grid','gap-','rounded','hover:','md:','sm:','dark:','sr-','prose','min-h-screen','opacity-','fill-','stroke-','pointer-events-none','aria-'];

function walk(dir, cb) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, cb);
    else if (exts.includes(path.extname(full))) cb(full);
  }
}

function containsToken(s) {
  for (const t of tokens) if (s.includes(t)) return true;
  return false;
}

let files=0, changed=0;
walk(root, (file) => {
  files++;
  try {
    let src = fs.readFileSync(file,'utf8');
    let orig = src;

    // Remove token substrings everywhere
    for (const t of tokens) {
      const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'g');
      src = src.replace(re, '');
    }

    // Additionally remove class="..." or class='...' attributes fully
    src = src.replace(/\bclass\s*=\s*"[^"]*"/g, '');
    src = src.replace(/\bclass\s*=\s*'[^']*'/g, '');

    // Remove empty selectors like ". {" or ".\n" left in CSS (simple cleanup)
    src = src.replace(/^[\t ]*\.[^{\n]+\{[^}]*\}/mg, '');

    // Remove empty attribute placeholders left like id="" or classMap: "" where it was created inadvertently
    src = src.replace(/:\s*""/g, ': undefined');

    if (src !== orig) { fs.writeFileSync(file, src,'utf8'); changed++; }
  } catch (e) { console.error('ERROR', file, e); }
});

// Delete tailwind/postcss config files if they exist in repo root or config folders
const cwd = path.resolve(__dirname, '..');
['tailwind.config.js','tailwind.config.cjs','tailwind.config.ts','postcss.config.js','postcss.config.cjs','postcss.config.ts'].forEach(f => {
  const p = path.join(cwd, f);
  if (fs.existsSync(p)) { try { fs.unlinkSync(p); console.log('deleted', p); } catch(e){} }
});

console.log(`Done. Files scanned: ${files}. Files changed: ${changed}`);
process.exit(0);
