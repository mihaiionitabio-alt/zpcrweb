o=>{
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
  }