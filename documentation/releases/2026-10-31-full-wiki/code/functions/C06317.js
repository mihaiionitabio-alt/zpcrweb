(){
    const all=gByDate(sopEvaluateAll(),e=>e.run);if(!all.length)return {svg:svgMessage("No runs."),rows:[]};
    const crit=uniq(all.flatMap(e=>e.criteria.map(c=>c.criterion.replace(/ — .*/,""))));
    const cw=Math.max(28,Math.min(90,600/crit.length)),rh=18,left=300,top=150,W=left+crit.length*cw+160,H=top+all.length*rh+20;
    const col={pass:"#86efac",review:"#fcd34d",fail:"#f87171","n/a":"#e5e7eb"};
    let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="system-ui,Arial" font-size="10.5"><rect width="${W}" height="${H}" fill="#fff"/><text x="10" y="18" font-size="13" font-weight="600">${svgEsc(SOP.name)} v${svgEsc(SOP.version)}</text>`;
    crit.forEach((c,j)=>{const x=left+j*cw+cw/2;s+=`<text transform="translate(${x+3} ${top-6}) rotate(-50)" fill="#374151">${svgEsc(c)}</text>`;});
    const rows=[];
    all.forEach((e,i)=>{const y=top+i*rh;s+=`<text x="${left-8}" y="${y+13}" text-anchor="end" fill="${e.status==="Rejected"?"#b91c1c":"#111827"}">${svgEsc(runName(e.run).slice(0,40))}</text>`;
      crit.forEach((c,j)=>{const mine=e.criteria.filter(x=>x.criterion.replace(/ — .*/,"")===c);
        const st=mine.some(x=>x.status==="fail")?"fail":mine.some(x=>x.status==="review")?"review":mine.some(x=>x.status==="pass")?"pass":"n/a";
        s+=`<rect x="${left+j*cw+1}" y="${y+1}" width="${cw-2}" height="${rh-2}" rx="3" fill="${col[st]}"><title>${svgEsc(runName(e.run)+"\n"+c+": "+st+"\n"+mine.map(x=>x.evidence).join("\n"))}</title></rect>`;
        rows.push({experiment:runName(e.run),criterion:c,status:st,evidence:mine.map(x=>x.evidence).join(" | ")});});});
    return {svg:s+"</svg>",rows};
  }