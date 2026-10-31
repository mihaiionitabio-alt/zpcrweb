el=>{
    if(el.closest("[data-i18n-skip]"))return;
    let originals=I18N_ORIGINAL_ATTR.get(el);
    if(!originals){originals={};for(const a of ["placeholder","title","aria-label"])if(el.hasAttribute(a))originals[a]=el.getAttribute(a);
      I18N_ORIGINAL_ATTR.set(el,originals);}
    for(const [a,v] of Object.entries(originals)){const next=UI_LANG==="zh"?zhPhrase(v):v;if(el.getAttribute(a)!==next)el.setAttribute(a,next);}
  }