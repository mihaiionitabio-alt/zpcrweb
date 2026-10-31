w=>{const key=curveKey(w,mode);
    if(!legend.has(key||"Unassigned"))legend.set(key||"Unassigned",curveColour(w,mode));}