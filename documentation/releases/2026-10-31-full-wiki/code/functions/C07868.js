(v,i)=>rows.push({experiment:runName(run),well:w.well,
    sample:exportName(w.sample),target:w.target,analysis:w.analysis,channel_index:w.channel,
    filter:w.filterComb||w.filterName||"",role:w.role,call:w.call,signal:curveSignal(run),cycle:i+1,fluorescence:v})