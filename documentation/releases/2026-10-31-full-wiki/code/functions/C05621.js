r=>({code:r.code,name:EDS.flagName(r.code),description:(EDS.FLAGS[r.code]||[])[1]||"",
      name_confirmed:(EDS.FLAGS[r.code]||[])[2]?"yes":"inferred",criteria:r.criteria,enabled:r.enabled,auto_omit:r.omitEnabled,
      wells_flagged:p.plate.wells.filter(w=>w.flags.some(f=>f.code===r.code)).map(w=>w.pos).join(" ")})