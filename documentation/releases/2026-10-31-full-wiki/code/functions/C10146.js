next=>function(){
 if(!maraProfileActive()&&!SOP.experiment_analysis)return next();
 const html=methodNarrativeHTML(SOP,UI_LANG);if(!html)return next();
 const rows=maraProfileActive()?maraRuleRows():[{rule:ui('Method'),value:SOP.name}];
 if(UI_LANG==='zh'&&SOP.analyticalRole==='identification'&&rows[0])rows[0].value='转化体定性检测';
 const gaps=maraProfileActive()?maraGaps():[UI_LANG==='zh'?'尚未实现自动计算引擎；须验证体系限值、质控及样品对应关系。':'Automatic engine is not implemented; validate assay limits, controls and sample mappings.'];
 return `<details class="sop-sec" open data-i18n-skip><summary>${esc(ui('0 · Method, procedure and interpretation'))}</summary><p class="notice warn">${esc(ui('Review only — no release decision'))}</p><div class="kv mara-profile-grid">${rows.slice(0,4).map(r=>`<b>${esc(r.rule)}</b><span>${esc(ui(r.value))}</span>`).join('')}</div>${html}<h4>${esc(ui('Unresolved rules'))}</h4><ul>${gaps.map(x=>`<li>${esc(ui(x))}</li>`).join('')}</ul></details>`;
}