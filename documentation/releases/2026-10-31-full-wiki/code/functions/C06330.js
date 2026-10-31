(){
    const all=gByDate(sopEvaluateAll(),e=>e.run),tk=gRunTicks(all.map(e=>e.run));if(!all.length)return {svg:svgMessage("No runs."),rows:[]};
    const outs=SOP_OUTCOMES.filter(o=>all.some(e=>e.rows.some(r=>r.outcome===o))),base=all.map(()=>0),series=[],rows=[];
    outs.forEach(o=>{series.push({type:"bar",colour:sopColour(o),barWidth:Math.max(3,Math.min(40,700/all.length)),data:all.map((e,i)=>{const n=e.rows.filter(r=>r.outcome===o).length;const p=[i,base[i]+n,base[i],`${runName(e.run)}: ${n} ${sopLabel(o)}`,sopColour(o)];base[i]+=n;if(n)rows.push({experiment:runName(e.run),outcome:o,count:n});return p;}).filter(p=>p[1]>p[2])});});
    return {svg:svgPlot({title:"Outcomes per run",x:[-0.6,all.length-0.4],y:[0,Math.max(...base,1)*1.08],
      xticks:tk.xticks,bottom:tk.bottom,xlab:tk.xlab,
      ylab:"Results",series,legend:outs.map(o=>({label:sopLabel(o),colour:sopColour(o)}))}),rows};
  }