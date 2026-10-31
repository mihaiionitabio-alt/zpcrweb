(p,i)=>{
        const res=`<< /Font << /F1 3 0 R /F2 4 0 R /FU 5 0 R >> ${p.uses.length?`/XObject << ${p.uses.map(u=>`/Im${u} ${imgBase+u-1} 0 R`).join(" ")} >>`:""} >>`;
        objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE.w} ${PDF_PAGE.h}] /Resources ${res} /Contents ${pageBase+i} 0 R >>`);
      }