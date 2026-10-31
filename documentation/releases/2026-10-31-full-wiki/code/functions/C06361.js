(){
    const med=a=>{const v=a.filter(Number.isFinite).sort((x,y)=>x-y);return v.length?v[Math.floor(v.length/2)]:NaN;};
    const rows=[],cm=new Map(),byCh=new Map();
    const RR=gByDate(RUNS,r=>r),tk=gRunTicks(RR);
    RR.forEach((r,i)=>{const g=byKey(ssWells(r).filter(w=>w.curve&&w.curve.length),w=>w.filterComb||w.target||String(w.channel));
      g.forEach((ws,ch)=>{const seen=new Set(),sig=ws.filter(w=>!seen.has(w.pos)&&seen.add(w.pos)).map(w=>wellSignal(w.curve));
        const row={experiment:runName(r),channel:ch,median_background:med(sig.map(s=>s.background)),median_end:med(sig.map(s=>s.end)),wells:sig.length};rows.push(row);
        if(!byCh.has(ch))byCh.set(ch,[]);byCh.get(ch).push([i,row.median_background,row.median_end]);});});
    if(!rows.length)return {svg:svgMessage("No curves."),rows:[]};
    const series=[];byCh.forEach((pts,ch)=>{const col=catColour(cm,ch);
      series.push({type:"line",colour:col,dash:"4 3",data:pts.map(p=>[p[0],p[1]]),tip:ch+" background"});
      series.push({type:"line",colour:col,width:2,data:pts.map(p=>[p[0],p[2]]),tip:ch+" end point"});
      series.push({type:"points",colour:col,data:pts.map(p=>[p[0],p[2],`${ch} end ${num(p[2],0)}`])});});
    const all=rows.flatMap(r=>[r.median_background,r.median_end]).filter(v=>v>0);
    return {svg:svgPlot({title:"Solid: end point · dashed: background",x:[-0.6,RR.length-0.4],y:[Math.min(...all)*0.7,Math.max(...all)*1.4],ylog:true,
      xticks:tk.xticks,bottom:tk.bottom,xlab:tk.xlab,
      ylab:"Median fluorescence (log)",series,legend:legendFromMap(cm)}),rows};
  }