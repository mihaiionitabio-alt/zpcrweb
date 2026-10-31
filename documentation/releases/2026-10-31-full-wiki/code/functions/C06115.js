function ssNameAnnotations(){
  const enabled=$("#ss-names-enable").checked;
  $("#ss-names-options").hidden=!enabled;
  if(!enabled){SAMPLE_SELECTION.rows.forEach(r=>{r.nameReview=null;r.namePattern="";});$("#ss-names-note").textContent="";return;}
  const learned=ssLearnNames(SAMPLE_SELECTION.rows,$("#ss-names-scope").value,$("#ss-names-sensitivity").value);
  SAMPLE_SELECTION.rows.forEach(r=>{r.nameReview=learned.out.get(r.key);r.namePattern=r.nameReview.group;});
  const n=SAMPLE_SELECTION.rows.filter(r=>r.nameReview.kind==="unusual").length;
  $("#ss-names-note").textContent=`${n} sample(s) have less common name patterns. Numbers are treated as identifier slots (#); words and separators define the learned templates. Controls stay separate. Suggestions do not exclude samples. `
    +learned.models.filter(m=>m.ready).slice(0,4).map(m=>`${m.scope}: ${m.common.join("; ")}`).join(" · ");
}