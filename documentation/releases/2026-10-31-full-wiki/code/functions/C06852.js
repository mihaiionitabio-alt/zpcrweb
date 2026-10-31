g=>{
    const mine=shown.filter(r=>r.d.group===g.id&&(!onlyAttention||r.st.level==="warn"||r.st.level==="bad"));
    const missing=results.filter(r=>r.d.group===g.id&&!shown.includes(r)),notHere=CC_CHARTS.filter(d=>d.group===g.id&&!d.inst.includes(platform));
    return `<div class="cc-group"><h3>${esc(ui(g.title))} <span class="hint">${esc(ui(g.sub))}</span></h3>
      <div class="cc-grid">${mine.map(r=>`<button class="cc-tile ${r.enabled?"":"off"}" data-cc="${r.d.id}" type="button">
        <span class="cc-top"><i style="background:${CC_COL[r.enabled?r.st.level:"none"]}"></i><b>${esc(r.d.code)}</b><span>${esc(ui(r.d.type==="funnel"?"funnel":(ccCfg(r.d.id).type||r.d.type).toUpperCase()))}</span></span>
        <span class="cc-title">${esc(ui(r.d.title))}${r.variant?` · ${esc(r.variant)}`:""}</span>
        ${r.d.type==="funnel"?`<span class="cc-fun">${esc(ui("by operator"))}</span>`:ccSpark(r.res,r.st)}
        <span class="cc-foot">${r.st.last!=null&&Number.isFinite(r.st.last)?`<b>${fmtTick(+Number(r.st.last).toPrecision(4))}</b> <span>${esc(r.d.unit)}</span> · `:""}<span>${esc(r.enabled?r.st.text:"alarms switched off")}</span></span></button>`).join("")
        ||`<p class="hint">${esc(ui(onlyAttention?"Nothing needs attention in this group.":"No chart in this group has data in these files."))}</p>`}</div>
      ${missing.length||notHere.length?`<details class="cc-missing"><summary>${missing.length+notHere.length} chart(s) not shown</summary>
        ${missing.length?`<p class="hint">${esc(ui("No data in these files:"))} ${missing.map(r=>esc(r.d.code+" "+r.d.title)).join(" · ")}</p>`:""}
        ${notHere.length?`<p class="hint">${esc(ui(platform==="LC"?"Only QuantStudio files carry:":"Only LightCycler files carry:"))} ${notHere.map(d=>esc(d.code+" "+d.title)).join(" · ")}</p>`:""}</details>`:""}</div>`;
  }