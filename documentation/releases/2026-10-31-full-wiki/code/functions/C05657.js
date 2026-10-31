w=>{
    const s=w.sample||"";if(!s||m.has(s))return;
    m.set(s,roleFromName(s)!=="Unknown"?s:`S${String(++k).padStart(2,"0")}`);
  }