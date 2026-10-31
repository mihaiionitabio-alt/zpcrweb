(c,i)=>({index:c.index,gain:c.gain,
    before:segs[i].level,after:segs[i+1].level,
    beforeMean:segs[i].mean,afterMean:segs[i+1].mean,
    nBefore:segs[i].to-segs[i].from,nAfter:segs[i+1].to-segs[i+1].from})