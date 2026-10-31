function pdfWrap(text,width,size,bold){
  const words=String(text==null?"":text).split(/\s+/).filter(Boolean),lines=[];let cur="";
  words.forEach(w=>{
    const t=cur?cur+" "+w:w;
    if(pdfWidth(t,size,bold)<=width)cur=t;
    else{if(cur)lines.push(cur);cur="";for(const char of w){if(cur&&pdfWidth(cur+char,size,bold)>width){lines.push(cur);cur="";}cur+=char;}}
  });
  if(cur)lines.push(cur);
  return lines.length?lines:[""];
}