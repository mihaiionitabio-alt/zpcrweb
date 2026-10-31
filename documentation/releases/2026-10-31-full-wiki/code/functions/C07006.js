v=>{
          const id=d.id+"|"+v;if(seen.has(id))return;
          try{
            const res=ccCompute(d,rows,v),st=ccStatus(res),pts=res.pts.filter(p=>Number.isFinite(p.y)&&!p.pre),last=pts[pts.length-1];
            if(!last)return;
            const lim=Number.isFinite(last.lcl)&&Number.isFinite(last.ucl)?`limits ${fmtTick(+last.lcl.toPrecision(4))} – ${fmtTick(+last.ucl.toPrecision(4))}`:"no limits yet";
            gallery.push({kind:"chart",sev:st.level==="ok"?"ok":"none",code:d.code,title:d.title+(v?" · "+v:""),
              value:fmtTick(+Number(st.last!==undefined?st.last:last.y).toPrecision(4)),unit:d.unit||"",limits:lim,state:st.level==="ok"?"In control. Select Show chart to inspect the trend and limits.":"Data available; this chart is still building its baseline.",
              evidence:`${key} · ${pts.length} run(s) · chart gallery`,chartId:d.id,variant:v,instrument:key,
              actions:[{key:"3",label:"Show chart",cmd:"chart"}]});
            seen.add(id);
          }catch(e){appError("console:gallery",e);}
        }