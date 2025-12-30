import fs from 'fs/promises';
import path from 'path';

const repoRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..', '..');
const projectRoot = repoRoot.replace(/^\/(.:)/, '$1'); // Windows path fix

const targets = [
  { id: 'src_components_common', path: 'src/components/common', md: 'docs/F_ARCHITECTURE/F1_ARCHITECTURE_INDEX_src_components_common.md' },
  { id: 'src_components_generation', path: 'src/components/generation', md: 'docs/F_ARCHITECTURE/F1_ARCHITECTURE_INDEX_src_components_generation.md' },
  { id: 'src_components_page', path: 'src/components/page', md: 'docs/F_ARCHITECTURE/F1_ARCHITECTURE_INDEX_src_components_page.md' },
  { id: 'src_components_primitives_a-f', path: 'src/components/primitives', md: 'docs/F_ARCHITECTURE/F1_ARCHITECTURE_INDEX_src_components_primitives_a-f.md', split: 'a-f' },
  { id: 'src_components_primitives_o-z', path: 'src/components/primitives', md: 'docs/F_ARCHITECTURE/F1_ARCHITECTURE_INDEX_src_components_primitives_o-z.md', split: 'o-z' },
  { id: 'src_components_problemTypes', path: 'src/components/problemTypes', md: 'docs/F_ARCHITECTURE/F1_ARCHITECTURE_INDEX_src_components_problemTypes.md' },
  { id: 'src_pages', path: 'src/pages', md: 'docs/F_ARCHITECTURE/F2_ARCHITECTURE_INDEX_src_pages.md' },
  { id: 'src_features', path: 'src/features', md: 'docs/F_ARCHITECTURE/F3_ARCHITECTURE_INDEX_src_features.md' },
  { id: 'src_services_api', path: 'src/services/api', md: 'docs/F_ARCHITECTURE/F4_ARCHITECTURE_INDEX_src_services_api.md' },
  { id: 'src_shared_utils', path: 'src/shared/utils', md: 'docs/F_ARCHITECTURE/F5_ARCHITECTURE_INDEX_src_shared_utils.md' },
];

async function listFiles(relPath) {
  const abs = path.join(process.cwd(), relPath);
  try {
    const res = [];
    async function walk(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) await walk(p);
        else res.push(path.relative(process.cwd(), p));
      }
    }
    await walk(abs);
    return res;
  } catch (e) {
    return [];
  }
}

async function updateMdFrontmatter(mdPath, data) {
  try {
    const content = await fs.readFile(mdPath, 'utf8');
    const newContent = content
      .replace(/file_count: .*\n/, `file_count: ${data.file_count}\n`)
      .replace(/last_updated: .*\n/, `last_updated: "${data.last_updated}"\n`);
    if (newContent !== content) await fs.writeFile(mdPath, newContent, 'utf8');
  } catch (e) {
    // ignore
  }
}

async function main() {
  const index = [];
  for (const t of targets) {
    const files = await listFiles(t.path);
    let entryPoints = files.slice(0, 6);
    if (t.split === 'a-f') {
      entryPoints = files.filter(f => path.basename(f)[0].toLowerCase() >= 'a' && path.basename(f)[0].toLowerCase() <= 'f').slice(0, 30);
    }
    if (t.split === 'o-z') {
      entryPoints = files.filter(f => path.basename(f)[0].toLowerCase() >= 'o' && path.basename(f)[0].toLowerCase() <= 'z').slice(0, 30);
    }
    const obj = {
      id: t.id,
      name: t.path,
      path: t.path,
      file_count: files.length,
      entry_points: entryPoints,
      last_updated: new Date().toISOString().split('T')[0]
    };
    index.push(obj);

    if (t.md) await updateMdFrontmatter(t.md, obj);
  }

  const outPath = 'docs/F_ARCHITECTURE/index.json';
  await fs.writeFile(outPath, JSON.stringify({ generated_at: new Date().toISOString(), index }, null, 2), 'utf8');

  // update F0 last_updated
  try {
    const f0 = 'docs/F_ARCHITECTURE/F0_ARCHITECTURE_INDEX_ALL.md';
    const f0c = await fs.readFile(f0, 'utf8');
    const newF0 = f0c.replace(/last_updated: ".*"/g, `last_updated: "${new Date().toISOString().split('T')[0]}"`);
    if (newF0 !== f0c) await fs.writeFile(f0, newF0, 'utf8');
  } catch (e) {}

  console.log('Generated docs/F_ARCHITECTURE/index.json');
}

main().catch(err => { console.error(err); process.exit(1); });
