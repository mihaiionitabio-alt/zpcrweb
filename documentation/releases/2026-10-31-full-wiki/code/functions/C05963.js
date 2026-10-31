()=>{
    const have=new Set(SOP.targets.map(t=>t.match));
    const found=uniq(RUNS.flatMap(r=>(r.wells||[]).map(w=>w.target||"")).filter(Boolean)).filter(t=>!have.has(t));
    const star=SOP.targets.findIndex(t=>t.match==="*"||t.match==="");
    const rows=found.map(t=>{const w=RUNS.flatMap(r=>r.wells).find(x=>x.target===t)||{};const s=sopTargetSpec(w);
      return {match:t,kind:s.kind,cqMax:s.cqMax??40,cqLate:s.cqLate??"",quantMin:s.quantMin??"",lateOutcome:s.lateOutcome||"Inconclusive"};});
    SOP.targets.splice(star<0?SOP.targets.length:star,0,...rows);sopProfileEdited(true);
  }