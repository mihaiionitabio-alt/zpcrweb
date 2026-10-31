(){
      cur={ops:[],uses:[]};pages.push(cur);d.y=PDF_PAGE.h-PDF_PAGE.margin;
      if(style.header)style.header(d,rawText);
      return cur;
    }