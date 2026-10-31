(c){
    const ev=sopEvaluateAll()[c.ri];const ts=uniq(ev.rows.map(r=>r.target));
    if(!ts.length)return {svg:svgMessage("No results."),rows:[]};
    const outs=SOP_OUTCOMES.filter(o=>ev.rows.some(r=>r.outcome===o)),series=[],rows=[];
    const base=ts.map(()=>0);
    outs.forEach(o=>{const data=ts.map((t,i)=>{const n=ev.rows.filter(r=>r.target===t&&r.outcome===o).length;const p=[i,base[i]+n,base[i],`${t}: ${n} ${sopLabel(o)}`,sopColour(o)];base[i]+=n;if(n)rows.push({target:t,outcome:o,count:n});return p;}).filter(p=>p[1]>p[2]);
      series.push({type:"bar",colour:sopColour(o),barWidth:Math.min(60,600/ts.length),data});});
    return {svg:svgPlot({title:`${runName(c.run)} — run ${ev.status}`,x:[-0.6,ts.length-0.4],y:[0,Math.max(...base)*1.1||1],xticks:ts.map((t,i)=>({v:i,label:t.slice(0,16)})),
      xlab:"Target",ylab:"Results",series,legend:outs.map(o=>({label:sopLabel(o),colour:sopColour(o)}))}),rows};
  }