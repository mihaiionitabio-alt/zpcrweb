function ixMount(box,specs,on){
  ixPurge();
  if(!box)return false;
  const old=box.querySelector(".ix-svg-hold");
  if(old){while(old.firstChild)box.insertBefore(old.firstChild,old);old.remove();}
  box.querySelectorAll(".ix-plot").forEach(el=>el.remove());
  specs=(specs||[]).filter(Boolean);
  if(!on||!ixReady()||!specs.length)return false;
  if(!specs.some(o=>ixTraces(o).length))return false;   /* nothing plottable: keep the drawn SVG */
  const hold=document.createElement("div");hold.className="ix-svg-hold";hold.style.display="none";
  while(box.firstChild)hold.appendChild(box.firstChild);
  box.appendChild(hold);
  const made=[];
  specs.forEach(o=>{
    const d=document.createElement("div");d.className="ix-plot";box.appendChild(d);
    try{
      /* newPlot finishes asynchronously. If the figure is replaced or released
         before it settles, the remainder of that promise has nothing to work on;
         the rejection is swallowed here instead of surfacing as a page error. */
      const pr=Plotly.newPlot(d,ixTraces(o),ixLayout(o),{responsive:true,displaylogo:false,
        modeBarButtonsToRemove:["lasso2d","select2d"],
        toImageButtonOptions:{format:"svg",filename:"chart",width:o.width||880,height:o.height||440}});
      if(pr&&pr.then)pr.then(null,()=>{});
      made.push(d);IX_MOUNTED.push(d);
    }catch(e){console.error("interactive chart:",e);d.remove();}
  });
  if(!made.length){ // put the drawn SVG back
    while(hold.firstChild)box.insertBefore(hold.firstChild,hold);hold.remove();return false;
  }
  return true;
}