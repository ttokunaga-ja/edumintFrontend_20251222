const fs = require('fs');
const path = require('path');

function walk(dir){
  let res=[];
  for(const f of fs.readdirSync(dir)){
    const p=path.join(dir,f);
    const s=fs.statSync(p);
    if(s.isDirectory()) res=res.concat(walk(p));
    else if(p.endsWith('.tsx')) res.push(p);
  }
  return res;
}

const files=walk(path.join(__dirname,'..','src'));
let changed=0;
for(const f of files){
  let src=fs.readFileSync(f,'utf8');
  const newSrc = src.replace(/(^\s*)\}\s*>/gm, (m,indent)=>{
    changed++;
    return indent+"}} >";
  });
  if(newSrc!==src){
    fs.writeFileSync(f,newSrc,'utf8');
    console.log('Fixed',f);
  }
}
console.log('Total files fixed:', changed);
