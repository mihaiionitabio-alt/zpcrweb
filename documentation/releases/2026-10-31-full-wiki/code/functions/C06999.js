d=>{const cfg=ccCfg(d.id);if(cfg.enabled===false)return;
        const vs=ccVariants(d,rows);(vs.length?vs:[""]).forEach(v=>{total++;
          try{if(ccStatus(ccCompute(d,rows,v)).level==="none")none++;}catch(e){}});}