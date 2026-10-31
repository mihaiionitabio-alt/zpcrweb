(){
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