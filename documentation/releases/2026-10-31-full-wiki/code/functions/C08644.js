function mlAdvisoryBody(token){
  const ctx=ML_PANELS.get(token);
  if(!ctx)return mlNote("This panel's context is no longer available. Press Recompute.");
  const res=ctx.res;
  try{
    const S=mlSeries(res);
    /* The funnel plot is declined outright, and that means the WHOLE layer:
       revision 2 declined the series panels and then carried on into the
       multivariate ones, which made the stated scope untrue. */
    if(S.funnel)return mlNote(S.why);
    const parts=[];
    const cohort=mlCohort(res,ctx);
    parts.push(mlCohortNote(cohort));
    if(!S.ok)parts.push(mlNote(S.why));
    else{
      if(S.segment)parts.push(mlNote("Control material charted in the three panels below: "+S.segment+"."));
      const a=mlPanelForecast(res,S),b=mlPanelChange(res,S),c=mlPanelAnomaly(res,S);
      parts.push(`<h4>${esc(ui("Where the next runs land"))}</h4>${a.html}`,
        `<h4>${esc(ui("When the level moved"))}</h4>${b.html}`,
        `<h4>${esc(ui("Runs that stand out"))}</h4>${c.html}`);
    }
    /* Two populations, named. The panels above are the current control-material
       extract where there is one; the panels below are every run in the cohort,
       because a decomposition over several metrics needs the runs that have
       them. The scope is part of the cache identity. */
    const scope=S.ok&&S.segmentKey?"all extracts":"whole cohort";
    const mv=mlMultivariate(cohort,scope);
    const scopeNote=S.ok&&S.segmentKey
      ?mlWarn(`The panels from here on are computed over ALL ${cohort.n} run(s) in the cohort, including the earlier control-material extracts that the three panels above set aside. They describe a different population; a difference between the two is not a finding about either.`)
      :"";
    parts.push(mlPanelMulti(mv,cohort,scopeNote),mlPanelClusters(mv),mlPanelDrivers(mv));
    parts.push(mlNote(`${ML_VERSION} · SOP profile ${SOP.name} v${SOP.version} sha256 ${sopHash()} · cohort ${cohort.instrument}${cohort.protocol?" / "+cohort.protocol:""} · multivariate scope: ${scope} · input key ${mv.fingerprint} (an 8-character digest of the full dependency key, shown for reference; the cache compares the key itself) · deterministic: the same inputs give the same output.`));
    return parts.join("");
  }catch(e){
    console.error("advisory analytics",e);
    return mlNote("The advisory layer could not be computed for this chart ("+(e&&e.message||"unknown reason")+"). The chart itself, its limits and its alarms are unaffected.");
  }
}