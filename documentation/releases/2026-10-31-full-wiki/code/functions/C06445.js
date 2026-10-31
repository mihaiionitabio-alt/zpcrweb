g=>{
    const targets=[""];
    const controls=(g.opts||[]).includes("control")
      ?SOP.controls.map((x,i)=>({i,x})).filter(({x})=>x.expect==="positive")
      :[{i:0,x:null}];
    targets.forEach(t=>controls.forEach(({i,x})=>{try{
      const c={g,ri,run:RUNS[ri],target:t,metric:"outcome",signal:"stored",log:false,colourby:"outcome",level:"end",control:String(i)};
      const suffix=x?"_"+safeName(x.name||x.match||String(i)):"";
      const res=g.render(c);const base=(g.scope==="run"?"run_":"all_runs_")+g.id+suffix;
      entries.push({name:base+".svg",data:res.svg});
      if(res.rows&&res.rows.length)entries.push({name:base+".csv",data:csvOf(res.rows)});
    }catch(e){entries.push({name:g.id+"_error.txt",data:String(e.message)});}}));
  }