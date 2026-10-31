w=>{
    if(!w||!Array.isArray(w.curve)||!Number.isFinite(Number(w.channel)))return false;
    if(sampleName&&String(w.sample||"")!==String(sampleName))return false;
    if(!selectedKey||selectedKey===ORPHAN_CURVE_KEY)return true;
    return [w.analysisUid,w.analysis,w.target].some(v=>String(v||"")===selectedKey);
  }