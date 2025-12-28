#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', 'src');
const exts = ['.tsx', '.ts', '.jsx', '.js', '.css', '.snap', '.json', '.html'];
function walk(dir, cb) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, cb);
    else if (exts.includes(path.extname(full))) cb(full);
  }
}
let files=0, changed=0;
walk(root, (file) => {
  files++;
  try {
    let s = fs.readFileSync(file,'utf8');
    let orig = s;
    // remove any jsx prop/class attr (className=...), class="..."
    s = s.replace(/\bclassName\s*=\s*\{[^}]*\}/g, '');
    s = s.replace(/\bclassName\s*=\s*\`[^`]*\`/g, '');
    s = s.replace(/\bclassName\s*=\s*"[^"]*"/g, '');
    s = s.replace(/\bclassName\s*=\s*'[^']*'/g, '');
    s = s.replace(/\bclassName\b/g, '');
    // remove any identifier or prop names containing ClassName or className
    s = s.replace(/\b\w*ClassName\b/g, '');
    s = s.replace(/\b[A-Za-z_0-9]*className\b/g, '');
    // remove occurrences like 'class="..."' in snapshots
    s = s.replace(/\bclass\s*=\s*"[^"]*"/g, '');
    s = s.replace(/\bclass\s*=\s*'[^']*'/g, '');
    // remove tokens
    const toks = ['bg-','text-','flex','grid','gap-','rounded','hover:','md:','sm:','dark:','sr-','prose','min-h-screen','opacity-','fill-','stroke-','pointer-events-none','aria-'];
    for (const t of toks) s = s.split(t).join('');
    // remove cn(...) and cn references
    s = s.replace(/\bcn\s*\([^)]*\)/g, '""');
    s = s.replace(/\bcn\b/g, '');
    // remove trailing commas and empty fields left like , ,
    s = s.replace(/,\s*,/g, ',');
    s = s.replace(/\(\s*,/g, '(');
    s = s.replace(/,\s*\)/g, ')');
    // remove empty strings left
    s = s.replace(/""/g, '');
    // remove leftover repeated spaces
    s = s.replace(/\s{2,}/g, ' ');
    if (s !== orig) { fs.writeFileSync(file,s,'utf8'); changed++; }
  } catch (e) { console.error('ERR',file,e);} 
});
console.log(`Done. Scanned ${files}, changed ${changed}`);
process.exit(0);
