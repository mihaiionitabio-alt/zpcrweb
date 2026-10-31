w=>{
    const t=cur?cur+" "+w:w;
    if(pdfWidth(t,size,bold)<=width)cur=t;
    else{if(cur)lines.push(cur);cur="";for(const char of w){if(cur&&pdfWidth(cur+char,size,bold)>width){lines.push(cur);cur="";}cur+=char;}}
  }