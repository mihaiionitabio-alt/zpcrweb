d=>{
        const cfg=ccCfg(d.id);if(cfg.enabled===false)return;
        const vs=ccVariants(d,rows);(vs.length?vs:[""]).forEach(v=>{
          let res;try{res=ccCompute(d,rows,v);}catch(e){return;}
          const st=ccStatus(res);if(st.level!=="bad"&&st.level!=="warn")return;
          const pts=res.pts.filter(p=>Number.isFinite(p.y)&&!p.pre),last=pts[pts.length-1];
          if(!last)return;
          const lim=Number.isFinite(last.lcl)&&Number.isFinite(last.ucl)
            ? `limits ${fmtTick(+last.lcl.toPrecision(4))} – ${fmtTick(+last.ucl.toPrecision(4))}`:"no limits yet";
          const sp=res.spec||{},spec=[Number.isFinite(sp.lo)?`≥ ${fmtTick(sp.lo)}`:"",Number.isFinite(sp.hi)?`≤ ${fmtTick(sp.hi)}`:""].filter(Boolean).join(" and ");
          items.push({kind:"chart",sev:st.level==="bad"?"alarm":"watch",code:d.code,title:d.title+(v?" · "+v:""),
            value:fmtTick(+Number(st.last!==undefined?st.last:last.y).toPrecision(4)),unit:d.unit||"",
            limits:lim+(spec?`  ·  specification ${spec}`:""),state:st.text,
            evidence:`${key} · ${pts.length} run(s) in this chart · last run ${last.row&&last.row.date?sopFmtTime(last.row.date).slice(0,10):"unknown date"}`,
            chartId:d.id,variant:v,instrument:key,
            actions:[{key:"3",label:MG.chart?"Hide the chart":"Show the chart",cmd:"chart"}]});
        });
      }