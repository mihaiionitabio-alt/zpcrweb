(e,i)=>{const y=top+i*rh;s+=`<text x="${left-8}" y="${y+13}" text-anchor="end" fill="${e.status==="Rejected"?"#b91c1c":"#111827"}">${svgEsc(runName(e.run).slice(0,40))}</text>`;
      crit.forEach((c,j)=>{const mine=e.criteria.filter(x=>x.criterion.replace(/ — .*/,"")===c);
        const st=mine.some(x=>x.status==="fail")?"fail":mine.some(x=>x.status==="review")?"review":mine.some(x=>x.status==="pass")?"pass":"n/a";
        s+=`<rect x="${left+j*cw+1}" y="${y+1}" width="${cw-2}" height="${rh-2}" rx="3" fill="${col[st]}"><title>${svgEsc(runName(e.run)+"\n"+c+": "+st+"\n"+mine.map(x=>x.evidence).join("\n"))}</title></rect>`;
        rows.push({experiment:runName(e.run),criterion:c,status:st,evidence:mine.map(x=>x.evidence).join(" | ")});});}