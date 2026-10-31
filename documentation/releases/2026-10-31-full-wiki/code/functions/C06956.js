(c){const L=c.run&&c.run.cc&&c.run.cc.log;if(!L)return {svg:svgMessage("This file has no LightCycler temperature log (QuantStudio files: use the block temperature graph above)."),rows:[]};
    const sp=ccSetpoints(c.run);
    return {svg:svgPlot({title:runName(c.run),x:[0,L.seconds[L.seconds.length-1]/60],y:[Math.min(...L.temp)-3,Math.max(...L.temp)+3],xlab:"Minutes from the start of the log",ylab:"°C",right:62,hlabelsOutside:true,
      series:[{type:"line",colour:"#2563eb",width:1,data:L.seconds.map((s,i)=>[s/60,L.temp[i]])}],hlines:sp.map(s=>({y:s,label:`${s} °C`,colour:"#6b7280",dash:"2 3"}))}),
      rows:L.seconds.map((s,i)=>({seconds:s,block_C:L.temp[i]}))};}