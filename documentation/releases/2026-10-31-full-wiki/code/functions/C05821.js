c=>{
    if(!(Number(c.minPerRun)>0))return;
    const present=uniq(wells.filter(w=>sopControlSpec(w)===c).map(w=>w.pos)).length;
    add(`Control present — ${c.name}`,R.controlsMissing,present>=Number(c.minPerRun),`${present} well(s); SOP requires ${c.minPerRun}`);
  }