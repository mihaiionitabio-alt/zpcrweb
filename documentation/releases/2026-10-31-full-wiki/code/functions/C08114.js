(p,i)=>{
        const y=18;
        p.ops.push(`0.72 0.76 0.82 RG 0.6 w ${PDF_PAGE.margin} ${(y+10).toFixed(2)} m ${(PDF_PAGE.w-PDF_PAGE.margin).toFixed(2)} ${(y+10).toFixed(2)} l S`);
        
        p.ops.push(`BT 0.06 0.18 0.30 rg /F1 7 Tf 1 0 0 1 ${(PDF_PAGE.w-PDF_PAGE.margin-74).toFixed(2)} ${y.toFixed(2)} Tm (${pdfStr(UI_LANG==="zh"?String(i+1)+" / "+total:"Page "+(i+1)+" of "+total)}) Tj ET`);
      }