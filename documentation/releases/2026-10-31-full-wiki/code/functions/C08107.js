(s,size,bold){
      const mapped=reportDisplay(MISSY_HOOKS.invoke('report.paragraph',null,[s],v=>v));
      const lines=style.paragraphLines?style.paragraphLines(mapped):[mapped];
      for(const line of lines)pdfWrap(line,d.width,size,bold).forEach(l=>{d.room(size*1.4);d.text(l,size,bold,0,undefined,true);});
    }