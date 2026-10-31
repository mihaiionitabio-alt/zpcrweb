(r,i)=>{
      const m=meta[i]||{},ok=true;
      out.push(mgIt({kind:"file",sev:r.acqError?"watch":"ok",pict:MG_PICT.file,kindWord:"file",
        code:"F"+(i+1),title:m.experiment||r.file||("Experiment "+(i+1)),
        value:String(m.quantification_results||0),unit:"stored results",
        limits:`${mgTxt(m.plate)} plate · ${mgTxt(m.cycles)} cycles · ${m.curves_decoded||0} curves`,
        state:r.acqError?("Fluorescence could not be read: "+r.acqError)
              :r.isTemplate?"Template or unrun experiment — plate setup, protocol and analysis settings only."
              :"File decoded; stored values are ready for review.",
        evidence:`${mgTxt(m.platform)} · ${m.instrument||"instrument not named"} · ${m.run_started||m.experiment_created||"no date"}`,
        rows:[["File",mgTxt(r.file)],["Instrument",mgTxt(m.instrument)],["Software",mgTxt(m.software_version)],
              ["Operator",mgTxt(m.operator)],["Run started",mgTxt(m.run_started)],["Run ended",mgTxt(m.run_ended)],
              ["Run minutes",mgTxt(m.run_duration_minutes)],["Channels",mgTxt(m.channels)],
              ["Analyses",String(m.analyses||0)],["Melting results",String(m.melting_results||0)],
              ["Bytes",m.source_bytes?Number(m.source_bytes).toLocaleString():"—"]],
        actions:[{key:"3",label:"Choose experiment files",cmd:"choose files"}]}));
    }