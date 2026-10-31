(lines,i)=>{
      lines.forEach((value,j)=>{doc.y=top-j*leading;doc.text(value,size,bold,x,undefined,true);});
      x+=widths[i]+gap;
    }