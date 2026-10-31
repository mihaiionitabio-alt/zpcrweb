(x,k)=>{const y=rs.length-k;
      if(Number.isFinite(x.T.lastEdit))series.push({type:"line",colour:"#fca5a5",dash:"3 3",data:[[D(Number.isFinite(x.T.end)?x.T.end:x.T.start),y],[D(x.T.lastEdit),y]]});
      series.push({type:"points",colour:"#16a34a",r:7,data:[[D(x.T.start),y,`${runName(x.r)} run ${sopFmtTime(x.T.start)} – ${sopFmtTime(x.T.end)}`]]});
      if(Number.isFinite(x.T.created))series.push({type:"points",colour:"#2563eb",r:3.5,data:[[D(x.T.created),y+0.18,`created ${sopFmtTime(x.T.created)}`]]});
      if(Number.isFinite(x.T.lastEdit))series.push({type:"points",colour:"#dc2626",r:3.5,data:[[D(x.T.lastEdit),y-0.18,`last change ${sopFmtTime(x.T.lastEdit)} (+${num(x.T.editDelayH,1)} h)`]]});
      rows.push({experiment:runName(x.r),created:sopFmtTime(x.T.created),run_start:sopFmtTime(x.T.start),run_end:sopFmtTime(x.T.end),last_change:sopFmtTime(x.T.lastEdit),hours_to_last_change:x.T.editDelayH,run_minutes:x.T.durationMin});}