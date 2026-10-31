function rawText(s,size,bold,dx,colour){
    if(!cur)d.page();const c=colour||[0,0,0];
    const unicode=pdfUnicodeNeeded(String(s));
    cur.ops.push(`BT ${c[0]} ${c[1]} ${c[2]} rg /${unicode?"FU":bold?"F2":"F1"} ${size} Tf ${unicode&&bold?"0.18 w 2 Tr":"0 Tr"} 1 0 0 1 ${(PDF_PAGE.margin+(dx||0)).toFixed(2)} ${(d.y-size).toFixed(2)} Tm ${unicode?"<"+pdfUnicodeHex(s)+">":"("+pdfStr(s)+")"} Tj ET`);
    d.y-=size*1.32;
  }