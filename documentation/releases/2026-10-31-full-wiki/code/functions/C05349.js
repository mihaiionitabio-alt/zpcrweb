a=>{
      const pos=uniq(wells.filter(w=>w.analysisUid===a.uid).map(w=>w.pos));
      if(pos.length<3)return;
      const profile=chIdx.map(ci=>{
        const cyc=cycles[ci];
        if(!cyc||!cyc.length)return {channel:ci,median:null};
        const rises=pos.map(p=>{
          const v=cyc.map(c=>channels[ci][c][p]).filter(Number.isFinite);
          return v.length?Math.max(...v)-Math.min(...v):0;
        }).sort((x,y)=>x-y);
        return {channel:ci,median:rises[Math.floor(rises.length/2)],
          name:(acquisitionChannels[ci]||{}).name||("channel "+ci)};
      }).filter(x=>x.median!=null);
      a.channelProfile=profile;
      const own=profile.find(x=>x.channel===a.channelIdx);
      const best=profile.reduce((m,x)=>(!m||x.median>m.median)?x:m,null);
      /* only meaningful when the winner is clearly ahead and there is real signal at all */
      /* A larger rise in another channel does NOT prove the analysis reads the wrong one:
         a bright dye bleeds into neighbouring channels, and a control present in every well
         raises its own channel everywhere. Without colour compensation the two cannot be
         separated, so this is reported as "not verifiable from the data", not as an error.
         The threshold is deliberately high to keep it rare. */
      a.channelSignal=(own&&best&&best.channel!==a.channelIdx&&best.median>2*own.median&&best.median>200)
        ? {reading:own,strongest:best,ratio:best.median/Math.max(1,own.median)} : null;
    }