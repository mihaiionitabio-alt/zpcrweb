(c){
    const L=c.run.eds&&c.run.eds.log;if(!L||!L.temps.length)return {svg:svgMessage("This graph uses the QuantStudio instrument log. For a LightCycler run choose “Block temperature trace (LightCycler temperature log)”."),rows:[]};
    const t0=L.temps[0][0],step=Math.max(1,Math.floor(L.temps.length/1500)),pts=L.temps.filter((_,i)=>i%step===0);
    const m=t=>(t[0]-t0)/60000;
    const series=[{type:"line",colour:"#2563eb",data:pts.map(t=>[m(t),t[1]]),tip:"sample block"},{type:"line",colour:"#d97706",data:pts.map(t=>[m(t),t[2]]),tip:"cover"},
      {type:"line",colour:"#7c3aed",data:pts.map(t=>[m(t),t[4]*10]),tip:"zone spread ×10"}];
    return {svg:svgPlot({title:runName(c.run),x:[0,m(L.temps[L.temps.length-1])],y:[0,110],xlab:"Minutes from the first log record",ylab:"°C",series,
      hlines:[{y:sopNum(SOP.run.maxZoneSpread)*10,label:`SOP zone spread ${SOP.run.maxZoneSpread} °C (×10)`,colour:"#7c3aed"}],
      legend:[{label:"sample block",colour:"#2563eb"},{label:"heated cover",colour:"#d97706"},{label:"zone spread ×10",colour:"#7c3aed"}]}),
      rows:L.temps.map(t=>({time:sopFmtTime(t[0]),minutes:+m(t).toFixed(3),block_C:t[1],cover_C:t[2],heatsink_C:t[3],zone_spread_C:t[4]}))};
  }