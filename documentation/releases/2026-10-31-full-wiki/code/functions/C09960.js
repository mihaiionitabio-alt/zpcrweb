function(){
 if(!maraProfileActive())return next();
 const rows=maraRuleRows();
 return `<details class="sop-sec" open><summary>${esc(ui('0 · Method, procedure and interpretation'))}</summary><p class="notice warn">${esc(ui('Review only — no release decision'))}</p><div class="kv mara-profile-grid">${rows.map(r=>`<b>${esc(r.rule)}</b><span style="overflow-wrap:anywhere" data-i18n-skip>${esc(r.value)}</span>`).join('')}</div><h4>${esc(ui('Unresolved rules'))}</h4><ul>${maraGaps().map(x=>`<li>${esc(ui(x))}</li>`).join('')}</ul></details>`;
}