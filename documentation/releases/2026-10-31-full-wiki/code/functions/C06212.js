o=>{const col=catColour(cm,`${o.well}${o.filterComb?" · "+o.filterComb:""}`);
      o.curve.forEach((v,i)=>rows.push({well:o.well,sample:o.sample,channel:o.filterComb||o.filterName||o.channel,cycle:i+1,fluorescence:v,finding:o.finding}));
      return {type:"line",colour:col,data:o.curve.map((v,i)=>[i+1,v]),tip:graphHoverLabel(c.run,o,o.finding)};}