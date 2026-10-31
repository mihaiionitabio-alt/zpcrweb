(r,pos)=>{
      const i=Math.floor(pos/C),j=pos%C,x=40+j*cell,y=44+i*cell;
      if(j===0)s+=`<text x="28" y="${y+cell/2+3}" text-anchor="middle" fill="#6b7280">${String.fromCharCode(65+i)}</text>`;
      let fill="#fff",lab="";
      if(c.metric==="outcome"){fill=r.outcome?sopColour(r.outcome):statusCol[r.status]||"#fff";if(r.outcome)used.set(sopLabel(r.outcome),fill);else if(r.status!=="Empty")used.set(r.status,fill);lab=r.cq===""?"":num(r.cq,1);}
      else if(c.metric==="status"){fill=statusCol[r.status];used.set(r.status,fill);lab=r.cq===""?"":num(r.cq,1);}
      else{const v=Number(r[c.metric]);fill=r[c.metric]===""?"#f8fafc":heatColour(v,lo,hi);lab=r[c.metric]===""?"":fmtTick(+v.toPrecision(3));}
      const dark=/^#(1|0|9f|e11|dc|7c|64)/.test(fill);
      s+=`<rect x="${x+1}" y="${y+1}" width="${cell-2}" height="${cell-2}" rx="4" fill="${fill}" stroke="${r.status==="Signal, not analysed"?"#b45309":"#cbd5e1"}" stroke-width="${r.status==="Signal, not analysed"?2:1}"><title>${svgEsc(graphHoverLabel(run,r,`${r.target}\nCq ${r.cq}\n${r.outcome||r.status}`))}</title></rect>`;
      if(cell>=34)s+=`<text x="${x+cell/2}" y="${y+cell/2+3}" text-anchor="middle" fill="${dark?"#fff":"#111827"}">${svgEsc(lab)}</text>`;
    }