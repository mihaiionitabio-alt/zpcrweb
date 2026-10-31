function pdfDoc(){
  const pages=[];let cur=null;
  const style=MISSY_HOOKS.invoke("report.style",null,[],()=>({}));
  const d={
    images:[],
    page(){
      cur={ops:[],uses:[]};pages.push(cur);d.y=PDF_PAGE.h-PDF_PAGE.margin;
      if(style.header)style.header(d,rawText);
      return cur;
    },
    get width(){return PDF_PAGE.w-2*PDF_PAGE.margin;},
    y:0,
    room(h){if(!cur)d.page();if(d.y-h<PDF_PAGE.margin+24){d.page();return false;}return true;},
    text(s,size,bold,dx,colour,literal=false){
      s=literal?String(s??""):reportDisplay(s);
      const c=colour||(style.colour?style.colour(bold):[0,0,0]);
      if(!dx&&((bold&&size>=14)||/^\d+\.\s/.test(String(s)))){
        for(const line of pdfWrap(String(s),d.width,size,bold)){d.room(size*1.4);rawText(line,size,bold,dx,c);}return;
      }
      rawText(s,size,bold,dx,c);
    },
    para(s,size,bold){
      const mapped=reportDisplay(MISSY_HOOKS.invoke('report.paragraph',null,[s],v=>v));
      const lines=style.paragraphLines?style.paragraphLines(mapped):[mapped];
      for(const line of lines)pdfWrap(line,d.width,size,bold).forEach(l=>{d.room(size*1.4);d.text(l,size,bold,0,undefined,true);});
    },
    gap(h){d.y-=h;},
    rule(){if(!cur)d.page();cur.ops.push(`0.75 0.75 0.78 RG 0.6 w ${PDF_PAGE.margin} ${d.y.toFixed(2)} m ${(PDF_PAGE.w-PDF_PAGE.margin).toFixed(2)} ${d.y.toFixed(2)} l S`);d.y-=6;},
    image(jpeg,w,h,natW,natH){
      if(!cur)d.page();
      const id=d.images.length+1;d.images.push({jpeg,w:natW,h:natH});
      cur.uses.push(id);
      cur.ops.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${PDF_PAGE.margin} ${(d.y-h).toFixed(2)} cm /Im${id} Do Q`);
      d.y-=h+8;
    },
    build(){
      /* Reserve and draw a small footer on every generated report page.  The
         footer uses PDF text operators so it works in the self-contained writer. */
      const total=pages.length;
      pages.forEach((p,i)=>{
        const y=18;
        p.ops.push(`0.72 0.76 0.82 RG 0.6 w ${PDF_PAGE.margin} ${(y+10).toFixed(2)} m ${(PDF_PAGE.w-PDF_PAGE.margin).toFixed(2)} ${(y+10).toFixed(2)} l S`);
        
        p.ops.push(`BT 0.06 0.18 0.30 rg /F1 7 Tf 1 0 0 1 ${(PDF_PAGE.w-PDF_PAGE.margin-74).toFixed(2)} ${y.toFixed(2)} Tm (${pdfStr(UI_LANG==="zh"?String(i+1)+" / "+total:"Page "+(i+1)+" of "+total)}) Tj ET`);
      });
      const enc=new TextEncoder(),chunks=[],offsets=[];let len=0;
      const put=x=>{const b=x instanceof Uint8Array?x:enc.encode(x);chunks.push(b);len+=b.length;};
      const objs=[];
      const nPages=pages.length;
      /* 1 catalog, 2 pages, 3 F1, 4 F2, then per image, then per page content + page */
      const fontExtra=pdfUnicodeObjects();const imgBase=5+fontExtra.length,pageBase=imgBase+d.images.length*1;
      objs.push(`<< /Type /Catalog /Pages 2 0 R >>`);
      objs.push(`<< /Type /Pages /Kids [${pages.map((p,i)=>`${pageBase+nPages+i} 0 R`).join(" ")}] /Count ${nPages} >>`);
      objs.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);
      objs.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`);
      objs.push(...fontExtra);
      d.images.forEach(im=>objs.push({dict:`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.jpeg.length} >>`,stream:im.jpeg}));
      pages.forEach(p=>{
        const body=enc.encode(p.ops.join("\n"));
        objs.push({dict:`<< /Length ${body.length} >>`,stream:body});
      });
      pages.forEach((p,i)=>{
        const res=`<< /Font << /F1 3 0 R /F2 4 0 R /FU 5 0 R >> ${p.uses.length?`/XObject << ${p.uses.map(u=>`/Im${u} ${imgBase+u-1} 0 R`).join(" ")} >>`:""} >>`;
        objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE.w} ${PDF_PAGE.h}] /Resources ${res} /Contents ${pageBase+i} 0 R >>`);
      });
      put("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
      objs.forEach((o,i)=>{
        offsets[i]=len;
        put(`${i+1} 0 obj\n`);
        if(typeof o==="string")put(o+"\n");
        else{put(o.dict+"\nstream\n");put(o.stream);put("\nendstream\n");}
        put("endobj\n");
      });
      const xref=len;
      let x=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`;
      offsets.forEach(o=>{x+=String(o).padStart(10,"0")+" 00000 n \n";});
      put(x);
      put(`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
      const out=new Uint8Array(len);let at=0;
      chunks.forEach(c=>{out.set(c,at);at+=c.length;});
      return out;
    }
  };
  function rawText(s,size,bold,dx,colour){
    if(!cur)d.page();const c=colour||[0,0,0];
    const unicode=pdfUnicodeNeeded(String(s));
    cur.ops.push(`BT ${c[0]} ${c[1]} ${c[2]} rg /${unicode?"FU":bold?"F2":"F1"} ${size} Tf ${unicode&&bold?"0.18 w 2 Tr":"0 Tr"} 1 0 0 1 ${(PDF_PAGE.margin+(dx||0)).toFixed(2)} ${(d.y-size).toFixed(2)} Tm ${unicode?"<"+pdfUnicodeHex(s)+">":"("+pdfStr(s)+")"} Tj ET`);
    d.y-=size*1.32;
  }
  d.page();
  return d;
}