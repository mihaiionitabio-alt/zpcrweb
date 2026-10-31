function ssFiltered(){const q=String($("#ss-search").value||"").toLocaleLowerCase().trim(),view=$("#ss-view").value;
  ssNameAnnotations();
  const names=$("#ss-names-enable").checked?$("#ss-names-filter").value:"all";
  return SAMPLE_SELECTION.rows.filter(r=>(names==="all"||r.nameReview.kind===names)&&(!q||[r.sample,r.experiment,r.date,r.roles.join(" "),r.targets.join(" ")].join(" ").toLocaleLowerCase().includes(q))
    &&(view==="all"||(view==="excluded")===SAMPLE_SELECTION.draft.has(r.key)));}