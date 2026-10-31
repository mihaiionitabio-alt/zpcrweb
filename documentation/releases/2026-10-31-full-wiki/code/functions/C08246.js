function selTableBlock(doc,rows,note,options={}){
  if(!rows||!rows.length){doc.para("No rows.",9.5,false);return;}
  const cols=options.columns||uniq(rows.flatMap(Object.keys)).slice(0,8);
  const shown=options.full?rows:rows.slice(0,SEL_TABLE_ROWS);
  const size=8.5,gap=6;
  const wid=cols.map(c=>{
    let w=pdfWidth(reportDisplay(c),size,true);
    shown.forEach(r=>{w=Math.max(w,pdfWidth(reportTableValue(c,r[c]),size,false));});
    return w;
  });
  /* Water-filling: a column never takes more than it needs, and a column that needs
     more than its share only gets the room the others did not use. Scaling every column
     by one factor would spend the page on whichever column happens to be widest. */
  let room=doc.width-gap*(cols.length-1);
  const widths=wid.slice();
  if(wid.reduce((a,b)=>a+b,0)>room){
    let left=room,open=cols.map((c,i)=>i);
    for(let pass=0;pass<8&&open.length;pass++){
      const share=left/open.length,done=[];
      open.forEach(i=>{if(wid[i]<=share){widths[i]=wid[i];left-=wid[i];done.push(i);}});
      if(!done.length){open.forEach(i=>{widths[i]=left/open.length;});break;}
      open=open.filter(i=>!done.includes(i));
    }
  }
  const line=(vals,bold)=>{
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
  };
  line(cols.map(reportDisplay),true);
  doc.rule();
  shown.forEach(r=>line(cols.map(c=>{
    const v=r[c];
    return typeof v==="number"?String(+v.toPrecision(6)):reportTableValue(c,v);
  }),false));
  doc.gap(2);
  const left=rows.length-shown.length;
  doc.para(left>0?`${rows.length} rows in total; the first ${shown.length} are shown. The archive carries all of them.`
                 :`${rows.length} row${rows.length===1?"":"s"}.`,8,false);
  if(note)doc.para(note,8,false);
}