async()=>{
    const button=$("#g-dl-all"),label=button.textContent;button.disabled=true;button.textContent="Preparing graphs…";
    try{await new Promise(r=>setTimeout(r,0));withExportNames(graphAllZip);}
    catch(e){console.error(e);alert("Graph export failed: "+e.message);}
    finally{button.disabled=false;button.textContent=label;}
  }