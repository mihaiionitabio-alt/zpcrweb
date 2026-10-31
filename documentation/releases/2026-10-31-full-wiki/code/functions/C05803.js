w=>{const k=`${w.sample||"(well "+w.well+")"}||${w.target||w.analysis||""}`;
    if(!groups.has(k))groups.set(k,[]);groups.get(k).push(w);}