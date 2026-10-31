(c){
    const items=[...ssWells(c.run).filter(w=>w.curve&&w.curve.length).map(w=>({w,key:w.filterComb||w.target||String(w.channel),outside:false})),
      ...orphanCurveCandidates(c.run).filter(w=>ssPositionIncluded(c.run,w.pos)).map(o=>({w:o,key:o.filterComb||o.filterName||String(o.channel),outside:true}))];
    const seen=new Set(),uniqItems=items.filter(i=>{const k=`${i.key}|${i.w.pos}`;if(seen.has(k))return false;seen.add(k);return true;});
    if(!uniqItems.length)return {svg:svgMessage("No curves."),rows:[]};
    const keys=uniq(uniqItems.map(i=>i.key)),rows=[];
    const bg=[],end=[];
    uniqItems.forEach((i,k)=>{const s=wellSignal(i.w.curve),x=keys.indexOf(i.key),j=((k*29)%19-9)/60;
      bg.push([x-0.18+j,s.background,graphHoverLabel(c.run,i.w,`background ${num(s.background,1)}${i.outside?" (outside analyses)":""}`),i.outside?"#f59e0b":"#60a5fa"]);
      end.push([x+0.18+j,s.end,graphHoverLabel(c.run,i.w,`end ${num(s.end,1)}${i.outside?" (outside analyses)":""}`),i.outside?"#b45309":"#1d4ed8"]);
      rows.push({channel:i.key,well:i.w.well,sample:i.w.sample||"",outside_analyses:i.outside?"yes":"",background:s.background,end_fluorescence:s.end,amplitude:s.amplitude});});
    const all=bg.concat(end).map(p=>p[1]).filter(v=>v>0);
    return {svg:svgPlot({title:runName(c.run),x:[-0.6,keys.length-0.4],y:[Math.max(1e-3,Math.min(...all)*0.8),Math.max(...all)*1.3],ylog:true,
      xticks:keys.map((k,i)=>({v:i,label:k})),xlab:"Channel / target",ylab:"Fluorescence (log scale)",
      series:[{type:"points",data:bg,r:3},{type:"points",data:end,r:3}],
      legend:[{label:"background",colour:"#60a5fa"},{label:"end point",colour:"#1d4ed8"},{label:"outside analyses",colour:"#f59e0b"}]}),rows};
  }