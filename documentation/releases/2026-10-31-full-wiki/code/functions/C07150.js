(r,i)=>{
    out.push(mgIt({kind:"results",sev:r.rejected?"alarm":(r.review?"watch":"ok"),pict:MG_PICT.run,kindWord:"run",
      code:"R"+(i+1),title:r.experiment,value:String(r.positive),unit:"positive",
      limits:`${r.negative} negative · ${r.inconclusive} inconclusive · ${r.repeat} repeat · ${r.invalid} invalid`,
      state:r.rejected?("Rejected: "+r.rejected):r.review?("For review: "+r.review):"Accepted under this profile.",
      evidence:`${r.platform} · ${mgTxt(r.run_start)}`,
      rows:[["Status",mgTxt(r.status)],["Platform",mgTxt(r.platform)],["Run start",mgTxt(r.run_start)],
            ["Run end",mgTxt(r.run_end)],["Run minutes",mgTxt(r.run_minutes)],
            ["Last change",mgTxt(r.last_change)],["Hours end to change",mgTxt(r.hours_run_end_to_last_change)],
            ["Control failed",String(r.control_fail)]]}));
  }