r=>`<button class="cc-tile ${r.enabled?"":"off"}" data-cc="${r.d.id}" type="button">
        <span class="cc-top"><i style="background:${CC_COL[r.enabled?r.st.level:"none"]}"></i><b>${esc(r.d.code)}</b><span>${esc(ui(r.d.type==="funnel"?"funnel":(ccCfg(r.d.id).type||r.d.type).toUpperCase()))}</span></span>
        <span class="cc-title">${esc(ui(r.d.title))}${r.variant?` · ${esc(r.variant)}`:""}</span>
        ${r.d.type==="funnel"?`<span class="cc-fun">${esc(ui("by operator"))}</span>`:ccSpark(r.res,r.st)}
        <span class="cc-foot">${r.st.last!=null&&Number.isFinite(r.st.last)?`<b>${fmtTick(+Number(r.st.last).toPrecision(4))}</b> <span>${esc(r.d.unit)}</span> · `:""}<span>${esc(r.enabled?r.st.text:"alarms switched off")}</span></span></button>`