(i,k)=>{const s=wellSignal(i.w.curve),x=keys.indexOf(i.key),j=((k*29)%19-9)/60;
      bg.push([x-0.18+j,s.background,graphHoverLabel(c.run,i.w,`background ${num(s.background,1)}${i.outside?" (outside analyses)":""}`),i.outside?"#f59e0b":"#60a5fa"]);
      end.push([x+0.18+j,s.end,graphHoverLabel(c.run,i.w,`end ${num(s.end,1)}${i.outside?" (outside analyses)":""}`),i.outside?"#b45309":"#1d4ed8"]);
      rows.push({channel:i.key,well:i.w.well,sample:i.w.sample||"",outside_analyses:i.outside?"yes":"",background:s.background,end_fluorescence:s.end,amplitude:s.amplitude});}