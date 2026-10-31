(c){
    const run=c.run,R=run.rows||8,C=run.cols||12,cell=Math.max(26,Math.min(64,Math.floor(760/C))),W=60+C*cell+190,H=46+R*cell+20;
    const tch=c.target?new Set(ssWells(run).filter(w=>(w.target||w.analysis)===c.target).map(w=>w.channel)):null;
    const orph=orphanCurveCandidates(run).filter(o=>ssPositionIncluded(run,o.pos)&&!tch||tch.has(o.channel));
    const orphPos=new Set(orph.map(o=>o.pos));
    const rows=[],vals=[];
    for(let pos=0;pos<R*C;pos++){
      if(!ssPositionIncluded(run,pos)){rows.push({well:posToWell(pos,C),sample:((run.plate||{})[pos]||{}).name||"",status:"Excluded from analysis",selection:"excluded"});continue;}
      const rec=(run.plate||{})[pos]||{},ws=ssWells(run).filter(w=>w.pos===pos&&(!c.target||(w.target||w.analysis)===c.target));
      const w=ws[0],sig=wellSignal(w?w.curve:(orph.find(o=>o.pos===pos)||{}).curve);
      const res=w?sopOutcomeFor(run,w):null;
      const other=!ws.length&&c.target&&ssWells(run).some(x=>x.pos===pos);
      const status=ws.length?(ws.every(sopOmitted)?"Omitted":"In analysis"):orphPos.has(pos)?"Signal, not analysed":other?"Other target only":rec.name?"Named, no result":"Empty";
      const row={well:posToWell(pos,C),sample:rec.name||(w&&w.sample)||"",target:uniq(ws.map(x=>x.target)).join(" | "),
        cq:w&&Number.isFinite(sopCq(w))?+sopCq(w).toFixed(3):"",outcome:res?res.outcome:"",status,
        end_fluorescence:Number.isFinite(sig.end)?+sig.end.toPrecision(6):"",background:Number.isFinite(sig.background)?+sig.background.toPrecision(6):"",
        amplitude:Number.isFinite(sig.amplitude)?+sig.amplitude.toPrecision(6):"",flags:ws.map(x=>x.warnCodes).filter(Boolean).join(" ")};
      rows.push(row);
      const m=c.metric;if(m==="cq"||m==="end_fluorescence"||m==="background"||m==="amplitude")vals.push(Number(row[m]===""?NaN:row[m]));
    }
    const [lo,hi]=extent(vals,0);
    const statusCol={"Other target only":"#f1f5f9","In analysis":"#bfdbfe","Omitted":"#fecaca","Signal, not analysed":"#f59e0b","Named, no result":"#e5e7eb","Empty":"#ffffff"};
    const used=new Map();
    let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="system-ui,Arial" font-size="10"><rect width="${W}" height="${H}" fill="#fff"/>
      <text x="10" y="16" font-size="13" font-weight="600">${svgEsc(runName(run))} — ${svgEsc(GRAPH_METRICS[c.metric]||c.metric)}${c.target?" · "+svgEsc(c.target):""}</text>`;
    for(let j=0;j<C;j++)s+=`<text x="${40+j*cell+cell/2}" y="38" text-anchor="middle" fill="#6b7280">${j+1}</text>`;
    rows.forEach((r,pos)=>{
      const i=Math.floor(pos/C),j=pos%C,x=40+j*cell,y=44+i*cell;
      if(j===0)s+=`<text x="28" y="${y+cell/2+3}" text-anchor="middle" fill="#6b7280">${String.fromCharCode(65+i)}</text>`;
      let fill="#fff",lab="";
      if(c.metric==="outcome"){fill=r.outcome?sopColour(r.outcome):statusCol[r.status]||"#fff";if(r.outcome)used.set(sopLabel(r.outcome),fill);else if(r.status!=="Empty")used.set(r.status,fill);lab=r.cq===""?"":num(r.cq,1);}
      else if(c.metric==="status"){fill=statusCol[r.status];used.set(r.status,fill);lab=r.cq===""?"":num(r.cq,1);}
      else{const v=Number(r[c.metric]);fill=r[c.metric]===""?"#f8fafc":heatColour(v,lo,hi);lab=r[c.metric]===""?"":fmtTick(+v.toPrecision(3));}
      const dark=/^#(1|0|9f|e11|dc|7c|64)/.test(fill);
      s+=`<rect x="${x+1}" y="${y+1}" width="${cell-2}" height="${cell-2}" rx="4" fill="${fill}" stroke="${r.status==="Signal, not analysed"?"#b45309":"#cbd5e1"}" stroke-width="${r.status==="Signal, not analysed"?2:1}"><title>${svgEsc(graphHoverLabel(run,r,`${r.target}\nCq ${r.cq}\n${r.outcome||r.status}`))}</title></rect>`;
      if(cell>=34)s+=`<text x="${x+cell/2}" y="${y+cell/2+3}" text-anchor="middle" fill="${dark?"#fff":"#111827"}">${svgEsc(lab)}</text>`;
    });
    let ly=46;const lx=40+C*cell+16;
    if(c.metric==="outcome"||c.metric==="status")used.forEach((col,l)=>{s+=`<rect x="${lx}" y="${ly}" width="12" height="12" rx="2" fill="${col}" stroke="#cbd5e1"/><text x="${lx+18}" y="${ly+10}" fill="#374151" font-size="11">${svgEsc(l)}</text>`;ly+=18;});
    else{for(let k=0;k<=5;k++){const v=lo+(hi-lo)*k/5;s+=`<rect x="${lx}" y="${ly}" width="12" height="12" fill="${heatColour(v,lo,hi)}" stroke="#cbd5e1"/><text x="${lx+18}" y="${ly+10}" font-size="11">${fmtTick(+v.toPrecision(3))}</text>`;ly+=18;}}
    return {svg:s+"</svg>",rows};
  }