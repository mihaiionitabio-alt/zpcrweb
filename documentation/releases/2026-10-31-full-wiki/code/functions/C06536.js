(ws,ch)=>{const seen=new Set(),sig=ws.filter(w=>!seen.has(w.pos)&&seen.add(w.pos)).map(w=>wellSignal(w.curve));
    bg[ch]=ccMedian(sig.map(s=>s.background));pl[ch]=ccMedian(sig.map(s=>s.end));}