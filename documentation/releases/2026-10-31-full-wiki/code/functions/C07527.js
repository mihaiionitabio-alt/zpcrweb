w=>{
    const amp=Math.max(...w.curve)-Math.min(...w.curve);
    if(Number.isFinite(amp)&&amp>0){
      const ch=Number(w.channel);allAmps.push(amp);
      if(!swingsByChannel.has(ch))swingsByChannel.set(ch,[]);swingsByChannel.get(ch).push(amp);
      if(resultCq(w)!==null){if(!finiteByChannel.has(ch))finiteByChannel.set(ch,[]);finiteByChannel.get(ch).push(amp);}
    }
  }