function overviewPlot(g){
 const roles=byKey(g.points,p=>p.role),colours=new Map(),series=[],rows=[],xticks=RUNS.map((r,i)=>({v:i+1,label:'R'+(i+1)}));
 for(const [role,pts]of roles){const colour=catColour(colours,role);series.push({type:'points',r:3,colour,data:pts.map((p,i)=>[p.run_index+((i%13)-6)*.024,p.value,p.filename+' | '+p.well+' | '+p.sample+' | '+role])});
  const medians=[...byKey(pts,p=>p.run_index)].map(([ri,a])=>[ri,median(a.map(p=>p.value)),role+' median; R'+ri]);series.push({type:'points',r:6,colour,data:medians});
  for(const p of pts)rows.push({run:'R'+p.run_index,filename:p.filename,well:p.well,sample:p.sample,role:p.role,Cq:p.value,basis:g.basis});
 }
 return {svg:svgPlot({width:1000,height:560,title:g.id+' - '+g.target+' - '+g.basis,x:[.5,RUNS.length+.5],y:extent(g.points.map(p=>p.value)),xticks,xlab:'Loaded run; full filenames in the source manifest',ylab:'Cq (cycles)',series,legend:legendFromMap(colours)}),rows};
}