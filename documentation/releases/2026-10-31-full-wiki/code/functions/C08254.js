(vals,bold)=>{
    const cells=vals.map((v,i)=>pdfWrap(String(v),widths[i],size,bold));
    const count=Math.max(1,...cells.map(c=>c.length)),leading=size*1.32;
    const height=count*leading+4;
    if(!doc.room(height)&&!bold){line(cols.map(reportDisplay),true);doc.rule();}
    const top=doc.y;
    let x=0;
    cells.forEach((lines,i)=>{
      lines.forEach((value,j)=>{doc.y=top-j*leading;doc.text(value,size,bold,x,undefined,true);});
      x+=widths[i]+gap;
    });
    doc.y=top-height;
  }