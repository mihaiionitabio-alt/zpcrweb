se=>{
    const pts=se.data.filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1])&&(!ylog||p[1]>0));
    if(se.type==="line"){if(pts.length<2&&!pts.length)return;
      s+=`<polyline fill="none" stroke="${se.colour}" stroke-width="${se.width||1.3}" stroke-opacity="${se.opacity||0.9}"${se.dash?` stroke-dasharray="${se.dash}"`:""} points="${pts.map(p=>`${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(" ")}"><title>${svgEsc(se.tip||se.label||"")}</title></polyline>`;}
    else if(se.type==="bar"){const bw=se.barWidth||Math.max(2,pw/((x1-x0)||1)*0.7);
      pts.forEach(p=>{const base=p[2]??(ylog?Math.pow(10,y0):Math.max(y0,0));const ya=Y(p[1]),yb=Y(base);
        s+=`<rect x="${X(p[0])-bw/2+(se.offset||0)}" y="${Math.min(ya,yb)}" width="${bw}" height="${Math.abs(yb-ya)}" fill="${p[4]||se.colour}"><title>${svgEsc(p[3]||"")}</title></rect>`;});}
    else pts.forEach(p=>{s+=`<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="${se.r||3.5}" fill="${p[3]||se.colour}" fill-opacity="${se.opacity||0.85}" stroke="#fff" stroke-width="0.6"><title>${svgEsc(p[2]||se.label||"")}</title></circle>`;});
  }