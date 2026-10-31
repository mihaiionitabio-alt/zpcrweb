r=>{
    const automaticCategory=[...r.counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0][0];
    const override=REVIEW_STATE.controlCategoryOverrides[r.key]||"";
    return {key:r.key,root:r.root,variants:[...r.variants].sort((a,b)=>a.localeCompare(b)),
      automaticCategory,category:override||automaticCategory,override};
  }