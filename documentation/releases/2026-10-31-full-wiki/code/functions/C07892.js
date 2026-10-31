()=>{const s=REVIEW_STATE.controlSeries.find(x=>x.key===$("#lj-series").value);
    if(s)download(safeName(`${s.sample}_${s.target}`)+"_levey_jennings.csv",
      toCSV(Object.keys(s.points[0]||{}).map(k=>({key:k,label:k})),s.points),"text/csv");}