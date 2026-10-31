(ws,ch)=>{const seen=new Set(),sig=ws.filter(w=>!seen.has(w.pos)&&seen.add(w.pos)).map(w=>wellSignal(w.curve));
        const row={experiment:runName(r),channel:ch,median_background:med(sig.map(s=>s.background)),median_end:med(sig.map(s=>s.end)),wells:sig.length};rows.push(row);
        if(!byCh.has(ch))byCh.set(ch,[]);byCh.get(ch).push([i,row.median_background,row.median_end]);}