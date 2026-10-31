(g,i)=>({
    key:g.key,analysis:g.name,
    file:`${safeName(run.meta.name||run.file)}${multi?"_"+String(i+1).padStart(2,"0")+"_"+safeName(g.name||"analysis"):""}.rdes.tsv`,
    data:makeRDES(run,g.key)
  })