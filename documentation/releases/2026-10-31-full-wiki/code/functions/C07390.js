f=>{
    const original=String(f.name),dot=original.lastIndexOf("."),stem=dot>0?original.slice(0,dot):original,ext=dot>0?original.slice(dot):"";
    let name=original,n=2;while(used.has(name))name=stem+"_"+(n++)+ext;
    used.add(name);entries.push({name,data:f.data});
  }