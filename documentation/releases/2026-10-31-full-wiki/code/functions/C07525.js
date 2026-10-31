w=>{
    const k=`${Number(w.channel)}|${Number(w.pos)}`,a=resultAnswers(w);
    if(a)answered.add(k);else if(!unanswered.has(k))unanswered.set(k,w);
  }