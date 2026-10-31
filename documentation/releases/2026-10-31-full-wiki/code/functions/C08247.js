c=>{
    let w=pdfWidth(reportDisplay(c),size,true);
    shown.forEach(r=>{w=Math.max(w,pdfWidth(reportTableValue(c,r[c]),size,false));});
    return w;
  }