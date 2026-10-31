(c){
    const ev=sopEvaluateAll()[c.ri];const rs=ev.rows.filter(r=>(r.spec.kind==="ic"||r.spec.kind==="reference")&&!r.ctrl&&r.role!=="Standard");
    if(!rs.length)return {svg:svgMessage("No target is marked as internal control or reference in the SOP (section 2)."),rows:[]};
    const cm=new Map(),samples=uniq(rs.map(r=>r.sample)),targets=uniq(rs.map(r=>r.target));
    const series=targets.map(t=>({type:"points",colour:catColour(cm,t),r:4.5,data:rs.filter(r=>r.target===t).map(r=>[samples.indexOf(r.sample),Number.isFinite(r.cqMean)?r.cqMean:NaN,graphHoverLabel(c.run,{well:r.wells&&r.wells[0]&&r.wells[0].well,sample:r.sample},`${t} · ${num(r.cqMean,2)} · ${r.label}`)])}));
    const med=byKey(rs,r=>r.target),bands=[],hl=[];
    med.forEach((list,t)=>{const v=list.map(r=>r.cqMean).filter(Number.isFinite).sort((a,b)=>a-b);if(!v.length)return;const m=v[Math.floor(v.length/2)];
      hl.push({y:m,label:`${t} median ${num(m,2)}`,colour:cm.get(t)});
      if(Number.isFinite(sopNum(SOP.ic.maxShift)))hl.push({y:m+sopNum(SOP.ic.maxShift),label:`${t} +${SOP.ic.maxShift}`,colour:"#b91c1c"});});
    const miss=rs.filter(r=>!Number.isFinite(r.cqMean));
    return {svg:svgPlot({title:runName(c.run)+(miss.length?` — ${miss.length} not detected`:""),x:[-0.7,samples.length-0.3],y:extent(rs.map(r=>r.cqMean).concat(hl.map(h=>h.y)),0.1),
      xticks:samples.length<=40?samples.map((s,i)=>({v:i,label:s.slice(0,14),rotate:-40,anchor:"end"})):[],bottom:samples.length<=40?110:50,
      xlab:samples.length<=40?"":"Samples",ylab:"Mean Cq",series,hlines:hl,legend:legendFromMap(cm)}),
      rows:rs.map(r=>({sample:r.sample,target:r.target,cq_mean:r.cqMean,detected:r.det,n:r.n,run_median:ev.icMedian,outcome:r.outcome}))};
  }