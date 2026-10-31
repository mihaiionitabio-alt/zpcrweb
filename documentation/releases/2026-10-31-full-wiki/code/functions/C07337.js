(v,i)=>lines.push([sourceUidOf(run),sourceCRCOf(run),run.meta.name||run.file,w.well,w.sample,w.target,w.analysis,w.channel,
      w.filterComb,w.role,w.instrType,Number.isFinite(w.replicateOf)?w.replicateOf+1:"",
      w.CpRaw??"",w.call,i+1,v].join("\t"))