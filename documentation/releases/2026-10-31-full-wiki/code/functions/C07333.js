(v,i)=>rows.push({experiment:run.meta.name||run.file,well:w.well,sample:w.sample||"",
      target:w.target||"",role:w.role||"",cycle:i+1,raw:v,baseline_subtracted:v-base})