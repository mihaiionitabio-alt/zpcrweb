([key,sp])=>{const L=k=>sp.filter(p=>Number.isFinite(p[k])).map(p=>[p.x,p[k]]),c=bySeg?segColour(segCol,key):null;
    series.push({type:"line",colour:c||"#475569",dash:"6 4",width:1.2,data:L("ucl")},{type:"line",colour:c||"#475569",dash:"6 4",width:1.2,data:L("lcl")},
      {type:"line",colour:c||"#16a34a",width:1.2,data:L("cl")});}