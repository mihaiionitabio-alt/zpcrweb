ci=>{
        const cyc=cycles[ci];
        if(!cyc||!cyc.length)return {channel:ci,median:null};
        const rises=pos.map(p=>{
          const v=cyc.map(c=>channels[ci][c][p]).filter(Number.isFinite);
          return v.length?Math.max(...v)-Math.min(...v):0;
        }).sort((x,y)=>x-y);
        return {channel:ci,median:rises[Math.floor(rises.length/2)],
          name:(acquisitionChannels[ci]||{}).name||("channel "+ci)};
      }