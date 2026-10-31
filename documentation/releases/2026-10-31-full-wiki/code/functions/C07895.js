()=>{const s=REVIEW_STATE.controlSeries.find(x=>x.key===$("#lj-series").value);
    if(s)downloadCanvas($("#lj-chart"),safeName(`${s.sample}_${s.target}`)+"_levey_jennings.png");}