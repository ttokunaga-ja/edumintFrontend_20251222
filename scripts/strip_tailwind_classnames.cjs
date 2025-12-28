const fs = require('fs');
const path = require('path');

function walk(dir){
  let res=[];
  for(const f of fs.readdirSync(dir)){
    const p=path.join(dir,f);
    const s=fs.statSync(p);
    if(s.isDirectory()) res=res.concat(walk(p));
    else if(p.endsWith('.tsx') || p.endsWith('.ts') || p.endsWith('.jsx') || p.endsWith('.js')) res.push(p);
  }
  return res;
}

const files = walk(path.join(__dirname,'..','src'));
let changes=0;
for(const f of files){
  let src=fs.readFileSync(f,'utf8');
  let orig = src;

  // Remove git conflict markers
  src = src.replace(/^<<<<<<<.*$/gm, '');
  src = src.replace(/^=======$/gm, '');
  src = src.replace(/^>>>>>>>.*$/gm, '');

  // Remove className={`...`} (template literal) - non-greedy across lines
  src = src.replace(/className=\{`[\s\S]*?`\}/g, '');

  // Remove className={cn(...)} or className={twMerge(...)} or className={merge(...)} etc.
  src = src.replace(/className=\{\s*[A-Za-z0-9_$.]+\([^}]*\)\s*\}/g, '');

  // Remove className={'...'} and className={"..."}
  src = src.replace(/className=\{\s*['\"][^'}\"]*['\"]\s*\}/g, '');

  // Remove simple className="..."
  src = src.replace(/className=\"[^\"]*\"/g, '');

  // Remove simple className='...'
  src = src.replace(/className=\'[^\']*\'/g, '');

  if(src !== orig){
    fs.writeFileSync(f, src, 'utf8');
    console.log('Stripped className in', f);
    changes++;
  }
}
console.log('Total files modified:', changes);
process.exit(0);
