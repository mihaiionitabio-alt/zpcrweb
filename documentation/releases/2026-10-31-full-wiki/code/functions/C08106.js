(s,size,bold,dx,colour,literal=false){
      s=literal?String(s??""):reportDisplay(s);
      const c=colour||(style.colour?style.colour(bold):[0,0,0]);
      if(!dx&&((bold&&size>=14)||/^\d+\.\s/.test(String(s)))){
        for(const line of pdfWrap(String(s),d.width,size,bold)){d.room(size*1.4);rawText(line,size,bold,dx,c);}return;
      }
      rawText(s,size,bold,dx,c);
    }