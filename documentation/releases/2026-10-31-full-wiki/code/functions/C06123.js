function ssRender(){
  const rows=ssFiltered(),group=$("#ss-group").value,groups=new Map();rows.sort((a,b)=>String(a[group]).localeCompare(String(b[group]),undefined,{numeric:true})||a.date.localeCompare(b.date)||a.experiment.localeCompare(b.experiment)||a.sample.localeCompare(b.sample,undefined,{numeric:true}));
  rows.forEach(r=>{const k=r[group];if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);});
  const count=SAMPLE_SELECTION.rows.length,excluded=SAMPLE_SELECTION.draft.size;
  $("#ss-summary").textContent=`${count-excluded} included · ${excluded} excluded · ${rows.length} match the current filter. Replicates and targets stay together.`;
  const size=150;SAMPLE_SELECTION.page=Math.max(0,Math.min(SAMPLE_SELECTION.page,Math.max(0,Math.ceil(rows.length/size)-1)));
  const visible=new Set(rows.slice(SAMPLE_SELECTION.page*size,(SAMPLE_SELECTION.page+1)*size).map(r=>r.key));
  let html="";let gi=0;
  groups.forEach((members,name)=>{const shown=members.filter(r=>visible.has(r.key));if(!shown.length)return;const n=members.filter(r=>!SAMPLE_SELECTION.draft.has(r.key)).length;
    html+=`<tr style="background:#eef3fb"><td><input type="checkbox" data-ss-group="${gi}" ${n===members.length?"checked":""} aria-label="Include group ${esc(name)}"></td><th colspan="7" style="text-align:left">${esc(name)} <span class="hint">${n}/${members.length} included</span></th></tr>`;
    shown.forEach(r=>{const ix=SAMPLE_SELECTION.rows.indexOf(r);html+=`<tr${SAMPLE_SELECTION.draft.has(r.key)?' style="opacity:.6"':""}><td><input type="checkbox" data-ss-row="${ix}" ${SAMPLE_SELECTION.draft.has(r.key)?"":"checked"} aria-label="Include ${esc(r.sample)} in ${esc(r.experiment)}"></td><td>${esc(r.date)}</td><td>${esc(r.experiment)}</td><td>${esc(r.sample)}</td><td>${esc(r.roles.join(", "))}</td><td>${esc(r.wells.join(", "))}</td><td>${esc(r.targets.join(", "))}</td><td style="min-width:170px">${r.nameReview?`<span style="color:${r.nameReview.kind==="unusual"?"#9a4c00":"#475569"}" title="${esc(r.nameReview.reason)}">${esc(r.nameReview.group)}</span><div class="hint">${esc(r.nameReview.reason)}</div>`:"—"}</td></tr>`;});gi++;});
  $("#ss-body").innerHTML=html||'<tr><td colspan="8">No samples match this filter.</td></tr>';
  const listed=[...groups.values()].filter(g=>g.some(r=>visible.has(r.key)));
  $("#ss-body").querySelectorAll('[data-ss-group]').forEach(box=>{const g=listed[Number(box.dataset.ssGroup)],n=g.filter(r=>!SAMPLE_SELECTION.draft.has(r.key)).length;box.indeterminate=n>0&&n<g.length;box.onchange=()=>{g.forEach(r=>box.checked?SAMPLE_SELECTION.draft.delete(r.key):SAMPLE_SELECTION.draft.add(r.key));ssRender();};});
  $("#ss-body").querySelectorAll('[data-ss-row]').forEach(box=>box.onchange=()=>{const r=SAMPLE_SELECTION.rows[Number(box.dataset.ssRow)];box.checked?SAMPLE_SELECTION.draft.delete(r.key):SAMPLE_SELECTION.draft.add(r.key);ssRender();});
  $("#ss-page").textContent=`Page ${SAMPLE_SELECTION.page+1} of ${Math.max(1,Math.ceil(rows.length/size))}`;
  $("#ss-prev").disabled=SAMPLE_SELECTION.page===0;$("#ss-next").disabled=(SAMPLE_SELECTION.page+1)*size>=rows.length;
}