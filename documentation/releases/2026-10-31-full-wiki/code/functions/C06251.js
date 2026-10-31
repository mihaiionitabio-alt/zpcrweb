(list,t)=>{const v=list.map(r=>r.cqMean).filter(Number.isFinite).sort((a,b)=>a-b);if(!v.length)return;const m=v[Math.floor(v.length/2)];
      hl.push({y:m,label:`${t} median ${num(m,2)}`,colour:cm.get(t)});
      if(Number.isFinite(sopNum(SOP.ic.maxShift)))hl.push({y:m+sopNum(SOP.ic.maxShift),label:`${t} +${SOP.ic.maxShift}`,colour:"#b91c1c"});}