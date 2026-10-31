([k,v])=>{
    const values=Array.isArray(v)?(v.length?v.map(String):["none"]):[String(v==null?"none":v)];
    const lines=values.flatMap(x=>pdfWrap(["Figure coverage","Table coverage"].includes(k)?reportDisplay(x):x,valueW,size,false));
    doc.room(line+4);
    doc.text(k,size,true);doc.y+=line;
    lines.forEach(x=>{if(!doc.room(line)){doc.text(k+" (continued)",size,true);doc.y+=line;}doc.text(x,size,false,labelW,undefined,true);});
  }